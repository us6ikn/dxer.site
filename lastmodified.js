var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var lastModified = new Date(this.getResponseHeader("Last-Modified"));
        document.getElementById("last-modified").innerHTML = lastModified.toUTCString();
    }
};
xhttp.open("HEAD", "output_filtered.txt", true);
xhttp.send();
