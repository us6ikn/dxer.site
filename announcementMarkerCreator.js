// announcementMarkerCreator.js

function createAnnouncementMarkers(announcements, map) {
    for (let i = 0; i < announcements.length; i++) {
        const announcement = announcements[i];

        const coordinates = announcement.match(/Coordinates: \((.*), (.*)\)/);
        const timeString = announcement.match(/Time: ([^,]*)/)[1];

        if (!coordinates || !timeString) {
            continue;
        }

        const lat = parseFloat(coordinates[1]);
        const lng = parseFloat(coordinates[2]);
        const time = new Date(timeString);

        if (time <= new Date()) {
            continue;
        }

        const callsign = announcement.match(/Callsign: ([^,]*)/)[1];

        const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            icon: {
                url: BLINKING_GIF_URL,
                scaledSize: new google.maps.Size(20, 20)
            },
            optimized: false,
            zIndex: 10000
        });

        marker.addListener('click', () => {
            if (openInfoWindow) {
                openInfoWindow.close();
            }

            const infoWindow = new google.maps.InfoWindow({
                content: `<div><a href="https://hams.at/alerts" target="_blank">${callsign}</a></div>`,
            });

            infoWindow.open(map, marker);
            openInfoWindow = infoWindow;
        });
    }
}
