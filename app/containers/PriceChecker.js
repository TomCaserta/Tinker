import SelectSearch from 'react-select-search';
import InformationRow from "../components/InformationRow";
import Box from "../components/Box";
import React, { Component } from 'react';
import {torn2Array} from "../api/torn.js";
import {NumberContainer} from "../components/NumberContainer";
const log = require("../utils/logger.js")("PriceChecker");
/* Warning DIV soup coming up! */

export default class PriceChecker extends Component {
  constructor (props) {
    super(props);
    this.state = {
      items: [],
      selectedItem: { "value": null, "circulation": 0, "buy_price": 0, "sell_price": 0, "market_value": 0 },
      bazaarData: [],
      itemMarketData: []
    };
    this.itemMarketWatcher = null;
  }

  watchItemMarket (id) {
    if (this.itemMarketWatcher) {
      this.itemMarketWatcher.cancel();
    }
    this.itemMarketWatcher = TornAPI.market(id, ["itemmarket", "bazaar"]).watch(20);
    this.itemMarketWatcher.onData((data) => {
      this.setState({
        bazaarData: this.processItems(data.get("bazaar")),
        itemMarketData: this.processItems(data.get("itemmarket"))
      });
    });

  }

  processItems (data) {
    var itemData =torn2Array(data);
    var items = {};
    itemData.forEach(function (item) {
      if (!items.hasOwnProperty(item.cost)) {
        items[item.cost] = item;
      }
      else {
        items[item.cost].quantity = items[item.cost].quantity + item.quantity;
      }
    });
    var mergedItems = Object.values(items);
    mergedItems.sort(function (a, b) { return a.cost - b.cost; });
    return mergedItems;
  }

  componentWillUnmount () {
    log.info("Unmounting Price Checker Component");
    if (this.itemMarketWatcher) {
      log.info("Cancelling item watcher");
      this.itemMarketWatcher.cancel();
    }
  }

  componentDidMount () {
    log.info("Getting item data");
    TornAPI.torn(["items"], false, 86400).once().then((data) => {
      var itemList = torn2Array(data.get("items")).map(function (item) {

        return {...item, value: item.key };
      });
      this.setState({"items": itemList, selectedItem: itemList[0] });

      this.watchItemMarket(itemList[0].value);
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

  onItemChange (item) {
    this.setState({selectedItem: item});
    this.watchItemMarket(item.value);
  }

  openLink (itemID) {
    var a = document.createElement("a");
    a.href = "http://www.torn.com/imarket.php#/p=shop&step=shop&type=&searchname="+itemID;
    a.click();
  }

  showRow (item, key) {
    return (<li key={key}><span>$<NumberContainer value={item.cost} /></span> <span className="badge"><NumberContainer value={item.quantity} /></span></li>);
  }

  render() {
    //log.info(this.state.items);
    var item = this.state.selectedItem;
    var bazaarRows = this.state.bazaarData.map((bazaarItem, i) => {
      return this.showRow(bazaarItem, "b_"+i);
    });
    var itemMarketRows = this.state.itemMarketData.map((iItem, i) => {
      return this.showRow(iItem, "i_"+i);
    });
    return (
      <div className="">
        <div className="flex-row">
          <Box size="4">
            <SelectSearch multiple={false} onChange={this.onItemChange.bind(this)} value={item.value} maxRender={50} expandHeight={false} search={true} name={"item"} height={172} renderOption={this.renderItem.bind(this)} options={this.state.items} fuse={{
                keys      : ['name'],
                threshold : 0.3
            }} placeholder="Begin typing an item" />
          </Box>
          <div className="flex-col-sm-8">
            <div className="flex-col">
              <Box size="6" vert={true}>
                <div className="flex-col">
                  <div className="flex-row-auto">
                    <div className="flex-row">
                      <div className="flex-col-sm-12 item-title ruled-row text-center">{this.state.selectedItem.name}</div>
                    </div>
                    <div className="flex-row" style={{"minHeight": "50px"}}>
                      <div  style={{"position":"relative", "minHeight": "50px"}} className="flex-col-sm-4">
                        <img style={{"left":"50%", "position": "absolute", "top": "50%", "transform":"translateY(-50%) translateX(-50%)"}} src={item.image} />
                      </div>
                      <div className="flex-col-sm-8" style={{padding:"7.5px"}}>
                        {item.description}
                      </div>
                    </div>
                    </div>
                    <div className="flex-row-auto">
                    <div className="flex-row full-height">
                      <div className="flex-col-sm-6 full-height" style={{paddingRight:"7.5px"}}>
                        <div className="flex-col">
                            <InformationRow fullHeight={true} name="Type">
                              {item.type}
                            </InformationRow>
                            <InformationRow fullHeight={true} name="Type">
                              {item.type}
                            </InformationRow>
                            <InformationRow fullHeight={true} name="Circulation">
                            <NumberContainer value={item.circulation} />
                            </InformationRow>
                         </div>
                      </div>
                      <div className="flex-col-sm-6 full-height" style={{paddingLeft:"7.5px"}}>
                        <div className="flex-col">
                          <InformationRow fullHeight={true} name="Buy Price">
                          $<NumberContainer value={item.buy_price} />
                          </InformationRow>
                          <InformationRow fullHeight={true} name="Sell Price">
                          $<NumberContainer value={item.sell_price} />
                          </InformationRow>
                          <InformationRow fullHeight={true} name="Price">
                          $<NumberContainer value={item.market_value} />
                          </InformationRow>
                        </div>
                      </div>
                    </div>
                    </div>
                </div>
              </Box>
              <div className="flex-row-sm-6">
                <div className="flex-row" style={{height: "100%"}}>
                  <Box size="6" vert={false}>
                    <div className="flex-col full-height">

                      <div className="flex-row-auto">
                        <div className="box-title">Item Market</div>
                        <ul className="item-price-list">
                        <li><span><strong>Cost</strong></span> <span className={"pull-right"}><strong>Quantity</strong></span></li>
                        {itemMarketRows}
                        </ul>
                      </div>

                      <div className="flex-row-auto" style={{flexGrow: 0, flexShrink:0, minHeight: 50 }}>
                        <button onClick={this.openLink.bind(this, item.key)} className={"btn btn-brand"}>OPEN MARKET</button>
                      </div>
                    </div>
                  </Box>
                  <Box size="6" vert={false}>
                  <div className="flex-col full-height">

                    <div className="flex-row-auto">
                      <div className="box-title">Bazaar</div>
                      <ul className="item-price-list">
                      <li><span><strong>Cost</strong></span> <span className={"pull-right"}><strong>Quantity</strong></span></li>
                      {bazaarRows}
                      </ul>
                    </div>


                  </div>
                  </Box>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
