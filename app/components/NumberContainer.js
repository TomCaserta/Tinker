import React, { Component } from 'react';
import AnimatedNumber from 'react-animated-number';

export class NumberContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      configuration: Config.get("number_config", { "animated": true, "duration": 400 })
    };
  }

  render () {
    var number = this.props.value ? this.props.value : 0;
    return (this.state.configuration.animated ?
      <AnimatedNumber value={number} duration={this.state.configuration.duration} formatValue={(this.props.formatted !== false ? n => n.format() : n => n)} />
    : <span>{number}</span>);
  }
}
