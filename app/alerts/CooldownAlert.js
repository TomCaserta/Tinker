import {SimpleAlert} from "./SimpleAlert";

export
class CooldownAlert extends SimpleAlert {
  constructor (notifier, title, message) {
    super(notifier+"_cooldown", title, message, null);
    this.notifier = notifier;
  }

  check (data, prev) {
    if (data.get("cooldowns."+this.notifier,0) === 0 && prev.get("cooldowns."+this.notifier, 0) !== 0) {
      return true;
    }
    return false;
  }
}
