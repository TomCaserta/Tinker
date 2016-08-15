/*TODO: Move this out of this file. It should not be its concern. */
import {Sounds} from "../utils/Sounds";
var path = require("path");


export
class SimpleAlert {
  constructor (alert_key, title, message, checker) {
    this.cb = checker;
    this.alertKey = alert_key;
    this.title = title;
    this.message = message;
  }
  check (data, prev) {
    return this.cb(data, prev);
  }

  getKey () {
    return this.alertKey;
  }

  alertMessage (config, data, prev) {
    var notification = {
        title: this.title,
        text: this.message,
        volume: config.get("alert.sound.volume", 1),
        sound: path.join(__dirname, "/../sounds/"+Sounds[config.get("alert.sound."+this.alertKey)])
    };
    return notification;
  }
}
