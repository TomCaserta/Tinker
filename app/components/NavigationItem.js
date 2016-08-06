import React, { Component } from 'react';
import { Link } from 'react-router';


export default class NavigationItem extends Component {
  render() {
    return (
          <li className={this.props.path == this.props.current ? "sidenav-active" :""}>
            <Link to={this.props.path}>
            <div className={"sidenav-icon" +this.props.icon}></div>
            <div className="sidenav-content">
              <h6 className="sidenav-name">
                {this.props.name}
              </h6>
                {this.props.description}
            </div>
            </Link>
          </li>

    );
  }
}
