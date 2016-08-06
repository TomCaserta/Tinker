import SelectSearch from 'react-select-search';
import InformationRow from "../components/InformationRow";
import Box from "../components/Box";
import React, { Component } from 'react';
import {torn2Array} from "../api/torn.js";
import Fuse from 'fuse.js';
import {Table, Thead, Tr, Th,Td, Tbody} from "reactable";
const log = require("../utils/logger.js")("TravelPage");

const COUNTRIES = {
  1: "Mexico",
  2: "Cayman Islands",
  3: "Canada",
  4: "Hawaii",
  5: "United Kingdom",
  6: "Argentina",
  7: "Switzerland",
  8: "Japan",
  9: "China",
  10: "UAE",
  11: "South Africa"
};


const IMAGES = {
  1: "mexico",
  2: "cayman_islands",
  3: "canada",
  4: "hawaii",
  5: "uk",
  6: "argentina",
  7: "switzerland",
  8: "japan",
  9: "china",
  10: "uae",
  11: "south_africa"
};


export default class TravelRun extends Component {
  constructor (props) {
    super(props);
    this.state = {
      items: {},
      travelData: [],
      countryFilter: 0,
      typeFilter: 0,
      fuse: new Fuse([], { keys: ["name"], threshold: 0.3 }),
      textFilteredRows: [],
      textFilter: ""
    };
    this.travelTimer = null;
  }

  componentWillUnmount () {
    clearInterval(this.travelTimer);
  }

  componentDidMount () {
    TornAPI.torn(["items"], false, 86400).once().then((data) => {
      var items=  data.get("items");
      this.setState({"items": items });
      this.travelTimer = setInterval(() => {
        try {
          this.fetchTravelRun(items).catch((e) => { console.error(e); });
        }
        catch (e) {
            console.error(e);
        }
      }, 100000);

        this.fetchTravelRun(items).catch((e) => { console.error(e); });
    }).catch(function (e) {
      console.error(e);
     });
  }

  fetchTravelRun (currItemList) {
    log.info("Fetching items");
    var cacheData = TornAPI.getCache("travelrun", "records.json", [], 99);
    if (cacheData !== false) {
      console.log("Cached data!");
      return Promise.resolve(cacheData.data).then( (resp) => {
        this.state.fuse.set(resp);
        this.setState({ "travelData":  resp, textFilteredRows: (this.state.textFilter == "" ? resp : this.state.fuse.search(this.state.textFilter)) });
        return resp;
      });
    }
    log.info("Fetching API data");
    return fetch("http://travelrun.torncentral.com/records.json").then((resp) => {
      return resp.json();
    }).then((resp) => {

      var i = torn2Array(resp);
      var tData = [];
      i.forEach(function (country) {
        var key = country.key;
        delete country["key"];
        var item = torn2Array(country);
        var items = item.map((individualItem) => {
          return {
            countryID: key,
            itemID: individualItem.key,
            ...individualItem,
            ...currItemList[individualItem.key]
          };
        });
        tData.push(...items);
      });

      TornAPI.addCache("travelrun", "records.json", [], tData);
      this.state.fuse.set(tData);
      this.setState({ "travelData":  tData, textFilteredRows: (this.state.textFilter == "" ? tData : this.state.fuse.search(this.state.textFilter)) });
      return resp;
    });
  }


  renderItem (item) {
    let imgStyle = {
        borderRadius: '50%',
        verticalAlign: 'middle',
        marginRight: 10
    };
    return (<span>
      <img style={imgStyle} src={"http://www.torn.com/images/items/"+item.key+"/small.png"} />
      <span>{item.name}</span>
      </span>);
  }

  onFilterCountry (ev) {
    log.info(ev.target.value);
    this.setState({countryFilter: ev.target.value});
  }
  onFilterType (ev) {
    this.setState({typeFilter: ev.target.value});
  }
  onFilterName (value) {
    this.setState({textFilteredRows: (value == "" ? this.state.travelData : this.state.fuse.search(value)), textFilter: value });
  }

  render() {
    var mappedCountryData = this.state.textFilteredRows.filter((item) => {
      if (this.state.countryFilter != 0 && item.countryID !== this.state.countryFilter) return false;
      if (this.state.typeFilter != 0 && item.type !== this.state.typeFilter) return false;
      return true;
    }).map((item) => {
      var cName = COUNTRIES[item.countryID];
      // /images/v2/travel_agency/pinpoints/pinpoints_mexico.png
      return (<Tr key={item.key}>
                <Td style={{width: "20%"}} value={cName} column="country">
                  <span>
                  <div className={"flag"} style={{ backgroundImage: "url(https://www.torn.com/images/v2/travel_agency/pinpoints/pinpoints_"+IMAGES[item.countryID]+".png)"}}></div>
                  {cName}
                  </span>
                </Td>
                <Td style={{width: "40%"}} column="item" value={item.name}>
                  {this.renderItem(item)}
                </Td>
                <Td column="type">
                  {item.type}
                </Td>
                <Td column="stock">
                  {item.left}
                </Td>
                <Td column="price" value={item.cost}>
                  <span>${item.cost.format()}</span>
                </Td>
              </Tr>);
    });
    var countryIds = Object.keys(COUNTRIES);
    var countryOpts = Object.values(COUNTRIES).map(function (countryData, i) {
      return (<option value={countryIds[i]}>{countryData}</option>);
    });

    var types = {};
    var typeNames = this.state.travelData.map((item) => {
      return item.type;
    }).filter(function(type) {
        return types.hasOwnProperty(type) ? false : (types[type] = true);
    }).map((type) => {
      return (<option value={type}>{type}</option>);
    });
    return (
      <div className="">
        <div className="flex-row">
          <Box size="12">
            <div className="flex-row">
            <div className="flex-col-sm-4">
              <select onChange={this.onFilterCountry.bind(this)} className="form-control">
                <option value={0}>Filter Country</option>
                {countryOpts}
              </select>
            </div>
            <div className="flex-col-sm-4" style={{paddingLeft: 7.5 }}>
              <input onChange={(ev) => { this.onFilterName(ev.target.value); }} className="form-control" placeholder="Filter items..." />
            </div>

              <div className="flex-col-sm-4" style={{paddingLeft: 7.5 }}>
                <select onChange={this.onFilterType.bind(this)} className="form-control">
                <option value={0}>Filter Types</option>
                {typeNames}
                </select>
              </div>
            </div>
          </Box>
        </div>
        <div className="flex-row">
          <Box size="12">
            <div className="travel-run">
              <Table sortable={true} className="table table-striped" id="">
                  <Thead>
                    <Th width="20%" column="country">
                      Country
                    </Th>
                    <Th width="40%" column="item">
                     Item
                    </Th>
                    <Th column="type">
                      Type
                    </Th>
                    <Th column="stock">
                      Stock
                    </Th>
                    <Th column="price">
                      Price Each
                    </Th>
                  </Thead>
                    {mappedCountryData}

              </Table>
            </div>
          </Box>
        </div>
      </div>
    );
  }
}
