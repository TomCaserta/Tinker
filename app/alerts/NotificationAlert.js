import {SimpleAlert} from "./SimpleAlert";

export
class NotificationAlert extends SimpleAlert {
  constructor (notifier, title, message) {
    super("new_"+notifier, title, message, null);
    this.notifier = notifier;
  }

  check (data, prev) {
    if (data.get("notifications."+this.notifier+"s",0) > prev.get("notifications."+this.notifier+"s", 0)) {
      return true;
    }
    return false;
  }
}
