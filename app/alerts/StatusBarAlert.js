import {SimpleAlert} from "./SimpleAlert";

export
class StatusBarAlert extends SimpleAlert {
  constructor (bar_name, title, message) {
    super("full_"+bar_name, title, message, null);
    this.barName = bar_name;
  }

  check (data, prev) {
    if (data.get(this.barName+".fulltime",0) === 0 && prev.get(this.barName+".fulltime", 0) > 0) {
      return true;
    }
    return false;
  }
}
