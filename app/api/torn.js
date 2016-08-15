if (typeof window === 'undefined') {var fetch = require('node-fetch');}
const log = require("../utils/logger.js")("TornAPI").mute();
const API_URL = "https://api.torn.com/";

export function findInData (data, key) {
  var keySplit = key.split(".");
  //console.log("Finding in ",key,data);
  var cP = data;
  for (var x = 0; x < keySplit.length; x++) {
    //log.info("Finding in data", keySplit[x]);
    if (cP.hasOwnProperty(keySplit[x])) {
       cP = cP[keySplit[x]];
    }
    else {
      return null;
    }
  }
  return cP;
}

export function torn2Array (data) {
  var res = [];
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      res.push({ key: key, ...data[key]});
    }
  }
  return res;
}

export class TornAPI {

  constructor () {
    this.apiKey = null;
    this.listeners = {};
    this.cache = {};
  }

  setAPIKey (key) {
    log.info("Set API Key");
    this.cache = {};
    this.listeners = {};
    this.apiKey = key;
  }

  constructRoute (member, entityID) {
    return member + "/" + (entityID?entityID:"");
  }

  constructURL (member, entityID, selections) {
    if (this.apiKey === null) {
      throw "APIKey has not been set";
    }
    return API_URL + this.constructRoute(member,entityID) + "?key="+this.apiKey + (selections&&selections.length>0?"&selections="+selections.join(","):"");
  }

  applyDefaults (input, current) {
    if (input === null || typeof input === "undefined") input = {};
    if (current === null || typeof current === "undefined") current = {};
    var defaults = {
      "member": null,
      "entityID": null,
      "selections": [],
      "forceUpdate": false,
      "cacheOutdatedTimeout": null,
      "interval": null,
      "wrap": true,
      ...current,
      ...input
    };
    return defaults;
  }

  make (options) {
    options = this.applyDefaults(options);
    if (options.selections && !(options.selections instanceof Array)) {
      options.selections = [options.selections];
    }
    return {
      once: this.once.bind(this, options),
      watch: this.watch.bind(this, options)
    };
  }

  user (userID, selections, options) {
    return this.make(this.applyDefaults(options, { "entityID": userID,selections: selections, "member": "user" }));
  }

  faction (factionID, selections, options) {
    return this.make(this.applyDefaults(options, { "entityID": factionID, selections: selections, "member": "faction" }));
  }

  property (propertyID, selections, options) {
    return this.make(this.applyDefaults(options, { "entityID": propertyID, selections: selections, "member": "property" }));
  }

  company (companyID, selections, options) {
    return this.make(this.applyDefaults(options, { "entityID": companyID, selections: selections, "member": "company" }));
  }

  market (itemID, selections, options) {
    return this.make(this.applyDefaults(options, { "entityID": itemID, selections: selections, "member": "market" }));
  }

  torn (selections, options) {
    return this.make(this.applyDefaults(options, { "entityID": null, selections: selections, "member": "torn" }));
  }

  getCache (member, entityID, selections, maxTimeOutdated) {
    log.info("Checking cache");
    var cacheKey = this.constructRoute(member,entityID);
    log.info("Using cache key:",cacheKey);
    if (!this.cache.hasOwnProperty(cacheKey)) {
      log.info("Could not find in cache");
      return false;
    }
    var cacheItem = this.cache[cacheKey];
    for (var selected in cacheItem) {
      if (!cacheItem.hasOwnProperty(selected)) continue;
      log.info("Looking in ", selected);
      var splitSelected = selected.split(",");
      var found = true;
      for (var s = 0; s < selections.length; s++) {
        if (!splitSelected.includes(selections[s])) {
          found = false;
          break;
        }
      }
      if (found) {
        log.info("It matches! checking time...");
        var fCache = cacheItem[selected];
        var t = fCache.timestamp;
        if ((Date.now() - t) < (maxTimeOutdated * 1000)) {
          log.info("Cache found, sending result");
          return fCache;
        }
        else {
          // Was deleting then realised perhaps something
          // would have a longer timeout.
          // TODO: Think of a good amount of time to delete after
          //  delete cacheItem[selected];
          continue;
        }
      }
    }
    return false;
  }

  addCache (member, entityID, selections, responseData, originalRequest) {
    var cacheKey = this.constructRoute(member, entityID);
    if (!this.cache.hasOwnProperty(cacheKey)) {
    this.cache[cacheKey] = {};
    }
    if (typeof selections === "undefined" || selections === null) {
      selections = [];
    }
    var selKey =selections.sort().join(",");
    this.cache[cacheKey][selKey] = {
        timestamp: Date.now(),
        data: responseData,
        originalRequest: originalRequest
    };
    return true;
  }

  wrapResponse (data, fromCache, responseTime, options) {
    var resp = { "raw": data, "fromCache": fromCache, "responseTime": responseTime, originalRequest: options};
    return resp;
  }

  request(options) {
    if (options === null) {
      options = this.applyDefaults({}, {});
      console.trace();
      console.warn("No arguments to request was found. Ensure you have not made a mistake. This will unlikely do what you want it to do.");
    }
    let member = options.member;
    let entityID = options.entityID;
    let selections = options.selections;
    if (!Array.isArray(selections)) {
      selections = [selections];
    }
    let wrapFn = options.wrap;
    let maxTimeOutdated = options.cacheOutdatedTimeout;
    let forceUpdate = options.forceUpdate;

    log.info("Requested", ...arguments);
    if (maxTimeOutdated === null || typeof maxTimeOutdated === "undefined") {
      maxTimeOutdated = 30;
    }
    var URL = this.constructURL(member, entityID, selections);
    if (forceUpdate !== true) {
      var cacheData = this.getCache(member, entityID, selections, maxTimeOutdated);
      if (cacheData !== false) {
        return Promise.resolve(this.wrapResponse(cacheData.data, true, cacheData.timestamp, cacheData.originalRequest));
      }
    }
    return fetch(URL).then((body) => {
      log.info(body);
      return body.json();
    }).then((jsonData) => {
      log.info(jsonData);
        //{"error":{"code":6,"error":"Incorrect ID"}}
        if (jsonData.hasOwnProperty("error")) {
          throw jsonData.error;
        }
        this.addCache(member, entityID, selections, jsonData, options);
        return this.wrapResponse(jsonData, false, Date.now(), options);
    });
  }

  once (options, mergeOptions) {

      options = {...options, ...mergeOptions};
    if (options === null) {
      options = this.applyDefaults({}, {});
      console.warn("No arguments to once was found. Ensure you have not made a mistake. This will unlikely do what you want it to do.");
    }
    return this.request(options).then(function (response) {
      if (options.wrap === true) {
        response.get = findInData.bind(null, response.raw);
      }
      return response;
    });
  }

  _getListeners (member, entityID, selections) {
    var listenKey = this.constructRoute(member, entityID);
    if (!this.listeners.hasOwnProperty(listenKey)) {
      this.listeners[listenKey] = {};
    }
    selections.sort();
    var selectionKey = selections.join(",");
    if (!this.listeners[listenKey].hasOwnProperty(selectionKey)) {
      this.listeners[listenKey][selectionKey] = [];
    }
    return this.listeners[listenKey][selectionKey];
  }

  notifyAll (listenKey, selections, data, isError) {
    var listeners = this.listeners[listenKey];
    log.info("Looping through listeners");
    log.info(listeners, listenKey, selections, this.listeners);
    for (var sel in listeners) {
      if (!listeners.hasOwnProperty(sel)) continue;
      var splitSel = sel.split(",");
      var doSend = true;
      log.info("Got listeners", sel, splitSel, selections);
      for (var x = 0; x < splitSel.length; x++) {
        if (!selections.includes(splitSel[x])) {
          doSend = false;
        }
      }
      log.info("Doing send?", doSend);
      if (doSend) {
        for (var n = 0; n < listeners[sel].length; n++) {
          var rS = listeners[sel][n];
          if (isError) {
            try {
              rS.addError(data);
            }
            catch (e) {
              // Well our error handler is erroring, we should display an error
              // or something to inform the user why something may not be working
              const {dialog} = require('electron')
              dialog.showMessageBox({
                type: "error",
                title: "An error has occurred...",
                message: "Tinker may behave unexpectedly, an error has occurred in the error handler (unfortunately). Please post the details to a developer in order to fix this issue. If you think you did something to cause this error (unlikely) then please post what you did to further help. Sorry!",
                detail: e,
                buttons: ["Okay"]
              });
            }
          }
          else {
            try {
              // TODO: Fix properly.
              let d;
              if (rS.options.wrap === true) {
              //  console.log("Wrapping data");
                d =  {...data, "get": findInData.bind(null, data.raw)};
              }
              else {
              //  console.log("Not wrrapping data", rS.options);
                d =  {...data, "get": null};
              }
              rS.add(d);
            }
            catch (e) {
              rS.addError(e);
            }
          }
        }
      }
    }
  }

  watch (options, mergeOptions) {

      options = {...options, ...mergeOptions};
    if (options === null) {
      options = this.applyDefaults({}, {});
      console.warn("No arguments to watch was found. Ensure you have not made a mistake. This will unlikely do what you want it to do.");
    }


    let member = options.member;
    let entityID = options.entityID;
    let selections = options.selections;

    var listenKey = this.constructRoute(member, entityID);
    var listeners = this._getListeners(member, entityID,selections);
    var responseStream = new ResponseStream(options);

    if (options.interval <= 1) {
      options.interval  = 100;
      responseStream.addError("No interval specified for watch, interval is set to 100 by default");
    }

    let interval = options.interval;

    if (options.cacheOutdatedTimeout === null) {
      options.cacheOutdatedTimeout = interval;
    }

    var timeoutFunction = () => {
      log.info("Getting selections: ", selections);
      this.once(options).then((responseData) => {
        this.notifyAll(listenKey, selections, responseData, false);
      }).catch((error) => {
        this.notifyAll(listenKey, selections, error, true);
      });
    };

    var canceller = function () {
      log.info("Cancelled watcher", listeners);
      var index = listeners.indexOf(responseStream);
      log.info("Listeners", listeners);
      listeners.splice(index, 1);
      clearInterval(timeout);
    };
    responseStream._setCanceller(canceller);
    listeners.push(responseStream);

    var timeout = setInterval(timeoutFunction, interval*1000);
    timeoutFunction();
    return responseStream;
  }

}


export class ResponseStream {

  constructor (requestOptions) {
    this._cancelMethod = null;
    this._isCancelled = false;
    this._onDataCallback = null;
    this._onErrorCallback = null;
    this.lastData = null;
    this.lastDataTime = 0;
    this.lastError = null;
    this.options = requestOptions;
  }

  _setCanceller (method) {
    this._cancelMethod = method;
  }

  isCancelled () {
    return this._isCancelled;
  }

  add (data) {
    this.lastData = data;
    // Make sure we're not receiving our own data back because some cache result triggered
    // a notify all.
    if (this._onDataCallback !== null && data.responseTime > this.lastDataTime) {
      this.lastDataTime = Date.now();
      this._onDataCallback(data);
    }
  }

  addError (error) {
    this.lastError = error;
    if (this._onErrorCallback !== null) {
      this._onErrorCallback(error);
    }
  }

  onData (callback) {
    if (this._onDataCallback !== null) {
      throw "Data listener has already been attached";
    }
    this._onDataCallback = callback;
    if (this.lastData !== null) {
      callback(this.lastData);
    }
    return this;
  }

  onError (callback) {
    if (this._onErrorCallback !== null) {
      throw "Error listener has already been attached";
    }
    this._onErrorCallback = callback;
    if (this.lastError !== null) {
      callback(this.lastError);
    }
    return this;
  }

  cancel () {
    if (!this.isCancelled()) {
      this._cancelMethod();
      this._isCancelled = true;
    }
    else {
      throw "Stream already closed";
    }
  }
}
