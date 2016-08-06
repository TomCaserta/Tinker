import React, { Component } from 'react';


export default class Box extends Component {
  render() {
    return (
      <div className={"box-container "+(this.props.vert?"box-vertical":"box-horizontal")+" flex-"+(this.props.vert?"row":"col")+"-sm-"+this.props.size}>
        <div className="boxed box">
        {this.props.children}
        </div>
      </div>
    );
  }
}
