import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import LoginPage from './containers/LoginPage';
import Navigator from './containers/Navigator';
import Home from './components/Home';
import NotepadPage from './containers/NotepadPage';
import InformationPage from './containers/InformationPage';
import PriceChecker from './containers/PriceChecker';
import AlertsPage from './containers/AlertsPage';
import TravelRun from './containers/TravelRun';
import StockAlerts from './containers/StockAlerts';
// import Faction from './containers/Faction';
// import Desktop from './containers/Desktop';
import SettingsPage from './containers/SettingsPage';
require("babel-polyfill");

export default (
  <Route path="/"  component={App}>
    <IndexRoute component={LoginPage} />
    <Route path="/information" component={Navigator}>
      <IndexRoute component={InformationPage} />
      <Route path="/notepad/edit" component={NotepadPage} />
      <Route path="/price-checker" component={PriceChecker} />
      <Route path="/travel-run" component={TravelRun} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/stocks" component={StockAlerts} />
      <Route path="/settings" component={SettingsPage} />
    </Route>
  </Route>
);
