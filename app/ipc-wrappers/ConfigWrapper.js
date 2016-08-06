import {IPC_TYPES, IPCWrapper, IPCProxy, IPCListener} from "./IPCProxy.js";

class ConfigWrapper extends IPCWrapper {
  constructor () {
    super ({
      "getFilePath": IPC_TYPES.SYNC,
      "load": IPC_TYPES.PROMISE,
      "save": IPC_TYPES.PROMISE,
      "onChange": IPC_TYPES.CUSTOM,
      "set": IPC_TYPES.SYNC,
      "has": IPC_TYPES.SYNC,
      "get": IPC_TYPES.SYNC
    });
    this.onChangeListeners = new Map();
  }

  onChange (target, proxy, ipcRenderer) {
    return (key, callback) => {
      var id = proxy.getRandomID();
      proxy.listeners.set(id, { "remove": false, "resolve": (res) => {
        callback(res);
      } });
      ipcRenderer.send(proxy.getName(), { "ID": id, "property": prop, "type": "begin", "args": [key] });
      return () => {
        ipcRenderer.send(proxy.getName(), { "ID": id, "property": prop, "type": "cancel" });
        proxy.listeners.delete(id);
      };
    };
  }

  __clientReceiver_onChange (message, proxy, ipcReceiver) {
    var type = message.type;
    var listener = proxy.listeners.get(message.ID);
    if (type == "response") {
      if (listener) {
        listener.resolve(...message.response);
      }
    }
  }

  __hostSender_onChange (property, args, message, event, wrapper, target, ipcMain) {
    var key = args[0];
    var type = message.type;
    if (type == "begin") {
      var cancel = target.onChange(key, (...args) => {
        ipcMain.send(wrapper.getName(), { "ID": message.ID, "property": property, "type": "response", "response": args });
      });
      this.onChangeListeners.set(message.ID, { property: property, cancel: () => {
          cancel();
          this.onChangeListeners.delete(message.ID);
        }
      });
    }
    else if (type == "cancel") {
      var listener = this.onChangeListeners.get(message.ID);
      if (!listener) console.error("Could not find listener with ID");
      else {
        listener.cancel();
      }
    }
  }
}

export let Wrapper = () => {
  let ConfigDefinitions = new ConfigWrapper();
  return new Proxy({}, new IPCProxy("Config", ConfigDefinitions));
};

export let Listener = (config) => {
  return new IPCListener('Config', new ConfigWrapper(), config);
};
