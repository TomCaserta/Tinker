import React, { Component } from 'react';

import { Link } from 'react-router';
import ReactQuill from "react-quill";
const log = require("../utils/logger.js")("NotepadPage");

  export default class NotepadPage extends Component {
  constructor (props) {
    super(props);
    this.state = {
      value: Config.get("notepad", this.getDefaultText())
    };
  }

  getDefaultText () {
    return "Populate your notepad, it saves automatically...";
  }

  onTextChange (value) {
    log.info("Changed!", value);
    Config.set("notepad", value);
    this.setState({
      "value": (value ? value : this.getDefaultText())
    });
  }
  render() {
    return (
      <ReactQuill theme="snow" value={this.state.value} onChange={this.onTextChange.bind(this)} />
    );
  }
}
