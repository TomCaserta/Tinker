/* Shared Imports */
import React from 'react';
import { render } from 'react-dom';
import {Wrapper as APIWrapper} from './ipc-wrappers/TornAPIWrapper.js';
import {Wrapper as Configuration} from './ipc-wrappers/ConfigWrapper.js';

/* Main Page Imports */
import { Router, hashHistory } from 'react-router';
import routes from './routes';

/* Desktop Imports */
import {Desktop} from "./desktop/components/Desktop";

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

if (typeof window !== "undefined") {
  var global = window;
}
global.TornAPI = APIWrapper();
global.Config = Configuration();

if (window.location.pathname.indexOf("desktop.html") === -1) {


  if (typeof window !== "undefined") {
    window.addEventListener("unload", function () {
      Config.save();
    });

  }
  hashHistory.push("/");


  render(
      <Router history={hashHistory} routes={routes} />,
    document.getElementById('root')
  );
}
else {
  render(
    <Desktop />,
    document.getElementById('root')
  );
}
