import {IPC_TYPES, IPCWrapper, IPCProxy, IPCListener} from "./IPCProxy.js";
import {findInData, ResponseStream} from "../api/torn.js";
/*
  todo: Completely refactor. This file is a mess.
 */
class APIWrapper extends IPCWrapper {
  constructor () {
    super ({
      "setAPIKey": IPC_TYPES.SYNC,
      "constructRoute": IPC_TYPES.SYNC,
      "constructURL": IPC_TYPES.SYNC,
      "make": IPC_TYPES.CUSTOM,
      "user": IPC_TYPES.CUSTOM,
      "faction": IPC_TYPES.CUSTOM,
      "property": IPC_TYPES.CUSTOM,
      "company": IPC_TYPES.CUSTOM,
      "market": IPC_TYPES.CUSTOM,
      "torn": IPC_TYPES.CUSTOM,
      "getCache": IPC_TYPES.SYNC,
      "addCache": IPC_TYPES.SYNC,
      "wrapResponse": IPC_TYPES.CUSTOM,
      "request": IPC_TYPES.CUSTOM,
      "once": IPC_TYPES.CUSTOM,
      "watch": IPC_TYPES.CUSTOM
    });
    this.__watcherListeners = new Map();

  }
  wrapResponse () { throw "Method not implemented";  }
  request (target, proxy, ipcRenderer, receiver) {
    return (member, entityID, selections, forceUpdate, maxTimeOutdated) => {
      //target, prop, receiver
      return proxy.doPromise(target, "request", receiver)(member, entityID, selections, forceUpdate, maxTimeOutdated, false).then((resp) => {
        resp = resp[0];
        resp.get = findInData.bind(null, resp.raw);
        return resp;
      });
    };
  }
  __clientReceiver_request (message, proxy, ipcReceiver, listener) {
    //console.log("Received response from IPC");
    return proxy.resolvePromise(listener, message);
  }
  __hostSender_request (property, args, message, event, wrapper, target, ipcMain, listener) {
    //console.log("Sending promise data from host");
    return listener.sendPromise(property, args, message, event);
  }
  // onChange (target, proxy, ipcRenderer) {}
  //
  // __clientReceiver_onChange (message, proxy, ipcReceiver) {}
  //
  // __hostSender_onChange (property, args, message, event, wrapper, target, ipcMain) {}
  //
  make (target, proxy, ipcRenderer, receiver) {
    return (member, entityID, selections, forceUpdate, maxTimeOutdated) => {
      if (selections && !(selections instanceof Array)) {
        selections = [selections];
      }
      return {
        once: target.once(target, proxy, ipcRenderer, receiver).bind(this, member, entityID, selections, forceUpdate || null, maxTimeOutdated || null),
        watch: target.watch(target, proxy, ipcRenderer, receiver).bind(this, member, entityID, selections, forceUpdate || null, maxTimeOutdated || null)
      };
    };
  }

  user (target, proxy, ipcRenderer, receiver) {
    return (userID, selections, noUseCache, maxCacheTime) => {
      return target.make(target, proxy, ipcRenderer, receiver)("user", userID, selections, noUseCache, maxCacheTime);
    };
  }

  faction (target, proxy, ipcRenderer, receiver) {
    return (factionID, selections, noUseCache, maxCacheTime) => {
      return target.make(target, proxy, ipcRenderer, receiver)("faction", factionID, selections, noUseCache, maxCacheTime);
    };
  }

  property (target, proxy, ipcRenderer, receiver) {
    return (propertyID, selections, noUseCache, maxCacheTime) => {
      return target.make(target, proxy, ipcRenderer, receiver)("property", propertyID, selections, noUseCache, maxCacheTime);
    };
  }

  company (target, proxy, ipcRenderer, receiver) {
    return (companyID, selections, noUseCache, maxCacheTime) => {
      return target.make(target, proxy, ipcRenderer, receiver)("company", companyID, selections, noUseCache, maxCacheTime);
    };
  }

  market (target, proxy, ipcRenderer, receiver) {
    return (itemID, selections, noUseCache, maxCacheTime) => {
      return target.make(target, proxy, ipcRenderer, receiver)("market", itemID, selections, noUseCache, maxCacheTime);
    };
  }

  torn (target, proxy, ipcRenderer, receiver) {
    return (selections, noUseCache, maxCacheTime) => {
      return target.make(target, proxy, ipcRenderer, receiver)("torn", null, selections, noUseCache, maxCacheTime);
    };
  }

  once (target, proxy, ipcRenderer, receiver) {
    return (member, entityID, selections, forceUpdate, maxTimeOutdated) => {
      return target.request(target, proxy, ipcRenderer, receiver)(member, entityID, selections, forceUpdate, maxTimeOutdated);
    };
  }


  watch (target, proxy, ipcRenderer, receiver) {
    //  watch (member, entityID, selections, forceUpdate, maxTimeOutdated, interval, wrapFn) {
    return (member, entityID, selections, forceUpdate, maxTimeOutdated, interval) => {
      //console.log("Received watch request...");
      var id = proxy.getRandomID();
      var responseStream = new ResponseStream();
      //console.log("Setting canceller");
      var canceller = function () {
        // log.info("Cancelled watcher", listeners);
        // var index = listeners.indexOf(responseStream);
        // log.info("Listeners", listeners);
        // listeners.splice(index, 1);
        // clearInterval(timeout);
        //
        ipcRenderer.send(proxy.getName(),{ "ID": id, "property": "watch", "type": "cancel" });
        proxy.listeners.delete(id);
      };
      responseStream._setCanceller(canceller);
      //console.log("Setting rs...");
      proxy.listeners.set(id, { "remove": false, "responseStream": responseStream });
      //console.log("Sending IPC request");
      ipcRenderer.send(proxy.getName(),{ "ID": id, "property": "watch", "type": "begin", args: [member, entityID, selections, forceUpdate, maxTimeOutdated, interval, false] });
      //console.log("Sent!", { "ID": id, "property": "watch", "type": "begin", args: [member, entityID, selections, forceUpdate, maxTimeOutdated, false] });
      return responseStream;
    };
  }
  __clientReceiver_watch (message, proxy, ipcReceiver, listener) {
    var type = message.type;
    var responseStream = proxy.listeners.get(message.ID);
    //console.log("Found listener", responseStream);
    if (!responseStream) return;
    if (type == "response") {
      var resp = message.response[0];
      resp.get = findInData.bind(null, resp.raw);
      responseStream.responseStream.add(resp);
    }
    else if (type == "error") {
      responseStream.responseStream.addError(...message.response);
    }
  }
  __hostSender_watch (property, args, message, event, wrapper, target, ipcMain, listener) {
    //console.log("Got watch message", message);
    var type = message.type;
    if (type == "begin") {
      //console.log("Watching...");
      var rs = target.watch(...args);
      rs.onData((...data) => {
        //console.log("Got some data...");
        event.sender.send(listener.getName(), { "ID": message.ID, "property": property, "type": "response", "response": data });
      });
      rs.onError((...data) => {
        //console.log("Got an error...", data);
        event.sender.send(listener.getName(), { "ID": message.ID, "property": property, "type": "error", "response": data });
      });
      //ipcMain.send(wrapper.getName(), { "ID": message.ID, "property": property, "type": "response", "response": args });
      this.__watcherListeners.set(message.ID, rs);
    }
    else if (type == "cancel") {
      var responseStream = this.__watcherListeners.get(message.ID);
      if (!responseStream) console.error("Could not find listener with ID");
      else {
        responseStream.cancel();
      }
    }
  }
}

export let Wrapper = () => {
  let APIDefinitions = new APIWrapper();
  return new Proxy({}, new IPCProxy("TornAPI", APIDefinitions));
};

export let Listener = (tornAPI) => {
  return new IPCListener('TornAPI', new APIWrapper(), tornAPI);
};




//
// export class TornAPI {
//
//   constructor () {}
//
//   setAPIKey (key) {}
//
//   constructRoute (member, entityID) {}
//
//   constructURL (member, entityID, selections) {}
//
//   make (member, entityID, selections, forceUpdate, maxTimeOutdated) {}
//
//   user (userID, selections, noUseCache, maxCacheTime) {}
//
//   faction (factionID, selections, noUseCache, maxCacheTime) {}
//
//   property (propertyID, selections, noUseCache, maxCacheTime) {}
//
//   company (companyID, selections, noUseCache, maxCacheTime) {}
//
//   market (itemID, selections, noUseCache, maxCacheTime) {}
//
//   torn (selections, noUseCache, maxCacheTime) {}
//
//   getCache (member, entityID, selections, maxTimeOutdated) {}
//
//   addCache (member, entityID, selections, responseData) {}
//
//   wrapResponse (data, fromCache, responseTime) {}
//
//   request(member, entityID, selections, forceUpdate, maxTimeOutdated) {}
//
//   once (member, entityID, selections, forceUpdate, maxTimeOutdated) {}
//
//   _getListeners (member, entityID, selections) {}
//
//   notifyAll (listenKey, selections, data, isError) {}
//
//   watch (member, entityID, selections, forceUpdate, maxTimeOutdated, interval) {}
//
// }

//
// class ResponseStream {
//
//   constructor () {}
//
//   _setCanceller (method) {}
//
//   isCancelled () {}
//
//   add (data) {}
//
//   addError (error) {}
//
//   onData (callback) {}
//
//   onError (callback) {}
//
//   cancel () {}
// }
