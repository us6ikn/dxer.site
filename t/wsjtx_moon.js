// wsjtx_moon.js
// Compact Moon az/el calculator (Meeus-style periodic terms).
// Usage:
//   import { moonAzEl } from './wsjtx_moon.js'
//   const res = moonAzEl("FN20hq", new Date());
//   // res = { az, el, ra_hours, dec_deg, distance_km, lat, lon, jd }

export function moonAzEl(qth_or_latlon, date = new Date(), opts = {}) {
  // If qth_or_latlon is a string, interpret as Maidenhead locator
  // else expect { lat: xx, lon: yy } where lon = east positive (degrees)
  let lat, lon;
  if (typeof qth_or_latlon === 'string') {
    ({ lat, lon } = maidenheadToLatLon(qth_or_latlon));
  } else if (typeof qth_or_latlon === 'object' && qth_or_latlon !== null) {
    lat = +qth_or_latlon.lat;
    lon = +qth_or_latlon.lon;
    if (Number.isNaN(lat) || Number.isNaN(lon)) throw new Error('Invalid lat/lon');
  } else {
    throw new Error('First argument must be Maidenhead locator string or {lat,lon} object');
  }

  const jd = toJulianDate(date); // UTC-based JD
  // Compute moon geocentric ecliptic longitude, latitude and distance (Meeus)
  const T = (jd - 2451545.0) / 36525.0;

  // Fundamental arguments (degrees)
  const D = normalizeDeg(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      (T * T * T) / 545868 - (T * T * T * T) / 113065000
  ); // mean elongation of Moon from Sun
  const M = normalizeDeg(
    357.5291092 +
      35999.0502909 * T -
      0.0001536 * T * T +
      (T * T * T) / 24490000
  ); // Sun's mean anomaly
  const Mp = normalizeDeg(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      (T * T * T) / 69699 - (T * T * T * T) / 14712000
  ); // Moon's mean anomaly
  const F = normalizeDeg(
    93.2720950 +
      483202.0175233 * T -
      0.0036539 * T * T -
      (T * T * T) / 3526000 + (T * T * T * T) / 863310000
  ); // Moon's argument of latitude
  const Om = normalizeDeg(
    125.0445479 -
      1934.1362891 * T +
      0.0020754 * T * T +
      (T * T * T) / 467441 -
      (T * T * T * T) / 60616000
  ); // Longitude of ascending node of Moon

  // Periodic terms for lunar longitude (L) from Meeus (truncated, principal terms)
  // Each term: [D_coeff, M_coeff, Mp_coeff, F_coeff, sine_coeff (1e-6 deg), sine_coeff_T (1e-6 deg*T)]
  // Note: coefficients are in 1e-6 degrees (Meeus uses 1e-6 deg units in some tables).
  // The set below is a practical truncated set capturing the dominant terms.
  const L_terms = [
    // D  M  Mp  F   L_coeff (1e-6 deg)    L_coeff_T (1e-6 deg per T)
    [0, 0, 1, 0, 6288774, 0],
    [2, 0, -1, 0, 1274027, 0],
    [2, 0, 0, 0, 658314, 0],
    [0, 0, 2, 0, 213618, 0],
    [0, 1, 0, 0, -185116, 0],
    [0, 0, 0, 2, -114332, 0],
    [2, 0, -2, 0, 58793, 0],
    [2, -1, -1, 0, 57066, 0],
    [2, 0, 1, 0, 53322, 0],
    [2, -1, 0, 0, 45758, 0],
    [0, 1, -1, 0, -40923, 0],
    [1, 0, 0, 0, -34720, 0],
    [0, 1, 1, 0, -30383, 0],
    [2, 0, 0, -2, 15327, 0],
    [0, 0, 1, 2, -12528, 0],
    [0, 0, 1, -2, 10980, 0],
    [4, 0, -1, 0, 10675, 0],
    [0, 0, 3, 0, 10034, 0],
    [4, 0, -2, 0, 8548, 0],
    [2, 1, -1, 0, -7888, 0],
    [2, 1, 0, 0, -6766, 0],
    [1, 0, -1, 0, -5163, 0],
    [1, 1, 0, 0, 4987, 0],
    [2, -1, 1, 0, 4036, 0],
    [2, 0, 2, 0, 3994, 0],
    [4, 0, 0, 0, 3861, 0],
    [2, 0, -3, 0, 3665, 0],
    [0, 1, -2, 0, -2689, 0],
    [2, 0, -1, 2, -2602, 0],
    [2, -1, -2, 0, 2390, 0],
    [1, 0, 1, 0, -2348, 0],
    [2, -2, 0, 0, 2236, 0],
    [0, 1, 2, 0, -2120, 0],
    [0, 2, 0, 0, -2069, 0],
    [2, -2, -1, 0, 2048, 0],
    [2, 0, 1, -2, -1773, 0],
    [2, 0, 0, 2, -1595, 0],
    [4, -1, -1, 0, 1215, 0],
    [0, 0, 2, 2, -1110, 0],
    [3, 0, -1, 0, -892, 0],
    [2, 1, 1, 0, -810, 0],
    [4, -1, -2, 0, 759, 0],
    [0, 2, -1, 0, -713, 0],
    [2, 2, -1, 0, -700, 0],
    [2, 1, -2, 0, 691, 0],
    [2, -1, 0, -2, 596, 0],
    [4, 0, 1, 0, 549, 0],
    [0, 0, 4, 0, 537, 0],
    [4, -1, 0, 0, 520, 0],
    [1, 0, -2, 0, -487, 0],
    [2, 1, 0, -2, -399, 0],
    [0, 0, 2, -2, -381, 0],
    [1, 1, 1, 0, 351, 0],
    [3, 0, -2, 0, -340, 0],
    [4, 0, -3, 0, 330, 0],
    [2, -1, 2, 0, 327, 0],
  ];

  // Latitude terms (B) (again truncated principal terms)
  // Each: [D, M, Mp, F, coeff (1e-6 deg), coeff_T]
  const B_terms = [
    [0, 0, 0, 1, 5128122, 0],
    [0, 0, 1, 1, 280602, 0],
    [0, 0, 1, -1, 277693, 0],
    [2, 0, 0, -1, 173237, 0],
    [2, 0, -1, 1, 55413, 0],
    [2, 0, -1, -1, 46271, 0],
    [2, 0, 0, 1, 32573, 0],
    [0, 0, 2, 1, 17198, 0],
    [2, 0, 1, -1, 9266, 0],
    [0, 0, 2, -1, 8822, 0],
    [2, -1, 0, -1, 8216, 0],
    [2, 0, -2, -1, 4324, 0],
    [2, 0, 1, 1, 4200, 0],
    [2, 1, 0, -1, -3359, 0],
    [2, -1, -1, 1, 2463, 0],
    [2, -1, 0, 1, 2211, 0],
    [2, -1, -1, -1, 2065, 0],
    [0, 1, -1, -1, -1870, 0],
    [4, 0, -1, -1, 1828, 0],
    [0, 1, 0, 1, -1794, 0],
    [0, 0, 0, 3, -1749, 0],
    [0, 1, -1, 1, -1565, 0],
    [1, 0, 0, 1, -1491, 0],
    [0, 1, 1, 1, -1475, 0],
    [0, 1, 1, -1, -1410, 0],
    [0, 1, 0, -1, -1344, 0],
    [1, 0, 0, -1, -1335, 0],
    [0, 0, 3, 1, 1107, 0],
    [4, 0, 0, -1, 1021, 0],
    [4, 0, -1, 1, 833, 0],
    [0, 0, 1, -3, 777, 0],
    [4, -1, 0, -1, 671, 0],
    [4, -1, -1, 1, 607, 0],
    [2, 0, 0, -3, 596, 0],
    [2, 0, 2, -1, 491, 0],
  ];

  // Distance (R) terms in kilometers: each term has coeff in 1e-3 km (Meeus uses 1e-3 earth radii etc.)
  // For simplicity use Meeus coefficients in km with scaling.
  // Terms: [D,M,Mp,F, coeff (in 1e-3 km)]
  // We'll implement a compact set (principal terms)
  const R_terms = [
    [0, 0, 1, 0, -20905355],
    [2, 0, -1, 0, -3699111],
    [2, 0, 0, 0, -2955968],
    [0, 0, 2, 0, -569925],
    [0, 1, 0, 0, 48888],
    [0, 0, 0, 2, -3149],
    [2, 0, -2, 0, 246158],
    [2, -1, -1, 0, -152138],
    [2, 0, 1, 0, -170733],
    [2, -1, 0, 0, -204586],
    [0, 1, -1, 0, -129620],
    [1, 0, 0, 0, 108743],
    [0, 1, 1, 0, 104755],
    [2, 0, 0, -2, 10321],
    [0, 0, 1, 2, 0],
    [0, 0, 1, -2, 0],
    [4, 0, -1, 0, 79661],
    [0, 0, 3, 0, -34782],
    [4, 0, -2, 0, -23210],
    [2, 1, -1, 0, 2390],
    [2, 1, 0, 0, -2120],
  ];

  // Helper to evaluate series
  function evalSeries(terms, Ddeg, Mdeg, Mpdeg, Fdeg, T) {
    let s = 0;
    for (let i = 0; i < terms.length; i++) {
      const [dcoef, mcoef, mpcoef, fcoef, A, B] = terms[i];
      const arg = deg2rad(dcoef * Ddeg + mcoef * Mdeg + mpcoef * Mpdeg + fcoef * Fdeg);
      // values A and B are in units (Meeus uses 1e-6 deg), adjust accordingly:
      // For longitude/latitude A is in 1e-6 degrees
      s += (A + B * T) * Math.sin(arg);
    }
    return s;
  }

  // Evaluate L (deg), B (deg), R (km)
  // Meeus: L = L0 + sum(L_terms)/1e6 (deg)
  // Here L0 = 218.3164477 + 481267.88123421*T - 0.0015786*T^2 + ...
  const L0 = normalizeDeg(
    218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841 - (T * T * T * T) / 65194000
  );
  const B0 = 5.128122 * (1.0); // base? we'll add series below
  const Lsum = evalSeries(L_terms, D, M, Mp, F, T) / 1e6;
  const Bsum = evalSeries(B_terms, D, M, Mp, F, T) / 1e6;
  // R series in units of 1e-3 km per Meeus table; convert to km:
  function evalR(terms, Ddeg, Mdeg, Mpdeg, Fdeg, T) {
    let s = 0;
    for (let i = 0; i < terms.length; i++) {
      const [dcoef, mcoef, mpcoef, fcoef, A] = terms[i];
      const arg = deg2rad(dcoef * Ddeg + mcoef * Mdeg + mpcoef * Mpdeg + fcoef * Fdeg);
      s += A * Math.cos(arg);
    }
    // Meeus R = 385000.56 + s/1000 (where s is in 1e-3 km)
    return 385000.56 + s / 1000.0;
  }
  const L = normalizeDeg(L0 + Lsum); // deg
  const B = Bsum; // deg (Meeus gives absolute B as sum /1e6 deg)
  const R = evalR(R_terms, D, M, Mp, F, T); // km

  // Convert ecliptic (L,B) -> equatorial RA/Dec (J2000-ish) — use mean obliquity of ecliptic
  const eps = meanObliquity(T); // degrees

  // Geocentric rectangular coordinates (in km)
  const lambda = deg2rad(L);
  const beta = deg2rad(B);
  const xg = R * Math.cos(beta) * Math.cos(lambda);
  const yg = R * Math.cos(beta) * Math.sin(lambda);
  const zg = R * Math.sin(beta);

  // Rotate to equatorial coordinates (obliquity)
  const epsRad = deg2rad(eps);
  const xe = xg;
  const ye = yg * Math.cos(epsRad) - zg * Math.sin(epsRad);
  const ze = yg * Math.sin(epsRad) + zg * Math.cos(epsRad);

  // RA (hours) and Dec (deg) geocentric
  const raRad = Math.atan2(ye, xe); // radians
  const decRad = Math.atan2(ze, Math.sqrt(xe * xe + ye * ye));
  const raDeg = rad2deg(raRad);
  const decDeg = rad2deg(decRad);
  // Normalize RA to 0..360 deg
  const raDegNorm = normalizeDeg(raDeg);
  const raHours = raDegNorm / 15.0;

  // Topocentric correction: parallax
  // Simple topocentric correction using standard formulae:
  const H = localHourAngle(jd, lon, raHours); // degrees
  const latRad = deg2rad(lat);
  const decRadTopo = decRad;
  const parallax = Math.asin(6378.137 / R); // approximate equatorial horizontal parallax (rad), Earth radius / distance
  // Parallax in right ascension and declination:
  const Hr = deg2rad(H);
  const sinPar = Math.sin(parallax);
  // Topocentric RA/Dec correction (approx):
  const x = Math.cos(decRadTopo) * Math.cos(Hr) - (Math.cos(latRad) * sinPar);
  const y = Math.cos(decRadTopo) * Math.sin(Hr);
  const z = Math.sin(decRadTopo) - Math.sin(latRad) * sinPar;
  // Compute topocentric RA/Dec from x,y,z vector rotated to observer
  const topX = x;
  const topY = y * Math.cos(latRad) - z * Math.sin(latRad);
  const topZ = y * Math.sin(latRad) + z * Math.cos(latRad);
  const raTopoRad = Math.atan2(topY, topX);
  const decTopoRad = Math.atan2(topZ, Math.sqrt(topX * topX + topY * topY));
  let raTopoDeg = rad2deg(raTopoRad);
  raTopoDeg = normalizeDeg(raTopoDeg);
  const raTopoHours = raTopoDeg / 15.0;
  const decTopoDeg = rad2deg(decTopoRad);

  // Now compute Az/El using local sidereal time and topocentric RA/Dec
  const lstHours = localSiderealTimeHours(jd, lon);
  const haHours = (lstHours - raTopoHours);
  const haDeg = normalizeDeg(haHours * 15.0); // convert hours to degrees
  const haRad = deg2rad(haDeg);

  // Convert topocentric dec to radians
  const decT = decTopoRad;

  // Hour angle must be converted to -180..180 for sin/cos use
  let haRadSigned = haRad;
  if (haRad > Math.PI) haRadSigned = haRad - 2 * Math.PI;

  // Topocentric Az/El:
  const sinEl = Math.sin(latRad) * Math.sin(decT) + Math.cos(latRad) * Math.cos(decT) * Math.cos(haRadSigned);
  const ElRad = Math.asin(sinEl);
  const cosAz = (Math.sin(decT) - Math.sin(ElRad) * Math.sin(latRad)) / (Math.cos(ElRad) * Math.cos(latRad));
  const sinAz = -Math.cos(decT) * Math.sin(haRadSigned) / Math.cos(ElRad);
  let AzRad = Math.atan2(sinAz, cosAz);
  if (AzRad < 0) AzRad += 2 * Math.PI;

  const azDeg = rad2deg(AzRad);
  const elDeg = rad2deg(ElRad);

  return {
    az: azDeg, // degrees 0..360 (north=0? convention: 0 = north? Note common astronomical Az: 0 = north, increases eastward)
    el: elDeg, // degrees
    ra_hours: raTopoHours,
    dec_deg: decTopoDeg,
    distance_km: R,
    lat,
    lon,
    jd,
  };
}

// ----------------- Utility functions -----------------

function maidenheadToLatLon(locator) {
  // Returns {lat, lon} where lon positive east (deg)
  let s = locator.trim().toUpperCase();
  if (s.length < 2) throw new Error('Locator too short');
  // pad or trim to 6 chars for decent precision
  if (s.length < 6) s = s.padEnd(6, 'A');
  s = s.slice(0, 6);
  const A = 'A'.charCodeAt(0);
  // Fields
  const lonField = s.charCodeAt(0) - A;
  const latField = s.charCodeAt(1) - A;
  let lon = lonField * 20 - 180;
  let lat = latField * 10 - 90;
  // squares
  const lonSq = parseInt(s[2], 10);
  const latSq = parseInt(s[3], 10);
  if (!isNaN(lonSq) && !isNaN(latSq)) {
    lon += lonSq * 2;
    lat += latSq * 1;
  } else {
    lon += 1;
    lat += 0.5;
  }
  // subsquares
  const lonSub = s.charCodeAt(4) - 'A'.charCodeAt(0);
  const latSub = s.charCodeAt(5) - 'A'.charCodeAt(0);
  if (!isNaN(lonSub) && !isNaN(latSub)) {
    lon += (lonSub + 0.5) * (2 / 24);
    lat += (latSub + 0.5) * (1 / 24);
  }
  // Note: function returns lon east positive
  return { lat, lon };
}

function toJulianDate(date) {
  // date is a JS Date in UTC.
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds() + date.getUTCMilliseconds() / 1000;
  let year = Y;
  let month = M;
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD0 =
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    D +
    B -
    1524.5;
  const dayFrac = (h + m / 60 + s / 3600) / 24.0;
  return JD0 + dayFrac;
}

function deg2rad(d) { return d * (Math.PI / 180); }
function rad2deg(r) { return r * (180 / Math.PI); }
function normalizeDeg(d) {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

// Mean obliquity of the ecliptic (degrees) - IAU 1980 approximation (Meeus)
function meanObliquity(T) {
  // T in Julian centuries
  const seconds =
    21.448 - T * (46.8150 + T * (0.00059 - T * (0.001813)));
  const eps0 = 23 + (26 + seconds / 60) / 60;
  return eps0;
}

// Compute Local Sidereal Time in hours at longitude (deg east)
// JD is UTC-based Julian date
function localSiderealTimeHours(JD, lonEast) {
  // Convert JD to UT in Julian centuries from J2000
  const T = (JD - 2451545.0) / 36525.0;
  // Greenwich Mean Sidereal Time in seconds (approx)
  // Using formula from Meeus: GMST = 280.46061837 + 360.98564736629*(JD-2451545) + ...
  const JD0 = Math.floor(JD + 0.5) - 0.5;
  const H = (JD - JD0) * 24.0; // UT hours
  const D = JD - 2451545.0;
  const D0 = JD0 - 2451545.0;
  const T0 = D0 / 36525.0;
  let GMST = 6.697374558 + 0.06570982441908 * D0 + 1.00273790935 * H + 0.000026 * (T0 * T0);
  GMST = GMST % 24;
  if (GMST < 0) GMST += 24;
  // Local Sidereal Time in hours:
  let LST = GMST + lonEast / 15.0;
  LST = LST % 24;
  if (LST < 0) LST += 24;
  return LST;
}

// Get Local Hour Angle in degrees (0..360)
function localHourAngle(JD, lonEast, raHours) {
  const lst = localSiderealTimeHours(JD, lonEast);
  const haHours = lst - raHours;
  let ha = (haHours % 24) * 15.0;
  if (ha < 0) ha += 360.0;
  return ha;
}

