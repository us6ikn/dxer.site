// Read the file using the Fetch API
fetch("output_filtered.txt")
    .then(response => response.text())
    .then(data => {
        // Split the text into lines
        const lines = data.split("\n");

        // Create a new Google Map centered on the first coordinate
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: getLatLng(lines[0])
        });

        // Loop through the lines and add markers for each coordinate
        for (const line of lines) {
            const {callsign, grid, lat, lng} = parseLine(line);
            if (lat !== null && lng !== null) {
                const marker = new google.maps.Marker({
                    position: {lat, lng},
                    map,
                    title: `${callsign} (${grid})`
                });
            }
        }
    })
    .catch(error => {
        console.error(error);
    });

// Parse a single line from the file and extract the callsign, grid and coordinates
function parseLine(line) {
    const regex = /^Callsign: ([A-Z0-9]+), Grid locator: ([A-Z0-9]+), Coordinates: \(([\d\.]+), ([\d\.-]+)\)$/;
    const matches = regex.exec(line);
    if (matches) {
        const callsign = matches[1];
        const grid = matches[2];
        const lat = parseFloat(matches[3]);
        const lng = parseFloat(matches[4]);
        return {callsign, grid, lat, lng};
    } else {
        return {callsign: "", grid: "", lat: null, lng: null};
    }
}

// Extract the latitude and longitude from a single line and return a LatLng object
function getLatLng(line) {
    const {lat, lng} = parseLine(line);
    if (lat !== null && lng !== null) {
        return {lat, lng};
    } else {
        return {lat: 0, lng: 0};
    }
}
