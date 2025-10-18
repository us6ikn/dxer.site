L.waz = function(options) {
  const geojsonLayer = L.geoJSON(null, {
    style: function(feature) {
      if (feature.geometry.type === "Polygon") {
        return { color: 'blue', weight: 2, fillOpacity: 0.1 }; // Boundary styling
      }
      return {}; // Points don't need a style
    },
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng).bindPopup(feature.properties.name); // Show labels
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
      }
    }
  });

  if (options.geojsonUrl) {
    fetch(options.geojsonUrl)
      .then(res => res.json())
      .then(data => geojsonLayer.addData(data));
  }

  return geojsonLayer;
};
