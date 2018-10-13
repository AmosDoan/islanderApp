import React from 'react';
import ReactDOM from 'react-dom';
import {Icon, Button, List, ListItem, Row, Col} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

export default class WeatherView extends React.Component {
  constructor(props) {
    super(props);
    let lang = localStorage.getItem("lang");
 
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let cache = JSON.parse(localStorage.getItem("weather"));

    this.state = {
      cache: cache.data,
      strings: strings,
      forecast: []
    };
    
    this.readForecast()
  }

  readForecast() {
    let cache = JSON.parse(localStorage.getItem("forecast"));
    let useCache = false;
    if(cache != null) {
      let cacheValidUntil = new Date(cache.createdDateTime);
      cacheValidUntil.setHours(cacheValidUntil.getHours() + 1);
      // cache will be valid until + 1 hour of the created hour.
      let currentDateTime = new Date();
      if(currentDateTime <= cacheValidUntil) {
        useCache = true;
      }
    }

    if(useCache) {
      var this_ = this;
      const sleepTime = 500;
      // lazy loading using Promise mechanism
      new Promise(function(resolve, reject) {
        setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
      }).then(function(result) {
        let forecast = cache.data;
        console.log(forecast);
        this_.setState({
          forecast: forecast
        });
      });

      return; 
    }

    var this_ = this;
    let URL = "https://api.openweathermap.org/data/2.5/forecast?q=Jeju,kr" + 
      "&appid=8e0c89b8e26008044c73cb82ed5e4d60";
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        this_.setState({
          forecast: res.list
        });
        localStorage.setItem("forecast", JSON.stringify({
          createdDateTime: new Date(),
          data: res.list
        }));
         
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', URL);
      xhr.send(null);
    });

  }
 
  render24Forecast() {
    let cols = [];
    const centerDiv = {textAlign: "center", width: "100%"};
    if(this.state.forecast.length > 8) {
      for(let i = 0; i < 8; i++) {
        let item = this.state.forecast[i];
        let dt = new Date(item.dt * 1000);
        let hours = dt.getHours();
        let icon = "http://openweathermap.org/img/w/" + item.weather[0].icon + ".png";
        let degree = (item.main.temp - 273.15).toFixed(1);
        let colItem = (
          <Col key={"24-col-" + i}>
            <Row>
              <div style={centerDiv}>
                <p style={{color: "#FFFFFF"}}>{hours}</p>
              </div>
            </Row>
            <Row>
              <div style={centerDiv}>
                <img src={icon} style={{width: "30px"}} />
              </div>
            </Row>
            <Row>
              <div style={centerDiv}>
                <p style={{color: "#FFFFFF"}}>{degree}</p>
              </div>
            </Row>
          </Col>
        );
        cols.push(colItem);
      }
    }
    return (
      <Row width="100%">
        {cols}
      </Row>
    );
  }

  getDayInStr(datetime) {
    let day =  datetime.getDay();
    switch(day){
      case 0 : return this.state.strings.sunday; 
      case 1 : return this.state.strings.monday;
      case 2 : return this.state.strings.tuesday;
      case 3 : return this.state.strings.wednesday;
      case 4 : return this.state.strings.thursday;
      case 5 : return this.state.strings.friday;
      case 6 : return this.state.strings.saturday;
      default : console.log("wrong day information"); return null;
    }
  }

  renderForecastList() {
    if(this.state.forecast.length < 1) return null;
    let listItems = [];
    let jump = 8;
    const centerDiv = {width: "100%", textAlign: "center"};
    const imageWidth = {width: "35px"};
    const fontColor = {color: "#FFFFFF", paddingTop: "5px"}
    let minTemp = 9999;
    let maxTemp = 0;
    let prevdt = new Date(this.state.forecast[0].dt * 1000);
    let current = new Date();
    let weatherIcon = "";
    let needUpdate = false;

    for(let i = 0; i < this.state.forecast.length; i++) {
      let item = this.state.forecast[i];
      let dt = new Date(item.dt * 1000);

      if(current.getDate() == dt.getDate() || prevdt.getDate() == current.getDate()) {
        // skip today
        prevdt = dt;
        continue;
      }

      if(dt.getHours() == 12) { 
        weatherIcon = "http://openweathermap.org/img/w/" + item.weather[0].icon + ".png";
        needUpdate = true;
      }
      if(prevdt.getDate() != dt.getDate()) {
        // a new day, should update minTemp and maxTemp and add 
        let listitem = (
          <div key={"weather-list-" + i} style={{padding: "0px"}}>
            <Row>
              <Col width="30%">
                <div style={centerDiv}>
                  <p style={fontColor}>{prevdt.getDate() + " (" + this.getDayInStr(prevdt) + ")"}</p>
                </div>
              </Col>
              <Col width="40%">
                <div style={centerDiv}><img src={weatherIcon} style={imageWidth} /></div>
              </Col>
              <Col width="30%">
                <div style={centerDiv}>
                  <p style={fontColor}>
                    {(minTemp - 273.15).toFixed(1) + " / " + (maxTemp - 273.15).toFixed(1)}
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        );
        listItems.push(listitem);
        minTemp = 9999;
        maxTemp = 0;
        needUpdate = false;
      }

      if(minTemp > item.main.temp) minTemp = item.main.temp;
      if(maxTemp < item.main.temp) maxTemp = item.main.temp;

      prevdt = dt;
    }

    // last one
    if(needUpdate) {
      let item = (
        <div key={"weather-list-last"} style={{padding: "0px"}}>
          <Row>
            <Col width="30%">
              <div style={centerDiv}>
                <p style={fontColor}>{prevdt.getDate() + " (" + this.getDayInStr(prevdt) + ")"}</p>
              </div>
            </Col>
            <Col width="40%">
              <div style={centerDiv}><img src={weatherIcon} style={imageWidth}/></div>
            </Col>
            <Col width="30%">
              <div style={centerDiv}>
                <p style={fontColor}>
                  {(minTemp - 273.15).toFixed(1) + " / " + (maxTemp - 273.15).toFixed(1)}
                </p>
              </div>
            </Col>
          </Row>
        </div>
      );
      listItems.push(item);
    }

    return (
      <div>
        {listItems}
      </div>
    );
  }

  render() {
    const centerDiv = {textAlign: "center"};
    let forecast24 = this.render24Forecast();
    const current = new Date();
    let forecastList = this.renderForecastList();

    return (
      <div style={centerDiv}>
        <h2>{this.state.strings.jeju}</h2>
        <h4>
          {current.getFullYear() + "/" + (current.getMonth() + 1) + 
            "/" + current.getDate() + " " + this.getDayInStr(current)}
        </h4>
        <Row>
          <Col width="35%"></Col>
          <Col width="15%">
            <img src={this.state.cache.weatherIcon} />
          </Col>
          <Col width="15%">
            <h2 style={{marginTop: "9px", marginBottom: "9px"}}>
              {this.state.cache.weatherDegree + "ºC"}
            </h2>
          </Col>
          <Col width="35%"></Col>
        </Row>
        <div style={{borderRadius: "6px", backgroundColor: "rgba(0, 0, 0, .4)", padding: "3%", 
          marginLeft: "2%", marginRight: "2%", marginTop: "5%"}}>
          {forecast24}
        </div>
        <div style={{borderRadius: "6px", backgroundColor: "rgba(0, 0, 0, .4)", padding: "3%", 
          marginLeft: "2%", marginRight: "2%", marginTop: "5%"}}>
          {forecastList}
        </div>
      </div>
    )
  }
}
 