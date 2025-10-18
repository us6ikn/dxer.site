import xml.etree.ElementTree as ET

kml_path = "WAZ.kml"  # path to your file
ns = {'kml': 'http://www.opengis.net/kml/2.2'}

tree = ET.parse(kml_path)
root = tree.getroot()

def explore(elem, depth=0):
    tag = elem.tag.split('}')[-1]
    print("  " * depth + tag)
    for child in elem:
        explore(child, depth + 1)

explore(root)
