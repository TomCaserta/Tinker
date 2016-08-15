var eNotify = require('electron-notify');
import {Sounds} from "./Sounds";
import {Alerts} from "../alerts/Alerts";

var path = require("path");
eNotify.setConfig({
    appIcon: path.join(__dirname, '/../images/icon_128x128.png'),
    displayTime: 6000
});


export class AlertTracker {
  constructor (Config, TornAPI) {
    console.log("Alerts have been constructed!");
    this.api = TornAPI;
    this.config = Config;
    this.userStream = null;
    this.canLoad = false;
    this.bindStartup();
    this.previous = null;

  }

  bindStartup () {
    if (this.config.get("api_key") !== null) {

          console.log("Alerts are a go!");
          this.canLoad = true;
          this.checkAlerts();
    }
    else {
      this.config.onChange("api_key",  (key) => {
          console.log("Alerts are a go!");
          this.canLoad = true;
          this.checkAlerts();
      });
    }
    this.config.onChange("watch_time",  () => {
      this.checkAlerts();
    });
  }

  checkAlerts () {
//     full_nerve: false,
// [1]      left_jail: true,
// [1]      left_hospital: true,
// [1]      new_mail: true,
// [1]      completed_education: true,
// [1]      reached_destination: false,
// [1]      full_happy: false,
// [1]      full_energy: false,
// [1]      drug_cooldown: false,
// [1]      medical_cooldown: false,
// [1]      booster_cooldown: false,
// [1]      new_event: true,
    if (this.userStream !== null) this.userStream.cancel();
    this.userStream = this.api.user(null, ["bars", "notifications", "profile","education", "money", "cooldowns", "travel", "icons"]).watch({ interval: this.config.get("watch_time", 9) });
    this.userStream.onData((data) => {
      var prev = this.previous;
      if (prev === null) prev = data;
      this.previous = data;

      Alerts.forEach((alert) => {
        if (this.config.get("alert."+alert.getKey(), false)) {
          if (alert.check(data, prev)) {
            this.makeAlert(alert.alertMessage(this.config, data, prev));
          }
        }
      });
    });
    this.userStream.onError((data) => {
      console.error(data);
     });
  }

  makeAlert (notification) {
    eNotify.notify(notification);
  }
}
