import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {GoogleApiWrapper} from 'google-maps-react';

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null
    };
  }

  componentDidMount() {
    this.loadMap(); 
  }

  loadMap() {
    if (this.props && this.props.google) { 
      const {google} = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map; 
      const node = ReactDOM.findDOMNode(mapRef); 
      let {initialCenter, zoom} = this.props;
      const {lat,lng} = initialCenter;
      const center = new maps.LatLng(lat, lng);

      const mapConfig = Object.assign({}, {
        center: center, 
        zoom: zoom, 
        mapTypeId: 'roadmap' 
      })

      this.map = new maps.Map(node, mapConfig); 
      this.setState({map: map});
    }
  }

  renderMarkers() {
    const {children} = this.props;

    if(!children) return;

    return React.Children.map(children, c => {
      return React.cloneElement(c, {
        map: this.map,
        google: this.props.google,
        mapCenter: this.props.initialCenter
      });
    })
  }

  render() {
    const style = { 
      width: '100vw',
      height: '35vh'
    }

    return ( 
      <div ref="map" style={style}>
        {this.renderMarkers()}
      </div>
    )
  }
}

MapContainer.propTypes = {
  google: React.PropTypes.object,
  zoom: React.PropTypes.number,
  initialCenter: React.PropTypes.object
}
MapContainer.defaultProps = {
  zoom: 9,
  initialCenter: {
    lat: 33.356432,
    lng: 126.5268767
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ',
}))(MapContainer)
