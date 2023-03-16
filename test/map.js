// Initialize Google Map
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 5,
    center: {lat: 39.8283, lng: -98.5795} // Default center of the map
  });

  // Load coordinates from Glitch project
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var coordinates = this.responseText.split('\n');

      // Loop through coordinates and add markers to the map
      for (var i = 0; i < coordinates.length; i++) {
        var parts = coordinates[i].split(',');
        var lat = parseFloat(parts[0].split(':')[1].trim());
        var lng = parseFloat(parts[1].split(':')[1].trim());

        var marker = new google.maps.Marker({
          position: {lat: lat, lng: lng},
          map: map
        });
      }
    }
  };
  xmlhttp.open("GET", "https://satnogs.glitch.me/output_filtered.txt", true);
  xmlhttp.send();
}
