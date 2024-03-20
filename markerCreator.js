// markerCreator.js

let openInfoWindow = null; // Define openInfoWindow globally

function createMarkers(callsigns, gridLocator, map) {
    for (const key in callsigns) {
        const [lat, lng] = key.split(",");
        const markers = callsigns[key];

        let offsetLat = 0;
        let offsetLng = 0;

        markers.forEach((markerInfo, index) => {
            const markerIcon = markerInfo.markerIcon;
            
            const markerPosition = {
                lat: parseFloat(lat) + (offsetLat / 10000),
                lng: parseFloat(lng) + (offsetLng / 10000)
            };

            const marker = new google.maps.Marker({
                position: markerPosition,
                map: map,
                title: markerInfo.callsign,
                icon: {
                    url: markerIcon,
                    scaledSize: new google.maps.Size(20, 20)
                }
            });

            offsetLat += 100;
            offsetLng += 100;

            let content = '';
            const earliestDate = new Date(markerInfo.earliestTime);
            const latestDate = new Date(markerInfo.latestTime);

            const formatTimestamp = (date) => {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                const hours = String(date.getUTCHours()).padStart(2, '0');
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
            };

            const earliestTimeFormatted = formatTimestamp(earliestDate);
            const latestTimeFormatted = formatTimestamp(latestDate);

            if (!gridLocator) {
                content = `<div><b>${markerInfo.callsign}</b></div>`;
                content += `<div><a href="#" onclick="alert('Enter your Grid Locator and click Plot your Range first'); return false;">Match Passes</a></div>`;
                content += `<div>First heard: ${earliestTimeFormatted}</div>`;
                content += `<div>Last heard: ${latestTimeFormatted}</div>`;
                content += `<div>GRID locator: ${markerInfo.dxgridlocator}</div>`;
                content += `<div><a href="https://qrz.com/db/${markerInfo.callsign}">QRZ.com lookup</a></div>`;
            } else {
                content = `<div><b>${markerInfo.callsign}</b></div>`;
                content += `<div><a href="https://www.satmatch.com/satellite/IO-117/obs1/${gridLocator}/obs2/${markerInfo.dxgridlocator}?duration_hrs=48">Match Passes</a></div>`;
                content += `<div>First heard: ${earliestTimeFormatted}</div>`;
                content += `<div>Last heard: ${latestTimeFormatted}</div>`;
                content += `<div>GRID locator: ${markerInfo.dxgridlocator}</div>`;
                content += `<div><a href="https://qrz.com/db/${markerInfo.callsign}">QRZ.com lookup</a></div>`;
            }

            marker.addListener("click", () => {
                if (openInfoWindow) {
                    openInfoWindow.close();
                }
                const infowindow = new google.maps.InfoWindow(); // Define infowindow locally
                infowindow.setContent(content);
                infowindow.open(map, marker);
                openInfoWindow = infowindow;
            });
        });
    }
}
