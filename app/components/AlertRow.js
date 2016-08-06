import React, { Component } from 'react';
import { Link } from 'react-router';
import {Sounds} from "../utils/Sounds.js";
var Sound = require('react-sound');

var Switch = require('react-bootstrap-switch');

export default class AlertRow extends Component {
  constructor (props) {
    super(props);
    this.state = {
      sound: Config.get("alert.sound."+this.props.alertName, ""),
      play_request: false,
      playing: false,
      loading: false,
    };
  }
  changeConfig (state) {
    Config.set("alert."+this.props.alertName, state);
  }

  setSound (ev) {
    this.setState({ sound: ev.target.value });
      Config.set("alert.sound."+this.props.alertName, ev.target.value);
  }

  togglePlay() {
    var state = {};

    if (this.state.play_request === true) { state = { play_request: false, playing: false, loading: false }; }
    else { state = { play_request: true, loading: true, playing: false }; }
    this.setState(state);
  }

  render() {
    var style = {};
    if (this.props.fullHeight === true) {
      style = {
        "flex": 1,
        "display": "flex",
        "justifyContent": "center",
        "flexDirection": "column"
      };
    }
    var soundOptions = [];
    for (var name in Sounds) {
      soundOptions.push(<option value={name}>{name}</option>);
    }
    var sound = null;
    if (this.state.play_request) {
      // This is such a shit way of playing a sound. Whoever came up with this aught to
      // just completely delete this project. Im just going to use this for now as its
      // immediately easier, but as soon as advanced alerts come in, just changing it for a non
      // rendered audio tag.
      sound = <Sound  url={"./sounds/" + Sounds[this.state.sound]}
                      playStatus={Sound.status.PLAYING}
                      onLoading={() => { this.setState({ loading: true }); }}
                      onPlaying={() => { this.setState({ playing: true, loading: false }); }}
                      onFinishedPlaying={() => { this.setState({ play_request: false, loading: false, playing: false }); }}
              />;
    }
    return (
      <div className="ruled-row " style={style}>
        {sound}
        <div className="flex-row">
          <div className="flex-col-sm-6">
          <strong>{this.props.name}</strong>
          </div>

          <div className="flex-col-sm-3">
            <select value={this.state.sound} onChange={this.setSound.bind(this)} style={{width: "90%"}} className="form-control">
              <option value={""}>No Sound</option>
              {soundOptions}
            </select>
          </div>
          <div className="flex-col-sm-1"><button onClick={this.togglePlay.bind(this)} className={"btn btn-success" + (this.state.sound == "" ? "btn-disabled" : "")}>
          <i className={"fa "+(this.state.loading ? "fa-spin fa-refresh" : (this.state.playing ? "fa-pause" : "fa-play") )}></i>
          </button><br /> {this.state.loading} {this.state.playing} {this.state.play_request}</div>
          <div className="flex-col-sm-2 text-right">
            <Switch state={Config.get("alert."+this.props.alertName)} size="small" labelText="x" onChange={this.changeConfig.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
