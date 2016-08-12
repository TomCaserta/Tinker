export
class SimpleAlert {
  constructor (alert_key, title, message, checker) {
    this.cb = checker;
    this.alertKey = alert_key;
    this.titel = title;
    this.message = message;
  }
  check (data, prev) {
    return this.cb(data, prev);
  }
  alertMessage (config, data) {
    var notification = {
        title: this.title,
        text: this.message,
        volume: this.config.get("alert.sound.volume", 1),
        sound: path.join(__dirname, "/../sounds/"+Sounds[this.config.get(this.config.get("alert.sound."+this.alert_key))])
    };
    eNotify.notify(notification);
  }
}
