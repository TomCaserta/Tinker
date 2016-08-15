import React, { Component } from 'react';
import Box from "../components/Box";
import AlertRow from "../components/AlertRow";
import { Link } from 'react-router';
const log = require("../utils/logger.js")("StockAlerts");

export default class StockAlerts extends Component {
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
