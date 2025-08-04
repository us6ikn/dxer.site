/*
Leaflet.greatCircle.js
Copyright Alex Wellerstein, 2018.
Licensed under the MIT License: https://opensource.org/licenses/MIT
*/
L.GreatCircle = L.Circle.extend({

    initialize: function (position, options = {}) {
        // Default options
        var defaults = {
            clipLat: 65, // lat (+/-) used to determine when regular circles might be used. set to false to force render of circle as polygon (no matter what), or true to render it as a normal circle (no matter what)
            clipRad: 2000000, // radius (m) at which it will always render a polygon, unless clipLat == true
            degStep: 0.5, // degrees by which the circle drawing function will step for each polygon -- smaller is more refined
            maxCopies: -1, // set a maximum number of copies if elements are wrapped -- -1 is no max
            wrapElements: true, // whether to wrap the elements as multiple copies
            wrapMarker: true, // whether to wrap the bound marker, too
            maxRadius: 20015086.5, // cap on radius
        };

        // Apply defaults if they aren't in the options object
        for (var i in defaults) {
            if (typeof options[i] == "undefined") options[i] = defaults[i];
        }

        this._position = L.latLng(position);
        this._options = options;

        this._addedToMap = false; // Flag for whether we've added this to the map yet
    },

    // Remove all parts from map
    remove: function () {
        if (this._polygon) this._polygon.remove();
        if (this._circle) this._circle.remove();
        if (typeof this._circles != "undefined") {
            if (this._circles.length > 0) {
                for (var i in this._circles) {
                    this._circles[i].remove();
                }
            }
            this._circles = undefined;
        }
        this._addedToMap = false;
    },

    // Add to the map
    addTo: function (map) {
        if (this._polygon) this._polygon.addTo(map);
        if (this._circle) this._circle.addTo(map);
        if (typeof this._circles != "undefined") {
            if (this._circles.length > 0) {
                for (var i in this._circles) {
                    this._circles[i].addTo(map);
                }
            }
        }
        this._addedToMap = true;
        this._map = map;
        this._map.on("zoomend", function () {
            this.redraw();
        }, this);
        this.redraw(); // Initial draw
    },

    // Bind the Great Circle object's LatLng to another LatLng based on an event
    bindTo: function (object, event = "drag") {
        this._bindobject = object;
        object.on(
            event,
            function (ev) {
                var ll = this._bindobject.getLatLng();
                var noredraw =
                    ll.lat == this._position.lat && ll.lng == this._position.lng;
                if (this._options.wrapMarker) {
                    if (this._map.getZoom() <= 2) {
                        if (ll.lng < -180) {
                            ll.lng = 360 + ll.lng;
                            this._bindobject.setLatLng(ll);
                        }
                        if (ll.lng > 180) {
                            ll.lng = ll.lng - 360;
                            this._bindobject.setLatLng(ll);
                        }
                    }
                }
                if (!noredraw) this.setLatLng(this._bindobject.getLatLng());
            },
            this
        );
        object.fire(event);
    },

    // Constants for calculations
    _deg2rad: Math.PI / 180,
    _rad2deg: 180 / Math.PI,
    _m2km: 1 / 1000,

    // Set the latLng center of the Great Circle
    setLatLng: function (position) {
        this._position = L.latLng(position);
        this.redraw();
    },

    // Return the latLng center
    getLatLng: function () {
        return this._position;
    },

    // Update styles
    setStyle: function (options) {
        if (this._polygon) this._polygon.setStyle(options);
        if (this._circle) this._circle.setStyle(options);
        if (typeof this._circles != "undefined") {
            if (this._circles.length > 0) {
                for (var i in this._circles) {
                    this._circles[i].setStyle(options);
                }
            }
        }
    },

    // Return the bounds
    getBounds: function () {
        if (this._circle) {
            return this._circle.getBounds();
        }
        if (this._polygon) {
            return L.latLngBounds(
                this._destination_from_bearing(
                    this._position.lat,
                    this._position.lng,
                    315,
                    this._options.radius * this._m2km
                ),
                this._destination_from_bearing(
                    this._position.lat,
                    this._position.lng,
                    135,
                    this._options.radius * this._m2km
                )
            );
        }
        return L.latLngBounds(
            this._destination_from_bearing(
                this._position.lat,
                this._position.lng,
                315,
                this._options.radius * this._m2km
            ),
            this._destination_from_bearing(
                this._position.lat,
                this._position.lng,
                135,
                this._options.radius * this._m2km
            )
        );
    },

    // Set the radius of the Great Circle
    setRadius: function (radius) {
        this._options.radius = radius;
        if (this._options.maxRadius != -1) {
            if (this._options.radius > this._options.maxRadius)
                this._options.radius = this._options.maxRadius;
        }
        this.redraw();
    },

    // Return the radius
    getRadius: function () {
        return this._options.radius;
    },

    // Rounding function
    _round: function (number, decimals = 0) {
        if (decimals == 0) return Math.round(number);
        var multiplier = Math.pow(10, decimals);
        return Math.round(number * multiplier) / multiplier;
    },

    // Calculate destination lat/lon from a start point, bearing, and distance
    _destination_from_bearing: function (lat, lng, bearing, distance, round_off = undefined) {
        var R = 6371; // Earth radius in km
        var d = Math.min(distance, R * Math.PI / 2); // Cap at 90° angular distance
        var deg2rad = this._deg2rad;
        var rad2deg = this._rad2deg;
        var lat1 = deg2rad * Math.max(-89.9, Math.min(89.9, lat)); // Clamp latitude
        var lng1 = deg2rad * ((lng + 180) % 360 - 180); // Normalize longitude
        var brng = deg2rad * bearing;

        var sinLat1 = Math.sin(lat1);
        var cosLat1 = Math.cos(lat1);
        var cosdR = Math.cos(d / R);
        var sindR = Math.sin(d / R);

        var lat2 = Math.asin(sinLat1 * cosdR + cosLat1 * sindR * Math.cos(brng));
        if (isNaN(lat2)) {
            console.warn(`NaN latitude: lat=${lat}, lng=${lng}, bearing=${bearing}, distance=${distance}`);
            lat2 = lat1; // Fallback
        }
        lat2 = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lat2)); // Clamp to [-90°, 90°]

        var lng2 = lng1 + Math.atan2(Math.sin(brng) * sindR * cosLat1, cosdR - sinLat1 * Math.sin(lat2));
        if (isNaN(lng2)) {
            console.warn(`NaN longitude: lat=${lat}, lng=${lng}, bearing=${bearing}, distance=${distance}`);
            lng2 = lng1; // Fallback
        }

        var resultLat = rad2deg * lat2;
        var resultLng = ((rad2deg * lng2 + 180) % 360) - 180;

        if (typeof round_off != "undefined") {
            return [this._round(resultLat, round_off), this._round(resultLng, round_off)];
        } else {
            return [resultLat, resultLng];
        }
    },

    // Main render event
    redraw: function () {
        var lat = this._position.lat;
        var lng = this._position.lng;
        if (this._options.maxRadius != -1) {
            if (this._options.radius > this._options.maxRadius)
                this._options.radius = this._options.maxRadius;
        }

        // Control points to check for clipping against poles
        var l1 = this._destination_from_bearing(lat, lng, 0, this._options.radius * this._m2km, 2);
        var l2 = this._destination_from_bearing(lat, lng, 360, this._options.radius * this._m2km, 2);
        var l3 = this._destination_from_bearing(lat, lng, 180, this._options.radius * this._m2km, 2);
        var l4 = this._destination_from_bearing(lat, lng, -180, this._options.radius * this._m2km, 2);

        // Determine clipping status
        if (l1[0] != l2[0] || l1[1] != l2[1]) {
            if (l3[0] != l4[0] || l3[1] != l4[1]) {
                this._clipStatus = 4; // Both top and bottom clipped
            } else {
                this._clipStatus = 2; // Top clipped
            }
        } else if (l3[0] != l4[0] || l3[1] != l4[1]) {
            this._clipStatus = 3; // Bottom clipped
        } else {
            this._clipStatus = 1; // No clipping
        }

        // Determine number of copies
        switch (this._map.getZoom()) {
            case 0:
                this._copies = Math.ceil(window.innerWidth / 256 / 4) + 2;
                break;
            case 1:
                this._copies = Math.ceil(window.innerWidth / 512 / 4) + 2;
                break;
            case 2:
                this._copies = Math.ceil(window.innerWidth / 768 / 4) + 1;
                break;
            default:
                this._copies = 1;
                break;
        }
        if (this._options.maxCopies > -1)
            this._copies = this._copies > this._options.maxCopies ? this._options.maxCopies : this._copies;
        if (this._options.wrapElements === false) this._copies = 0;

        // Decide whether to render as polygon or circle
        if (
            (this._options.radius >= this._options.clipRad ||
                this._clipStatus > 1 ||
                l1[0] >= this._options.clipLat ||
                l3[0] <= this._options.clipLat * -1 ||
                this._options.clipLat === false) &&
            this._options.clipLat !== true
        ) {
            // Render as polygon
            this._latLngs = [];
            this._latLngsM = [];

            // Define angles for circle halves
            switch (this._clipStatus) {
                case 1:
                    var t_start1 = 0;
                    var t_stop1 = 180;
                    var t_start2 = 180;
                    var t_stop2 = 360;
                    break;
                case 2:
                    var t_start1 = 360;
                    var t_stop1 = 180;
                    var t_start2 = 180;
                    var t_stop2 = 0;
                    this._latLngs.push([90, l2[1] + 360 * -this._copies]);
                    break;
                case 3:
                    var t_start1 = -180;
                    var t_stop1 = 0;
                    var t_start2 = 0;
                    var t_stop2 = 180;
                    this._latLngs.push([-90, l4[1] + 360 * -this._copies]);
                    break;
                case 4:
                    var t_start1 = -180;
                    var t_stop1 = 0;
                    var t_start2 = 0;
                    var t_stop2 = 180;
                    this._latLngs.push([-90, l4[1] + 360 * -this._copies]);
                    break;
            }
            if (t_start1 < t_stop1) {
                var t_dir1 = 1;
            } else {
                var t_dir1 = -1;
            }
            if (t_start2 < t_stop2) {
                var t_dir2 = 1;
            } else {
                var t_dir2 = -1;
            }

            // Render circles for each copy
            for (var copy = this._copies * -1; copy <= this._copies; copy++) {
                for (
                    var theta = t_start1;
                    t_dir1 > 0 ? theta < t_stop1 : theta > t_stop1;
                    theta += this._options.degStep * t_dir1
                ) {
                    var ll = this._destination_from_bearing(
                        lat,
                        lng,
                        theta,
                        this._options.radius * this._m2km
                    );
                    ll[1] = ll[1] + 360 * copy;
                    if (isNaN(ll[0]) || isNaN(ll[1]) || Math.abs(ll[0]) > 90 || Math.abs(ll[1]) > 360) {
                        console.warn(
                            `Skipping invalid point: lat=${ll[0]}, lng=${ll[1]}, theta=${theta}, copy=${copy}`
                        );
                        continue;
                    }
                    this._latLngs.push(ll);
                }

                if (this._clipStatus == 4) {
                    var ll = this._destination_from_bearing(
                        lat,
                        lng,
                        360,
                        this._options.radius * this._m2km
                    );
                    if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                        this._latLngs.push([ll[0], ll[1] + 360 * copy]);
                    }
                    if (copy == this._copies * -1) {
                        var ll = this._destination_from_bearing(
                            lat,
                            lng,
                            -180,
                            this._options.radius * this._m2km
                        );
                        if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                            this._latLngs.push([90, ll[1] + 360 * -this._copies]);
                        }
                        var ll = this._destination_from_bearing(
                            lat,
                            lng,
                            180,
                            this._options.radius * this._m2km
                        );
                        if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                            this._latLngs.push([90, ll[1] + 360 * -this._copies]);
                        }
                        this._latLngsM.push(this._latLngs);
                    } else {
                        if (this._latLngsM.length > 0) {
                            this._latLngsM[this._latLngsM.length - 1] =
                                this._latLngsM[this._latLngsM.length - 1].concat(this._latLngs);
                        }
                    }
                    this._latLngs = [];
                    if (copy == this._copies) {
                        var ll = this._destination_from_bearing(
                            lat,
                            lng,
                            0,
                            this._options.radius * this._m2km
                        );
                        if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                            this._latLngs.push([90, ll[1] + 360 * this._copies]);
                        }
                    }
                }

                for (
                    var theta = t_start2;
                    t_dir2 > 0 ? theta < t_stop2 : theta > t_stop2;
                    theta += this._options.degStep * t_dir2
                ) {
                    var ll = this._destination_from_bearing(
                        lat,
                        lng,
                        theta,
                        this._options.radius * this._m2km
                    );
                    ll[1] = ll[1] + 360 * copy;
                    if (isNaN(ll[0]) || isNaN(ll[1]) || Math.abs(ll[0]) > 90 || Math.abs(ll[1]) > 360) {
                        console.warn(
                            `Skipping invalid point: lat=${ll[0]}, lng=${ll[1]}, theta=${theta}, copy=${copy}`
                        );
                        continue;
                    }
                    this._latLngs.push(ll);
                }

                if (this._clipStatus == 4) {
                    var ll = this._destination_from_bearing(
                        lat,
                        lng,
                        180,
                        this._options.radius * this._m2km
                    );
                    if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                        this._latLngs.push([ll[0], ll[1] + 360 * copy]);
                    }
                    if (copy == this._copies) {
                        var ll = this._destination_from_bearing(
                            lat,
                            lng,
                            180,
                            this._options.radius * this._m2km
                        );
                        if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                            this._latLngs.push([-90, ll[1] + 360 * this._copies]);
                        }
                        if (this._latLngsM.length > 0) {
                            this._latLngsM[0] = this._latLngsM[0].concat(this._latLngs);
                        }
                    } else {
                        this._latLngsM.push(this._latLngs);
                    }
                    this._latLngs = [];
                }

                if (this._clipStatus == 1) {
                    if (typeof this._latLngsM == "undefined") this._latLngsM = [];
                    this._latLngsM.push(this._latLngs);
                    this._latLngs = [];
                }
            }

            // Add final control points
            switch (this._clipStatus) {
                case 2:
                    var ll = this._destination_from_bearing(
                        lat,
                        lng,
                        0,
                        this._options.radius * this._m2km
                    );
                    if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                        this._latLngs.push([ll[0], ll[1] + 360 * this._copies]);
                        this._latLngs.push([90, ll[1] + 360 * this._copies]);
                    }
                    break;
                case 3:
                    var ll = this._destination_from_bearing(
                        lat,
                        lng,
                        180,
                        this._options.radius * this._m2km
                    );
                    if (!isNaN(ll[0]) && !isNaN(ll[1])) {
                        this._latLngs.push([ll[0], ll[1] + 360 * this._copies]);
                        this._latLngs.push([-90, ll[1] + 360 * this._copies]);
                    }
                    break;
            }

            // Log for debugging
            console.log("Clipping control points:", { l1, l2, l3, l4 });
            console.log("Clip status:", this._clipStatus);
            console.log("Radius:", this._options.radius);

            // Remove existing circle
            if (this._circle) {
                this._circle.remove();
                this._circle = undefined;
                if (typeof this._circles != "undefined") {
                    if (this._circles.length > 0) {
                        for (var i in this._circles) {
                            this._circles[i].remove();
                        }
                    }
                    this._circles = undefined;
                }
            }

            // Create or update polygon
            if (!this._polygon) {
                if (this._latLngs.length === 0 && (!this._latLngsM || this._latLngsM.length === 0)) {
                    console.warn("No valid points for polygon, falling back to empty layer");
                    this._polygon = new L.polygon([], this._options);
                } else if (this._clipStatus == 1 || this._clipStatus == 4) {
                    this._polygon = new L.polygon(this._latLngsM, this._options);
                } else {
                    this._polygon = new L.polygon(this._latLngs, this._options);
                }
                if (this._addedToMap) {
                    this._polygon.addTo(this._map);
                }
            } else {
                if (this._latLngs.length === 0 && (!this._latLngsM || this._latLngsM.length === 0)) {
                    console.warn("No valid points for polygon, updating to empty layer");
                    this._polygon.setLatLngs([]);
                } else if (this._clipStatus == 1 || this._clipStatus == 4) {
                    this._polygon.setLatLngs(this._latLngsM);
                } else {
                    this._polygon.setLatLngs(this._latLngs);
                }
                this._polygon.setStyle(this._options);
                this._polygon.redraw();
            }
        } else {
            // Render as circle
            if (this._polygon) {
                this._polygon.remove();
                this._polygon = undefined;
            }

            // Copy management
            if (this._copies > 0) {
                if (typeof this._circles == "undefined") {
                    this._circles = [];
                } else if (this._circles.length > this._copies * 2) {
                    for (var i in this._circles) {
                        if (i > this._copies * 2) {
                            this._circles[i].remove();
                        }
                    }
                }
            } else {
                if (typeof this._circles != "undefined") {
                    if (this._circles.length > 0) {
                        for (var i in this._circles) {
                            this._circles[i].remove();
                        }
                    }
                }
                this._circles = undefined;
            }

            // Render circles
            for (var copy = this._copies * -1; copy <= this._copies; copy++) {
                if (copy == 0) {
                    if (!this._circle) {
                        this._circle = new L.circle(this._position, this._options);
                        if (this._addedToMap) {
                            this._circle.addTo(this._map);
                        }
                    } else {
                        this._circle.setLatLng(this._position);
                        this._circle.setStyle(this._options);
                        this._circle.setRadius(this._options.radius);
                        this._circle.redraw();
                    }
                } else {
                    if (typeof this._circles[copy] == "undefined") {
                        this._circles[copy] = new L.circle([lat, lng + 360 * copy], this._options);
                        if (this._addedToMap) {
                            this._circles[copy].addTo(this._map);
                        }
                    } else {
                        this._circles[copy].setLatLng([lat, lng + 360 * copy]);
                        this._circles[copy].setStyle(this._options);
                        this._circles[copy].setRadius(this._options.radius);
                        this._circles[copy].redraw();
                    }
                }
            }
        }
    },
});

L.greatCircle = function (position, options) {
    return new L.GreatCircle(position, options);
};
