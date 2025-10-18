import xml.etree.ElementTree as ET
import json

kml_path = "WAZ.kml"
geojson_path = "waz_zones.geojson"

ns = {'kml': 'http://www.opengis.net/kml/2.2'}
tree = ET.parse(kml_path)
root = tree.getroot()

features = []

# --- extract LineStrings (boundaries) ---
for placemark in root.findall(".//kml:Placemark", ns):
    line = placemark.find(".//kml:LineString/kml:coordinates", ns)
    if line is not None:
        coords_text = line.text.strip()
        coords = []
        for pair in coords_text.split():
            lon, lat, *_ = map(float, pair.split(','))
            coords.append([lon, lat])
        features.append({
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": coords},
            "properties": {"type": "boundary"}
        })

# --- extract Points (zone names/labels) ---
for placemark in root.findall(".//kml:Placemark", ns):
    point = placemark.find(".//kml:Point/kml:coordinates", ns)
    name = placemark.find("kml:name", ns)
    if point is not None:
        lon, lat, *_ = map(float, point.text.strip().split(','))
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {"name": name.text if name is not None else "WAZ Zone"}
        })

geojson = {"type": "FeatureCollection", "features": features}

with open(geojson_path, "w") as f:
    json.dump(geojson, f, indent=2)

print(f"✅ Extracted {len(features)} features to {geojson_path}")
