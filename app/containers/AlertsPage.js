import React, { Component } from 'react';
import Box from "../components/Box";
import AlertRow from "../components/AlertRow";
import { Link } from 'react-router';
const log = require("../utils/logger.js")("AlertsPage");
/*
    TODO: Move the logic out of the AlertRow component to allow for not only
    better code in general but also reusabilty and the ability to disallow
    multiple sounds playing at once.
 */
export default class AlertsPage extends Component {
  constructor (props) {
    super(props);
    this.state = {

    };
  }

  modifyConfig (name, state) {

  }

  render() {
    return (
      <div className="">
        <div className="flex-row">
          <Box size="12">
            <div className="box-title">Simple Alerts</div>
            <AlertRow name="Full Nerve" alertName="full_nerve" />
            <AlertRow name="Full Happy" alertName="full_happy" />
            <AlertRow name="Full Energy" alertName="full_energy" />
            <AlertRow name="Drug Cooldown" alertName="drug_cooldown" />
            <AlertRow name="Medical Cooldown" alertName="medical_cooldown" />
            <AlertRow name="Booster Cooldown" alertName="booster_cooldown" />
            <AlertRow name="Reached Destination" alertName="reached_destination" />
            <AlertRow name="Completed Education" alertName="completed_education" />
            <AlertRow name="New Mail" alertName="new_message" />
            <AlertRow name="New Event" alertName="new_event" />
            <AlertRow name="New Competition" alertName="new_event" />
            <AlertRow name="New Award" alertName="new_award" />
            <AlertRow name="Left Hospital" alertName="left_hospital" />
            <AlertRow name="Left Jail" alertName="left_jail" />
            <AlertRow name="Low Health" alertName="low_health" />
            <AlertRow name="Race Complete" alertName="race_complete" />
            <AlertRow name="Auction Outbid" alertName="auction_outbid" />
          </Box>

        </div>

      </div>
    );
    /*<div className="flex-row">
    //     <Box size="12">
    //       <div className="box-title">Advanced Alerts <button style={{ height: "100%", "paddingTop": "0px", "paddingBottom": "0px", "borderRadius": "0px"}} className="btn btn-success pull-right"><i style={{"verticalAlign": "middle"}} className="fa fa-plus"></i></button></div>
    //
    //
    //     </Box>
    // </div>
    */
  }
}
