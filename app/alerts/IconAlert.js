import {SimpleAlert} from "./SimpleAlert";

export
class IconAlert extends SimpleAlert {
  constructor (alert_key, title, message, iconNumber, alertOnPresence) {
    super(alert_key, title, message, null);
    this.iconNumber = iconNumber;
    this.alertOnPresence = alertOnPresence;
  }

  check (data, prev) {
    if (alertOnPresence && data.get("icon.icon"+this.iconNumber,null) !== null && prev.get("icon.icon"+this.iconNumber,null) === null) {
      this.message = data.get("icon.icon"+this.iconNumber,null);
      return true;
    }
    else if (!alertOnPresence && prev.get("icon.icon"+this.iconNumber,null) !== null && data.get("icon.icon"+this.iconNumber,null) === null) {
      return true;
    }
    return false;
  }
}
