// footprintPlotter.js

function plotMarkerWithCircle(gridLocator, map) {
    if (gridLocator) {
        const { lat, lng } = calculateCoordinates(gridLocator);

        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: gridLocator
        });
        const circle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.15,
            map,
            center: { lat, lng },
            radius: 13000000 // Fixed radius value
        });

        circle.setMap(map); // Set the circle on the map
        circle.setOptions({ clickable: false }); // Make the circle transparent to mouse events
    }
}
