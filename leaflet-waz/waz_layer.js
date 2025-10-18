
// Auto-generated WAZ Leaflet layer
// Usage:
//   <script src="waz_layer.js"></script>
//   L.map('map').addLayer(wazLayer);

var wazLayer = L.geoJSON({
  "type": "FeatureCollection",
  "features": []
}, {
  style: function (feature) {
    return {
      color: '#ff6600',
      weight: 2,
      fillOpacity: 0.3
    };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  }
});
