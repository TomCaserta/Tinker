const {ipcMain, ipcRenderer} = require('electron');
const uuid = require('node-uuid');

export class IPCProxy {
  constructor (name, wrapper) {
    this.name = name;
    this.wrapper = wrapper;
    this.listeners = new Map();
    ipcRenderer.on(this.getName(),this.handleICPMessage.bind(this));
  }

  handleICPMessage (event, message) {
    var property = message.property;
    //console.log("Wrapper message",message);
    //console.log(this.wrapper.definitions);
    if (this.wrapper.definitions.hasOwnProperty(property) && message.hasOwnProperty("ID")) {
      var args = [];
      if (message.hasOwnProperty("response")) {
        args= message.args;
      }
      var ID = message.ID;
      var listener = this.listeners.get(ID);
      if (!listener) console.error("No listener found for",ID, "with message", message);
      var definition = this.wrapper.definitions[property];
      switch (definition) {
        case IPC_TYPES.NODE_ASYNC:
        case IPC_TYPES.PROMISE:
          return this.resolvePromise(listener, message);
          break;
        case IPC_TYPES.CUSTOM:
        //console.log("__clientReceiver_"+property);
          return this.wrapper["__clientReceiver_"+property](message, this, ipcRenderer, listener);
      }
    }
    else {
      console.error("Could not find",property,"in definitions.");
    }
  }

  resolvePromise (listener, message) {
    var error = message.error;
    if (error != null) {
        listener.reject(error, message.response);
    }
    listener.resolve(message.response);
    this.listeners.delete(message.ID);
  }

  getRandomID() {
    var buffer = new Buffer(16);
    return uuid.unparse(uuid.v4(null, buffer, 0));
  }

  get(unused, prop, receiver) {
    var target = this.wrapper;
    var dictionary = target.definitions;
    if (dictionary.hasOwnProperty(prop)) {
      var type = dictionary[prop];
      switch (type) {
        case IPC_TYPES.SYNC:
          return this.doSync(target, prop, receiver);
        case IPC_TYPES.NODE_ASYNC:
          return this.doAsync(target, prop, receiver);
        case IPC_TYPES.PROMISE:
          return this.doPromise(target, prop, receiver);
        case IPC_TYPES.FIELD:
          return this.doField(target, prop, receiver);
        case IPC_TYPES.CUSTOM:
          return target[prop](target, this, ipcRenderer, receiver);
      }
    }
    throw "Method/Property not found in IPC Wrapper dictionary";
  }

  getName () {
    return "wrapper."+this.name;
  }

  sendSyncFunctionRequest (target, prop, ...rest) {
    return ipcRenderer.sendSync(this.getName(), { "property": prop, "args": rest });
  }

  doSync (target, prop, receiver) {
    return this.sendSyncFunctionRequest.bind(this, target, prop);
  }

  doPromise (target, prop, receiver) {
    return (...rest) => {
      return new Promise((resolve, reject) => {
        var id = this.getRandomID();
        this.listeners.set(id, { "resolve": resolve, "reject": reject });
        ipcRenderer.send(this.getName(), { "ID": id, "property": prop, "args": rest });
      });
    };
  }

  doAsync (target, prop, receiver) {
    return (...rest) => {
      var callback = rest[rest.length - 1];
      var id = this.getRandomID();
      this.listeners.set(id, { "resolve": (res) => {
        callback(null, res);
      }, "reject": (res) => {
        callback(res, null);
      } });
      ipcRenderer.send(this.getName(), { "ID": id, "property": prop, "args": rest.splice(rest.length - 1, 1) });
      return null;
    };
  }

  doField (target, prop, receiver) {
      return this.sendSyncFunctionRequest(target, prop);
  }
}

export class IPCWrapper {
  constructor (definitions) {
    this.definitions = definitions;
  }
}

export const IPC_TYPES = {
  "SYNC": 0,
  "NODE_ASYNC": 1,
  "PROMISE": 2,
  "FIELD": 3,
  "CUSTOM": 4
};

export class IPCListener {
  constructor (name, wrapper, target) {
      this.name = name;
      this.wrapper = wrapper;
      this.target = target;
      //console.log("listening for config messages");
      this.start();
  }

  getName () {
    return "wrapper."+this.name;
  }

  start () {
    ipcMain.on(this.getName(), (event, message) => {
      //console.log("Received:",message);
      var property = message.property;
      //console.log(this.wrapper, this.wrapper.definitions);
      if (this.wrapper.definitions.hasOwnProperty(property)) {
        //console.log("Getting property", property);
        var args = [];
        if (message.hasOwnProperty("args")) {
          args= message.args;
        }
        var definition = this.wrapper.definitions[property];
          //console.log("Got definition", definition);
        switch (definition) {
          case IPC_TYPES.SYNC:
            return this.sendSync(property, args, message, event);
          case IPC_TYPES.NODE_ASYNC:
            return this.sendAsync(property, args, message, event);
          case IPC_TYPES.PROMISE:
            return this.sendPromise(property, args, message, event);
          case IPC_TYPES.FIELD:
            return this.sendField(property, args, message, event);
          case IPC_TYPES.CUSTOM:
            return this.handleCustom(property,args, message, event);
        }
      }
      else {
        console.error("Could not find",property,"in definitions.");
      }
      // event.returnValue = 'pong';
      // event.sender.send('asynchronous-reply', 'pong');
    });
  }

  sendSync (property, args, message, event) {
    var val = this.target[property](...args)
    if (typeof val !== "undefined") {
      event.returnValue = val;
    }
    else {
      event.returnValue = null;
    }
  }

  sendAsync (property, args, message, event) {
    if (message.hasOwnProperty("ID")) {
      //event.returnValue = this.target[property](...args);
      this.target[property](...args, (err, ...vals) => {
         event.sender.send(this.getName(), { ID: message.ID, error: err, response: vals, property: property });
      });
    }
  }

  sendPromise (property, args, message, event) {
    //console.log("Sending promise...");
    if (message.hasOwnProperty("ID")) {
      ////console.log(message.ID, ...arguments);
      //event.returnValue = this.target[property](...args);
      //
      if (args === null) throw "Arguments cannot be null?";
      this.target[property](...args).then((...vals) => {
      //  //console.log("Got promise for", property, ...arguments);
         event.sender.send(this.getName(), { ID: message.ID, error: null, response: vals, property: property });
      }).catch ((err) => {
        ////console.log("Got promise error for", property, err);
         event.sender.send(this.getName(), { ID: message.ID, error: err, response: [], property: property });
      });
    }
  }

  sendField (property, args, message, event) {
      event.returnValue = this.target[property];
  }

  handleCustom (property, args, message, event) {
    //console.log("Looking for: ", "__hostSender_"+property);
    //if (this.wrapper.hasOwnProperty("__ipc_"+property)) {
      //event.returnValue = this.target[property](...args);
      this.wrapper["__hostSender_"+property](property,args,message, event, this.wrapper, this.target, ipcMain, this);
  //  }
  }
}
