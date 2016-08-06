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

  make (member, entityID, selections, forceUpdate, maxTimeOutdated) {
    if (selections && !(selections instanceof Array)) {
      selections = [selections];
    }
    return {
      once: this.once.bind(this, member, entityID, selections, forceUpdate, maxTimeOutdated),
      watch: this.watch.bind(this, member, entityID, selections, forceUpdate, maxTimeOutdated)
    };
  }

  user (userID, selections, noUseCache, maxCacheTime) {
    return this.make("user", userID, selections, noUseCache, maxCacheTime);
  }

  faction (factionID, selections, noUseCache, maxCacheTime) {
    return this.make("faction", factionID, selections, noUseCache, maxCacheTime);
  }

  property (propertyID, selections, noUseCache, maxCacheTime) {
    return this.make("property", propertyID, selections, noUseCache, maxCacheTime);
  }

  company (companyID, selections, noUseCache, maxCacheTime) {
    return this.make("company", companyID, selections, noUseCache, maxCacheTime);
  }

  market (itemID, selections, noUseCache, maxCacheTime) {
    return this.make("market", itemID, selections, noUseCache, maxCacheTime);
  }

  torn (selections, noUseCache, maxCacheTime) {
    return this.make("torn", null, selections, noUseCache, maxCacheTime);
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

  addCache (member, entityID, selections, responseData) {
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
        data: responseData
    };
    return true;
  }

  wrapResponse (data, fromCache, responseTime, wrapGet) {
    var resp = { "raw": data, "fromCache": fromCache, "responseTime": responseTime };
    if (wrapGet !== false) {
      resp.get = findInData.bind(null, data);
    }
    return resp;
  }

  request(member, entityID, selections, forceUpdate, maxTimeOutdated, wrapFn) {
    log.info("Requested", ...arguments);
    if (maxTimeOutdated === null || typeof maxTimeOutdated === "undefined") {
      maxTimeOutdated = 30;
    }
    var URL = this.constructURL(member, entityID, selections);
    if (forceUpdate !== true) {
      var cacheData = this.getCache(member, entityID, selections, maxTimeOutdated);
      if (cacheData !== false) {
        return Promise.resolve(this.wrapResponse(cacheData.data, true, cacheData.timestamp,wrapFn));
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
        this.addCache(member, entityID, selections, jsonData);
        return this.wrapResponse(jsonData, false, Date.now(), wrapFn);
    });
  }

  once (member, entityID, selections, forceUpdate, maxTimeOutdated, wrapFn) {
    return this.request(member, entityID, selections, forceUpdate, maxTimeOutdated, wrapFn);
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
            rS.addError(data);
          }
          else {
            // TODO: Fix properly.
            if (rS.wrapFn === true) {
            //  console.log("Wrapping data");
                data.get = findInData.bind(null, data);
            }
            else {
            //  console.log("Not wrrapping data", rS.wrapFn);
              data.get = null;
            }
            rS.add(data);
          }
        }
      }
    }
  }

  watch (member, entityID, selections, forceUpdate, maxTimeOutdated, interval, wrapFn) {
    var listenKey = this.constructRoute(member, entityID);
    var listeners = this._getListeners(member, entityID,selections);
    var responseStream = new ResponseStream(wrapFn);
    var timeoutFunction = () => {
      log.info("Getting selections: ", selections);
      this.once(member, entityID, selections, forceUpdate, maxTimeOutdated, wrapFn).then((responseData) => {
        this.notifyAll(listenKey, selections, responseData, false);
      }).catch((error) => {
        console.log("Error!", error);
        this.notifyAll(listenKey, selections, error, true);
      });
    };
    if (interval <= 1) {
      interval = 100;
      console.warn("Interval lower than 1, set to 100 seconds");
    }
    if (maxTimeOutdated === null || typeof maxTimeOutdated==="undefined") {
      maxTimeOutdated = interval - 1;
    }
    log.info("Interval is",interval);
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

  constructor (wrapFn) {
    this._cancelMethod = null;
    this._isCancelled = false;
    this._onDataCallback = null;
    this._onErrorCallback = null;
    this.lastData = null;
    this.lastDataTime = 0;
    this.lastError = null;
    this.wrapFn = wrapFn;
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
