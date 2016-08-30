import React, { Component } from 'react';
import {Bars} from "./Bars";
import {Time} from "./Time";
import {leftContainer} from "../desktop.css";

export class Desktop extends Component {
  constructor (props) {
    super (props);
    this.state = {
      "bars": {

      }
    };
    this.timer = null;
  }

  componentDidMount () {
    this.timer = TornAPI.user(null, ["bars"]).watch({ interval: 10 });
    this.timer.onData((data) => {
      this.setState({ bars: data });
    });
  }

  render () {
    return (<div className="root">
     <Bars />
     <div className={leftContainer}>
      <Time />
     </div>
    </div>);
  }
}
