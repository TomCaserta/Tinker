import React, { Component } from 'react';
import NavigationItem from "../components/NavigationItem.js";
import { Link } from 'react-router';


export default class Navigator extends Component {
  render() {

    return (
      <div className="flex-row">
      <div className="sidenav flex-col-sm-3 no-gutter">
              <ul>
                  <NavigationItem path={"/information"} current={this.props.location.pathname} name="Information" description="Basic details" />
                  <NavigationItem path={"/price-checker"} current={this.props.location.pathname} name="Price Checker" description="Check bazaar/market prices" />
                  <NavigationItem path={"/travel-run"} current={this.props.location.pathname} name="Travel Run" description="Prices of items" />
                  <NavigationItem path={"/notepad/edit"} current={this.props.location.pathname} name="Notepad" description="Simple writing pad" />
                  <NavigationItem path={"/alerts"} current={this.props.location.pathname} name="Alerts" description="Set/edit notifications" />
                  <NavigationItem path={"/settings"} current={this.props.location.pathname} name="Settings" description="Change settings" />
              </ul>
      </div>
        <div className="content flex-col-sm-9">
          {this.props.children}
        </div>
      </div>
    );
  }
}
