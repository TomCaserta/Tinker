import React, { Component } from 'react';
import { Link } from 'react-router';
import Box from "../components/Box";
var Switch = require('react-bootstrap-switch');
import InformationRow from "../components/InformationRow";
const log = require("../utils/logger.js")("SettingsPage");

  export default class SettingsPage extends Component {
  constructor (props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount () {
  }
  render() {
    return (
      <div className="">
        <div className="flex-row">
          <Box size="12">
            <div className="box-title">Display Settings</div>
            <InformationRow name="Animated Numbers">
              <Switch size="small" labelText="x" />
            </InformationRow>
            <InformationRow name="Animated Progressbars">
              <Switch size="small" labelText="x" />
            </InformationRow>
            <InformationRow name="Localised Time">
              <Switch size="small" labelText="x" />
            </InformationRow>
            <InformationRow name="Helpful Hints">
              <Switch size="small" labelText="x" />
            </InformationRow>
          </Box>

        </div>
        <div className="flex-row">
                <Box size="12">
                  <div className="box-title">Application Settings</div>
                  <InformationRow name="Start up with computer">
                    <Switch size="small" labelText="x" />
                  </InformationRow>
                  <InformationRow name="Disable all API calls">
                    <Switch size="small" labelText="x" />
                  </InformationRow>

                </Box>
        </div>
      </div>
    );
  }
}
