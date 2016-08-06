const denodeify = require('promise-denodeify');
const fs = require('fs');
const path = require('path');
const existsFile = denodeify(require('exists-file'), Promise);
const electron = require('electron');
const app = electron.app || electron.remote.app;
const userData = app.getPath('userData');
const fsRead =  denodeify(fs.readFile, Promise);
const fsWrite =  denodeify(fs.writeFile, Promise);
const log = require("../utils/logger.js")("Config");

export class Config {

  constructor () {
    this.cache = {};
    this.listeners = {};
    this.saving = false;
    this.autoSaveTimer = null;
    this.hasChanges = false;
  }

  _autoSave () {
    clearTimeout(this.autoSaveTimer); // Just in case autoSave is called twice for whatever reason.
    this.save ().then(() => {
      this.autoSaveTimer = setTimeout(this._autoSave.bind(this), 5000);
    });
  }

  getFilePath () {
    return path.join(userData, "data.torn.json");
  }

  load () {
    var filePath = this.getFilePath();
    return existsFile(filePath).then((res) => {
      if (res) {
        return fsRead(filePath, 'utf8');
      }
      log.info("File does not exist");
      return "{}";
    }).then((fileContents) => {
      try {
        var js = JSON.parse(fileContents.toString());
        this.cache = js;
        log.info("Loaded configuration",fileContents);

        this._autoSave();
        return this;
      }
      catch (e) {
        log.info("Could not read configuration file...");
      }
    });
  }

  save () {
    if (!this.saving && this.hasChanges) {
      this.saving = true;
      log.info("Saving",this.getFilePath(), this.cache, JSON.stringify(this.cache));
      return fsWrite(this.getFilePath(), JSON.stringify(this.cache)).then((data) => {
        log.info("Saved data!");
        this.saving = false;
        this.hasChanges = false;
        return data;
      }).catch(function (err) {
        console.error(err);
        return err;
      });
    }
    return Promise.resolve(false);
  }

  _findInData (data, key) {
    var keySplit = key.split(".");
    var cP = data;
    for (var x = 0; x < keySplit.length; x++) {
      //log.info("Finding in data", keySplit[x]);
      if (cP.hasOwnProperty(keySplit[x])) {
         cP = cP[keySplit[x]];
      }
      else {
        return {"value": null, found: false };
      }
    }
    return { "value": cP, found: true };
  }

  onChange (key, callback) {
    var hasListeners = this.listeners.hasOwnProperty(key);
    if (!hasListeners) {
      this.listeners[key] = [];
    }
    var listener = {
      "callback": callback,
      "cancel": () => {
        this.listeners[key].splice(this.listeners[key].indexOf(listener), 1);
      }
    };
    this.listeners[key].push(listener);
    return listener.cancel;
  }

  _notifyAll (key, value) {
    var hasListeners = this.listeners.hasOwnProperty(key);
    if (hasListeners) {
      this.listeners[key].forEach(function (cb) {
        cb.callback(value, key);
      });
    }
  }

  set (key, value) {
    var keySplit = key.split(".");
    var cP = this.cache;
    for (var x = 0; x < keySplit.length-1; x++) {
      if (!cP.hasOwnProperty(keySplit[x])) {
        cP[keySplit[x]] = {};
      }
      cP = cP[keySplit[x]];
    }
    log.info("Setting", keySplit[x], "to", value, "on", cP);
    cP[keySplit[x]] = value;
    this.hasChanges = true;
    this._notifyAll(key, value);
    log.info(this.cache);
  }

  has (key) {
    return this._findInData(this.cache, key).found;
  }

  get (key, defaultValue) {
    var found = this._findInData(this.cache, key);
    return found.found ? found.value : defaultValue;
  }

}
