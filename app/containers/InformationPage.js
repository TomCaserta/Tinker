import React, { Component } from 'react';
import {hashHistory} from 'react-router';
import StatusBar from "../components/StatusBar";
import InformationRow from "../components/InformationRow";
import Box from "../components/Box";
import {torn2Array} from "../api/torn.js";
import moment from "moment";
import ReactSafeHtml from 'react-safe-html';
import {NumberContainer} from "../components/NumberContainer";
const log = require("../utils/logger.js")("InformationPage");

export default class InformationPage extends Component {
  constructor (props) {
    super(props);
    this.userStream = null;
    this.mailEventStream = null;
    this.state = {
      userInformation: null,
      education_total: 0,
      education_data: null,
      messages: [],
      events: [],
      previousMessagesUnseen: 0,
      previousEventsUnseen: 0,
      previousMessagesUnread: 0
    };
  }

  componentWillUnmount () {
    this.userStream.cancel();
    this.mailEventStream.cancel();
  }
  componentDidMount () {
    this.userStream = TornAPI.user(null, ["bars", "notifications", "profile","education", "money", "cooldowns", "travel"]).watch(10);
    this.userStream.onData((data) => {
      var toSet = {

      };
      if (data.get("notifications.messages") > this.state.previousMessagesUnseen) {
        this.checkMailsAndEvents("messages", true).once().then(this.setMailEvents.bind(this));
      }
      if (data.get("notifications.events") > this.state.previousEventsUnseen) {
        toSet.previousEventsUnseen = data.get("notifications.events");
        this.checkMailsAndEvents("events", true).once().then(this.setMailEvents.bind(this));
      }
      var eduCurrent = data.get("education_current");
      if (eduCurrent !== null || eduCurrent !== 0) {
        toSet.education_total= data.get("education_timeleft");
        this.fetchEducationFullTime ( data.get("education_current"));
      }
      else {
        toSet.education_total= 0;
        toSet.education_data = null;
      }
      toSet.userInformation = data;
      this.setState(toSet);
      log.info("Setting data to", data);
    });
    this.userStream.onError((err) => {
      console.error(JSON.stringify(err));
      throw err;
    });
    this.mailEventStream = this.checkMailsAndEvents().watch(60);
    this.mailEventStream.onData((data) => {
      this.setMailEvents(data);
    });
  }

  fetchEducationFullTime (currID) {
    TornAPI.torn(["education"], false, 86400).once().then((eduData) => {

      var curr = eduData.get("education."+currID);
      if (curr) {
        this.setState({ education_total: curr.duration, education_data: curr });
      }
      else {
          this.setState({ education_total: 1, education_data: {} });
      }
    });
  }

  setMailEvents (data) {
    var cbdata = {};
    console.log(data);
    var mails = data.get("messages");
    var events = data.get("events");
    if (mails) {
      cbdata.messages = torn2Array(mails).reverse();
      cbdata.previousMessagesUnseen = cbdata.messages.reduce((previousValue, currentValue) => {
        if (previousValue instanceof Object) previousValue =(1 - previousValue.seen);
        return previousValue + (1 - currentValue.seen);
      });
      cbdata.previousMessagesUnread = cbdata.messages.reduce((previousValue, currentValue) => {
        if (previousValue instanceof Object) previousValue =(1 - previousValue.read);
        return previousValue + (1 - currentValue.read);
      });
    }
    if (events) {
      cbdata.events = torn2Array(events).reverse();
    }
    this.setState(cbdata);
  }

  checkMailsAndEvents (sel, force) {
    return TornAPI.user(null, sel ?sel: ["events", "messages"], force);
  }
  getProxy () {
    // Simple proxy for when there is no UI data.
    return new Proxy({}, { "get": (target, name) => {
        if (name == "get") { return (x, d) => d; }
        else return name;
      }
    });
  }

  render() {
    var currentInformation = null;
      var uI = this.getProxy();
    if (this.state.userInformation !== null && typeof this.state.userInformation !== "undefined") {
       uI = this.state.userInformation;
    }
        log.info("Re-rendering", uI);
      var messages = this.state.messages.map(function (message) {
        return (<tr key={message.key}><td><small>{(message.name?message.name:"System")}</small></td><td width="65%">{message.title}<br /><small className="text-muted">{moment(message.timestamp*1000).format('MMMM Do YYYY, h:mm:ss a')}</small></td></tr>);
      });
      var events = this.state.events.map(function (event) {
        return (<tr key={event.key}><td><ReactSafeHtml html={event.event} /><small className="text-muted">{moment(event.timestamp*1000).format('MMMM Do YYYY, h:mm:ss a')}</small></td></tr>);
      });
      log.info(this.state.education_total, uI.get("education_timeleft"),this.state.education_total - uI.get("education_timeleft"));
       currentInformation = (
        [<div key="status-bars"  className='flex-row'>
          <Box size="4">
            <StatusBar className="ruled-row" name="Energy"
                     value={uI.get("energy.current", 0)}
                     total={uI.get("energy.maximum", 0)}
                     increment={uI.get("energy.increment", 0)}
                     interval={uI.get("energy.interval", 0)}
                     ticktime={uI.get("energy.ticktime", 0)}
                     fulltime={uI.get("energy.fulltime", 0)}
                     cssName="energy"/>

           <StatusBar className="ruled-row" name="Nerve"
                      value={uI.get("nerve.current", 0)}
                      total={uI.get("nerve.maximum", 0)}
                      increment={uI.get("nerve.increment", 0)}
                      ticktime={uI.get("nerve.ticktime", 0)}
                      interval={uI.get("nerve.interval", 0)}
                      fulltime={uI.get("nerve.fulltime", 0)}
                      cssName="nerve"/>
            <StatusBar className="ruled-row" name="Happy"
                       value={uI.get("happy.current", 0)}
                       total={uI.get("happy.maximum", 0)}
                       increment={uI.get("happy.increment", 0)}
                       ticktime={uI.get("happy.ticktime", 0)}
                       interval={uI.get("happy.interval", 0)}
                       fulltime={uI.get("happy.fulltime", 0)}
                       cssName="happy"/>

             <StatusBar className="ruled-row" name="Life"
                        value={uI.get("life.current", 0)}
                        total={uI.get("life.maximum", 0)}
                        increment={uI.get("life.increment", 0)}
                        ticktime={uI.get("life.ticktime", 0)}
                        interval={uI.get("life.interval", 0)}
                        fulltime={uI.get("life.fulltime", 0)}
                        cssName="life"/>
          </Box>

          <Box size="4">
            <StatusBar className="ruled-row" name="Education"
                       value={this.state.education_total - uI.get("education_timeleft", 0)}
                       total={this.state.education_total}
                       fulltime={uI.get("education_timeleft")}
                       showTotal={false}
                       cssName="education"/>
            <StatusBar className="ruled-row" name={uI.get("travel.destination", "")}
                       value={(uI.get("travel.timestamp") - uI.get("travel.departed")) - uI.get("travel.time_left", 0)}
                       total={uI.get("travel.timestamp") - uI.get("travel.departed", 0)}
                       increment={1}
                       interval={1}
                       ticktime={1}
                       fulltime={uI.get("travel.time_left", 0)}
                       showTotal={false}
                       cssName="travel"/>
            <StatusBar className="ruled-row" name="Drug"
                       fulltime={uI.get("cooldowns.drug", 0)}
                       showTotal={false}
                       showProgress={false}
                       />
            <StatusBar className="ruled-row" name="Medical"
                       fulltime={uI.get("cooldowns.medical", 0)}
                       showTotal={false}
                       showProgress={false}
                       />
            <StatusBar className="ruled-row" name="Booster"
                       fulltime={uI.get("cooldowns.booster", 0)}
                       showTotal={false}
                       showProgress={false}
                       />
            <InformationRow name="Status">
              <div className="status-text">
                <ReactSafeHtml html={uI.get("status", ["",""])[0]} />
                <ReactSafeHtml html={uI.get("status", ["",""])[1]} />
              </div>
            </InformationRow>
          </Box>
          <Box size="4">
           <InformationRow name="Money">
           <small>$<NumberContainer value={uI.get("money_onhand", 0)} /></small>
           </InformationRow>
           <InformationRow name="Networth">
           <small>$<NumberContainer value={uI.get("networth", 0)} /></small>
           </InformationRow>
           <InformationRow name="Points">
           <small><NumberContainer value={uI.get("points", 0)} /></small>
           </InformationRow>
          <InformationRow name="Messages">
            <span className={"badge"+(this.state.previousMessagesUnseen?" has-events":"")}><i className="fa fa-eye-slash"></i> <NumberContainer value={this.state.previousMessagesUnseen} /> new</span>
            <span className={"badge"+(this.state.previousMessagesUnread?" has-events":"")}><i className="fa fa-envelope"></i> <NumberContainer value={this.state.previousMessagesUnread} /> unread</span>
          </InformationRow>
          <InformationRow name="Events">
            <span className={"badge"+(uI.get("notifications.events", 0)?" has-events":"")}><i className="fa fa-eye-slash"></i> <NumberContainer value={uI.get("notifications.events", 0)} /> new</span>
          </InformationRow>
          <InformationRow name="Newspaper">
            <span className={"badge"+(uI.get("notifications.newspaper", 0)?" has-events":"")}><i className="fa fa-eye-slash"></i> <NumberContainer value={uI.get("notifications.newspaper", 0)} /> new</span>
          </InformationRow>


          </Box>
        </div>,
        <div key="events-mails" className="flex-row-auto">
          <div key="events" className="flex-row full-height" style={{marginBottom: 7.5}}>

            <Box size="6">
            <div className="box-title">Events</div>
              <div className="overflow-table">
                <table className="table table-striped full-height">
                <tbody className="">
                {events}
                </tbody>
                </table>
              </div>
            </Box>

            <Box size="6">
            <div className="box-title">Mailbox</div>
              <div className="overflow-table">
                <table className="table table-striped full-height">
                <tbody className="">
                {messages}
                </tbody>
                </table>
              </div>
            </Box>
          </div>
          </div>
        ]
      );
    return (
      <div className="flex-col">
      {currentInformation}
      </div>
    );
  }
}
