import {SimpleAlert} from "./SimpleAlert";

export
class IconAlert extends SimpleAlert {
  constructor (alert_key, title, message, iconNumber, alertOnPresence) {
    super(alert_key, title, message, null);
    this.iconNumber = iconNumber;
    this.alertOnPresence = alertOnPresence;
  }

  check (data, prev) {
    if (this.alertOnPresence && data.get("icons.icon"+this.iconNumber,null) !== null && prev.get("icons.icon"+this.iconNumber,null) === null) {
      this.message = data.get("icons.icon"+this.iconNumber,null);
      return true;
    }
    else if (!this.alertOnPresence && prev.get("icons.icon"+this.iconNumber,null) !== null && data.get("icons.icon"+this.iconNumber,null) === null) {
      return true;
    }
    return false;
  }
}
