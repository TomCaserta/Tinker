import React, { Component } from 'react';
import {NumberContainer} from "./NumberContainer";


export default class StatusBar extends Component {

  constructor (props) {
    super(props);
      var tAF = Date.now() + (props.fulltime * 1000);
    this.state = {
      timeAtFull: (props.fulltime ?tAF : null),
      timer: this.renderTime(tAF - Date.now()),
      value: props.value
    };
    this.timer = null;
    this.ticktimer = null;
  }

  componentDidMount () {
      this.startTimer(this.state.timeAtFull);
      this.resetTickTimer(this.props.ticktime);
  }

  componentWillUnmount () {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ticktimer !== null) {
      clearInterval(this.ticktimer);
      this.ticktimer = null;
    }
  }

  startTimer (tAF) {
    if (tAF > Date.now() && this.timer === null) {
      this.timer = setInterval(() => {
        if (tAF < Date.now()) {
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        this.setState({
          timer: this.renderTime(tAF - Date.now())
        });
      }, 500);
    }
  }

  resetTickTimer (ticktime) {
    if (this.ticktimer !== null) clearTimeout(this.ticktimer);
    if (ticktime <= 0) return;
    if (this.props.increment && this.state.value+this.props.increment < this.props.total) {
      var increment= () => {
        var val = this.state.value+this.props.increment;
        this.setState({
          value: val
        });
        if (val < this.props.total) {
          this.ticktimer = setTimeout(increment, this.props.interval * 1000);
        }
      };
      this.ticktimer = setTimeout(increment, ticktime * 1000);
    }
  }

  componentWillReceiveProps (props) {
    var time = props.fulltime;
    if (time !== null && typeof time != "undefined") {
      var tAF = Date.now() + (time * 1000);
      this.setState({
        timeAtFull: tAF,
        timer: this.renderTime(tAF - Date.now())
      });
      this.startTimer(tAF);
    }
    if (props.hasOwnProperty("value")) {
      if (props.value !== this.state.value) {
        this.setState({"value": props.value });
      }
    }
    if (props.hasOwnProperty("ticktime")) {
      this.resetTickTimer(props.ticktime);
    }
  }

  pad (n) {return n<10 ? '0'+n : n;}


  renderTime (milliseconds) {
      if (milliseconds < 0) milliseconds = 0;
      var days = Math.floor(milliseconds / 86400000);
      milliseconds = milliseconds % (86400000);
      var hours = Math.floor(milliseconds / 3600000);
      milliseconds = milliseconds % (3600000);
      var minutes = Math.floor(milliseconds / 60000);
      milliseconds = milliseconds % (60000);
      var seconds = Math.floor(milliseconds / 1000);
      milliseconds = milliseconds % (1000);
      return ((days?days+'d ':'')+(this.pad(hours) + ":" +this.pad(minutes) + ":" + this.pad(seconds)));
  }

  render() {
    var percWidth = (this.props.width ? this.props.width: null);
    if (!percWidth) {
      percWidth = this.state.value / (this.props.total / 100);
    }
    var timer = null;
    if (this.state.timer !== null) {
      timer = (<span>{this.state.timer}</span>);
    }
    var isMaxed = this.state.value >= this.props.total;
    return (
        <div className={this.props.className}>
          <div className="flex-row">
            <div className="flex-col-sm-3"><strong>{this.props.name}</strong></div>
            <div className="flex-col-sm-5 text-muted">
            {(this.props.showTotal === false ? "" : (<small><NumberContainer value={this.state.value} /> / <NumberContainer value={this.props.total} /></small>))}
            </div>
            <div className="flex-col-sm-4 text-muted text-right"><small>{timer}</small></div>
          </div>
          {(this.props.showProgress === false ? "": (<div className="flex-row">
          <div className="flex-col-sm-12">
            <div className={" progress status-"+this.props.cssName+"-container" +(isMaxed ? " status-over":"")}>
              <div className={"progress-bar "+("status-"+this.props.cssName) + (isMaxed ? "": " progress-bar-striped active")} style={{backgroundColor: this.props.colour, width: percWidth + "%" }}>
              </div>
            </div>
            </div>
          </div>))}
        </div>
    );
  }
}
