import React, { Component } from 'react';
import {barContainer, barLabel, barValue, bar, barFull} from "../desktop.css";

export class Bars extends Component {
  constructor (props) {
    super (props);
  }

  render () {

    return (<div className={barContainer}>
      <div className={bar}>
        <div className={barLabel}>Energy</div>
        <div className={barFull}>
          <div className={barValue} style={{width: "40%"}}></div>
        </div>
      </div>
      <div className={bar}>
        <div className={barLabel}>Nerve</div>
        <div className={barFull}>
          <div className={barValue} style={{width: "60%"}}></div>
        </div>
      </div>
      <div className={bar}>
        <div className={barLabel}>Happy</div>
        <div className={barFull}>
          <div className={barValue} style={{width: "70%"}}></div>
        </div>
      </div>
    </div>);
  }
}
