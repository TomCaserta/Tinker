import React, { Component } from 'react';
import {Bars} from "./Bars";
import {Time} from "./Time";
import {leftContainer} from "../desktop.css";

export class Desktop extends Component {
  constructor (props) {
    super (props);
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
