
const LEVELS = {
  "LOG":  "#16A085",
  "INFO": "#2980B9",
  "ERROR": "#C0392B",
  "WARN": "#F39C12",
  "DEBUG": "#8E44AD"
};
export default function (name) {
    return new Logger(name);
}
class Logger {
  constructor (name) {
    this.setName(name);
    this.muted = false;
  }

  mute () {
    this.muted = true;
    return this;
  }
  unmute () {
    this.muted = false;
    return this;
  }

  hashCode(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
         hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  }

  setName (name) {
    this.name = name;
    this.colour = this.intToHSL(this.hashCode(name));
    return this;
  }
  intToHSL (num) {
      var shortened = num % 360;
      return "hsl(" + shortened + ",100%,30%)";
  }

  getLevelColour (level) {

    return ["%c["+level.toUpperCase()+"]","color:"+LEVELS[level.toUpperCase()]+""];
  }

  getNameColour (name) {
    return ["%c["+name+"]", "color: "+this.colour+";font-weight:bold;"]
  }

  _log (level, ...data) {
    if (!this.muted) {
      var lev = this.getLevelColour(level);
      var name =this.getNameColour(this.name);
      console[level](name[0]+lev[0], name[1],lev[1], ...data);
    }
    return this;
  }

  log (...data) {
    return this._log("log",...data)
  }
  info (...data) {
    return this._log("info",...data)
  }
  warn (...data) {
    return this._log("warn",...data)
  }
  error (...data) {
    return this._log("error",...data)
  }
  debug (...data) {
    return this._log("debug",...data)
  }
}
