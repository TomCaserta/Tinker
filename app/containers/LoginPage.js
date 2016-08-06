import React, { Component } from 'react';
import {hashHistory} from 'react-router';
const log = require("../utils/logger.js")("LoginPage");

export default class Login extends Component {
  constructor (props) {
    super(props);
    this.state = {
      apiKey: Config.get("api_key", ""),
      error: null
    };
  }

  componentDidMount () {
    if (this.state.apiKey !== "") {
      this.onLogin();
    }
  }

  onKeyChange (ev) {
    this.setState({
      apiKey: ev.target.value
    });
  }

  onLogin () {
    log.info(this.state.apiKey);
    TornAPI.setAPIKey(this.state.apiKey);
    this.setState({error: null});
    TornAPI.user(null, ["bars", "notifications", "education"]).once().then((response) => {
      log.info(response, this.state);
      log.info("Caching torn data..");
      Config.set("api_key", this.state.apiKey);
      this.cacheAndPreloadData().then(() => {
        hashHistory.push('/information/');
      });
    }).catch((error) => {
      console.error(error);
      this.setState({"error": error});
    });
  }

  cacheAndPreloadData () {
    var promises = [];
    var registerCacheData = [{
      "member": "torn",
      "selections": ["items","medals","honors","organisedcrimes","gyms","companies","properties","education","stocks"]
    }];
    for (var x = 0; x < registerCacheData.length; x++) {
      var m = registerCacheData[x];
      promises.push(TornAPI[m.member].call(TornAPI,m.selections).once());
    }
    log.info(registerCacheData, promises);
    return Promise.all(promises);
  }

  render() {
    return (
      <div className="login-box v-center col-sm-4 col-sm-offset-4">
        <div className="box-content">
          {(this.state.error !== null ? <div className="alert alert-error">
          {JSON.stringify(this.state.error)}
          </div>: "")}
          <div className="form-group">
            <input value={this.state.apiKey} onChange={this.onKeyChange.bind(this)} className="form-control" placeholder="Enter API Key" />
          </div>
          <button onClick={this.onLogin.bind(this)} className="col-sm-12 btn btn-lg btn-brand">
            Begin Trackly
          </button>
        </div>
      </div>
    );
  }
}
