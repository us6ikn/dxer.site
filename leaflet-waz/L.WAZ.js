// L.WAZ.js
L.WAZ = L.Layer.extend({
  options: {
    geojsonUrl: null,  // URL to your GeoJSON
    style: { color: 'blue', weight: 2, fillOpacity: 0.2 }
  },

  initialize: function(options) {
    L.setOptions(this, options);
    this._layer = L.geoJSON(null, {
      style: this.options.style,
      onEachFeature: this._onEachFeature
    });
  },

  onAdd: function(map) {
    this._map = map;
    this._layer.addTo(map);
    if (this.options.geojsonUrl) {
      fetch(this.options.geojsonUrl)
        .then(res => res.json())
        .then(data => this._layer.addData(data));
    }
  },

  onRemove: function() {
    this._map.removeLayer(this._layer);
  },

  _onEachFeature: function(feature, layer) {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  }
});

// Factory function
L.waz = function(options) {
  return new L.WAZ(options);
};
