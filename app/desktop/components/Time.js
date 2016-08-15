import React, { Component } from 'react';
import {timeContainer} from "../desktop.css";
var moment = require('moment-timezone');

export class Time extends Component {
  constructor (props) {
    super (props);
    this.state = {
      time: this.getTCT()
    };
    this.timer = null;
  }

  getTCT () {
    return moment().tz("UTC").format("HH:mm:ss");
  }

  componentDidMount () {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.setState({ time: this.getTCT() });
    }, 1000);
  }

  componentWillUnmount () {
    window.clearInterval(this.timer);
  }

  render () {

    return (<div className={timeContainer}>
      {this.state.time}
    </div>);
  }
}
