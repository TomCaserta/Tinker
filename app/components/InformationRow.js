import React, { Component } from 'react';
import { Link } from 'react-router';


export default class InformationRow extends Component {
  render() {
    var style = {};
    if (this.props.fullHeight === true) {
      style = {
        "flex": 1,
        "display": "flex",
        "justifyContent": "center",
        "flexDirection": "column"
      };
    }
    return (
      <div className="ruled-row " style={style}>
        <div className="flex-row">
          <div className="flex-col-sm-4">
          <strong>{this.props.name}</strong>
          </div>
          <div className="flex-col-sm-8 text-right">
          {this.props.children}
          </div>
        </div>
      </div>

    );
  }
}
