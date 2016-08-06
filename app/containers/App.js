import React, { Component, PropTypes } from 'react';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render() {
    return (
      <div className="flex-container-fluid">
        {this.props.children}
      </div>
    );
  }

  onComponentWillUnmount () {
    Config.save();
  }
}
