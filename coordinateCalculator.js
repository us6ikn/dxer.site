// coordinateCalculator.js

function calculateCoordinates(gridLocator) {
    // Get the grid locator from user input and convert to uppercase
    var gridLocator = document.getElementById("grid-locator").value.toUpperCase();

    // Force the first two characters to be uppercase
    gridLocator = gridLocator.substr(0,2).toUpperCase() + gridLocator.substr(2);

    // Force the last two characters to be lowercase
    gridLocator = gridLocator.substr(0,4) + gridLocator.substr(4).toLowerCase();

    // Use regular expression to validate the grid locator format
    var gridLocatorPattern = /^([A-R]{2}\d{2}[a-z]{2})([0-9]*[a-z]*)?$/;
    if (!gridLocatorPattern.test(gridLocator)) {
        alert("Invalid grid locator format. Please enter a valid 6-character grid locator.");
        return;
    }
    // Calculate the latitude and longitude of the grid locator
    var lat1 = (gridLocator.charCodeAt(1) - 65) * 10;
    var lat2 = ((gridLocator.charCodeAt(5) - 97)/24) +  (1 / 48) - 90;
    var lat3 = parseInt(gridLocator.charAt(3));
    var latitude = lat1 + lat3 + lat2;

    var lon1 = ((gridLocator.charCodeAt(0) - 65) * 20);
    var lon2 = parseInt(gridLocator.charAt(2)) * 2;
    var lon3 = ((gridLocator.charCodeAt(4) - 97) / 12) + (1/24);
    var longitude = lon1 + lon2 + lon3 - 180;

    return { lat: latitude, lng: longitude };
}
