import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import { GeoJSON } from 'ol/format';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import 'ol/ol.css'
import './Map.css';

function MapComponent(props) {
  const { layerName, token, wmtsLink } = props;

  
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [drawType, setDrawType] = useState(null);
  const [geoJson, setGeoJson] = useState('');

  // Initialize map
  useEffect(() => {
    // const token = 'REPLACE_ME_1';
    // const capabilitiesURL = 'REPLACE_ME_2';
    // const layerName = 'REPLACE_ME_3';
    const capabilitiesURL = `${wmtsLink}?token=${token}`;
    const mapInstance = new Map({
      target: mapRef.current,
      view: new View({
        center: [ 35.22135923307478, 31.77360332781054 ],
        zoom: 8,
        projection: 'EPSG:4326'
      }),
    });
    fetch(capabilitiesURL)
      .then((response) => response.text())
      .then((capabilitiesText) => {
        const parser = new WMTSCapabilities();
        const parserResult = parser.read(capabilitiesText);
        const layerOptions = optionsFromCapabilities(parserResult, {
          layer: layerName
        });
        layerOptions.urls = layerOptions.urls.map((url) => url.concat(`?token=${token}`));
        const layer = new TileLayer({ source: new WMTS(layerOptions) });
        mapInstance.addLayer(layer);
        mapInstance.addLayer(new VectorLayer({ source: vectorSource }));

        setMap(mapInstance);
    
        vectorSource.on('change', () => {
          updateGeoJson();
        });
    });
    

    return () => mapInstance.setTarget(null); // Cleanup
  }, [vectorSource]);

  // Handle drawing interaction
  useEffect(() => {
    if (!map || !drawType) return;
    const draw = new Draw({
      source: vectorSource,
      type: drawType
    });

  
    map.addInteraction(draw);
    return () => {
        map.removeInteraction(draw);
    }
  }, [map, drawType]);

  // // Handle drawing interaction
  // useEffect(() => {
  //   updateGeoJson();
  // }, [vectorSource.getFeatures().length]);

  // Update GeoJSON output
  const updateGeoJson = () => {
    const features = vectorSource.getFeatures();
    console.log(features.length);
    const geoJsonFormat = new GeoJSON();
    const geoJsonData = geoJsonFormat.writeFeaturesObject(features);
    setGeoJson(JSON.stringify(geoJsonData, null, 2));
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      const features = new GeoJSON().readFeatures(data);
      vectorSource.clear();
      vectorSource.addFeatures(features);
      map.getView().fit(vectorSource.getExtent(), { padding: [50, 50, 50, 50] });
      updateGeoJson();
    };
    reader.readAsText(file);
  };

  // Save GeoJSON
  const saveGeoJson = () => {
    const blob = new Blob([geoJson], { type: 'application/json' });
    const FileSaver = require('file-saver');
    FileSaver.saveAs(blob, 'map.geojson');
  };

  // Clear map
  const clearMap = () => {
    vectorSource.clear();
    updateGeoJson();
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h2>GeoJSON Editor</h2>
        <div>
          <button onClick={() => setDrawType('Point')}>Draw Point</button>
          <button onClick={() => setDrawType('LineString')}>Draw Line</button>
          <button onClick={() => setDrawType('Polygon')}>Draw Polygon</button>
          <button onClick={() => setDrawType(null)}>Stop Drawing</button>
        </div>
        <div>
          <input type="file" accept=".geojson" onChange={handleFileUpload} />
          <button onClick={saveGeoJson}>Save GeoJSON</button>
          <button onClick={clearMap}>Clear</button>
        </div>
        <textarea value={geoJson} readOnly rows={10} cols={40} />
      </div>
      <div ref={mapRef} className="map-container" />
    </div>
  );
}

export default MapComponent;
