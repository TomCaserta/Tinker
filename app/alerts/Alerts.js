import {StatusBarAlert} from "./StatusBarAlert";
import {SimpleAlert} from "./SimpleAlert";
import {NotificationAlert} from "./NotificationAlert";
import {CooldownAlert} from "./CooldownAlert";
import {IconAlert} from "./IconAlert";


export var Alerts = [
  new StatusBarAlert("energy", "Your energy is now full", "Go out and use it!"),
  new StatusBarAlert("nerve", "Your nerve is now full", "Use it wisely."),
  new StatusBarAlert("happy", "Your happy is full", "Time to train"),
  new NotificationAlert("mail", "New Notification!", "You've got mail!"),
  new NotificationAlert("event", "You have a new event", ""),
  new NotificationAlert("award", "Congratulations", "You have a new award"),
  new NotificationAlert("competition", "A new competition has started", "Go check it out"),
  new CooldownAlert("drug", "Drug Cooldown", "Your drug effects have worn off."),
  new CooldownAlert("medical", "Medical Cooldown", "You can now use more medical items"),
  new CooldownAlert("booster", "Booster Cooldown", "You can now use more booster items"),
  new IconAlert("left_hospital", "You've left hospital", "See the city", 15, false),
  new IconAlert("left_jail", "You've left jail", "Times up!", 16, false),
  new IconAlert("low_health", "Your health is low", "", 12, true),
  new IconAlert("education_complete", "Your education is complete", "", 20, true),
  new IconAlert("race_complete", "Your race is complete", "", 18, true),
  new IconAlert("auction_outbid", "You've been outbid", "", 56, true),
  new SimpleAlert("reached_destination", "You have reached your destination", "", (data, prev) => {
    if (data.get("travel.time_left", 0) === 0 && prev.get("travel.time_left",0) > 0) {
      return true;
    }
    return false;
  })
];
