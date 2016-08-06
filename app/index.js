import React from 'react';
import { render } from 'react-dom';
import { Router, hashHistory } from 'react-router';
import routes from './routes';
import './app.global.css';
import './flex.global.css';
import {TornAPI} from "./api/torn.js";

import {Wrapper as APIWrapper} from './ipc-wrappers/TornAPIWrapper.js';
import {Wrapper as Configuration} from './ipc-wrappers/ConfigWrapper.js';


if (typeof window !== "undefined") {
  var global = window;
}
global.TornAPI = APIWrapper();
global.Config = Configuration();
console.log(Config.get("api_key"));


if (typeof window !== "undefined") {
  window.addEventListener("unload", function () {
    Config.save();
  });

}
hashHistory.push("/");
/**
 * Number.prototype.format(n, x)
 *
 * @param integer n: length of decimal
 * @param integer x: length of sections
 */
Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

render(
    <Router history={hashHistory} routes={routes} />,
  document.getElementById('root')
);
