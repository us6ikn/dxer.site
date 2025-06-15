
// The place, observatory definitions and daylight savings functions

function place(name,latitude,ns,longitude,we,zone,dss,dse) {
  this.name      = name;
  this.latitude  = latitude;
  this.ns        = ns;
  this.longitude = longitude;
  this.we        = we;
  this.zone      = zone;
  this.dss       = dss;
  this.dse       = dse;
}

// A selection of places
// Please leave Greenwich in the first entry as the default
// These places are sorted by hemisphere, North first, then by a country code.

var atlas = new Array(
  new place("UK:Greenwich","51:28:38",0,"00:00:00",0,0,"3:5:0","10:5:0"),
  new place("UK:Cheltenham","51:53:52",0,"02:04:07",0,0,"3:5:0","10:5:0"),
  new place("A:Vienna","48:13:00",0,"16:22:00",1,-60,"3:5:0","10:5:0"),
  new place("B:Brussels","50:50:00",0,"4:21:00",1,-60,"3:5:0","10:5:0"),
  new place("CH:Berne","46:55:00",0,"07:28:00",1,-60,"3:5:0","10:5:0"),
  new place("CH:Genève","46:12:00",0,"06:10:00",1,-60,"3:5:0","10:5:0"),
  new place("CH:Lausanne","46:32:00",0,"06:40:00",1,-60,"3:5:0","10:5:0"),
  new place("CH:Zurich","47:22:40",0,"08:33:04",1,-60,"3:5:0","10:5:0"),
  new place("D:Berlin","52:32:00",0,"13:25:00",1,-60,"3:5:0","10:5:0"),
  new place("D:Frankfurt am Main","50:06:00",0,"8:41:00",1,-60,"3:5:0","10:5:0"),
  new place("D:Hamburg","53:33:00",0,"10:00:00",1,-60,"3:5:0","10:5:0"),
  new place("D:Munich","48:08:00",0,"11:35:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:Aalborg","57:03:00",0,"9:51:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:Århus","56:10:00",0,"10:13:00",1,-60,"3:5:0","10:5:0"),
  new place("DK:Copenhagen","55:43:00",0,"12:34:00",1,-60,"3:5:0","10:5:0"),
  new place("E:Madrid","40:25:00",0,"03:42:00",1,-60,"3:5:0","10:5:0"),
  new place("E:Malaga","36:43:00",0,"04:25:00",1,-60,"3:5:0","10:5:0"),
  new place("E:Las Palmas","28:08:00",0,"15:27:00",0,60,"3:5:0","10:5:0"),
  new place("F:Bordeaux","44:50:00",0,"0:34:00",0,-60,"3:5:0","10:5:0"),
  new place("F:Brest","48:24:00",0,"4:30:00",0,-60,"3:5:0","10:5:0"),
  new place("F:Calais","50:57:00",0,"1:52:00",1,-60,"3:5:0","10:5:0"),
  new place("F:Lille","50:38:00",0,"03:04:00",1,-60,"3:5:0","10:5:0"),
  new place("F:Marseille","43:18:00",0,"5:22:00",1,-60,"3:5:0","10:5:0"),
  new place("F:Nice","43:42:00",0,"07:16:00",1,-60,"3:5:0","10:5:0"),
  new place("F:Orléans","47:54:00",0,"01:54:00",1,-60,"3:5:0","10:5:0"),
  new place("F:Paris","48:48:00",0,"02:14:00",1,-60,"3:5:0","10:5:0"),
  new place("F:Strasbourg","48:35:00",0,"7:45:00",1,-60,"3:5:0","10:5:0"),
  new place("FI:Helsinki","60:08:00",0,"25:00:00",1,-120,"3:5:0","10:5:0"),
  new place("GR:Athens","38:00:00",0,"23:44:00",1,-120,"3:5:0","10:5:0"),
  new place("HR:Zagreb","45:48:00",0,"15:58:00",1,-60,"3:5:0","10:5:0"),
  new place("I:Rome","41:53:00",0,"12:30:00",1,-60,"3:5:0","10:5:0"),
  new place("I:Milan","45:28:00",0,"9:12:00",1,-60,"3:5:0","10:5:0"),
  new place("I:Palermo","38:08:00",0,"13:23:00",1,-60,"3:5:0","10:5:0"),
  new place("Irl:Dublin","53:19:48",0,"06:15:00",0,0,"3:5:0","10:5:0"),
  new place("Is:Reykjavik","64:09:00",0,"21:58:00",0,60,"3:5:0","10:5:0"),
  new place("Luxembourg","49:36:00",0,"6:09:00",1,-60,"3:5:0","10:5:0"),
  new place("N:Bergen","60:21:00",0,"5:20:00",1,-60,"3:5:0","10:5:0"),
  new place("N:Oslo","59:56:00",0,"10:45:00",1,-60,"3:5:0","10:5:0"),
  new place("N:Tromsø","69:70:00",0,"19:00:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Amsterdam","52:22:23",0,"4:53:33",1,-60,"3:5:0","10:5:0"),
  new place("NL:Apeldoorn","52:13:00",0,"5:57:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Maastricht","50:51:00",0,"5:04:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:Groningen","53:13:00",0,"6:33:00",1,-60,"3:5:0","10:5:0"),
  new place("NL:The Hague","52:05:00",0,"4:29:00",1,-60,"3:5:0","10:5:0"),
  new place("P:Lisbon","38:44:00",0,"9:08:00",0,0,"3:5:0","10:5:0"),
  new place("PL:Warszawa","52:15:00",0,"21:00:00",1,-60,"3:5:0","10:5:0"),
  new place("RO:Bucharest","44:25:00",0,"26:07:00",1,-120,"3:5:0","10:5:0"),
  new place("RU:Irkutsk","52:18:00",0,"104:15:00",1,-480,"3:5:0","10:5:0"),
  new place("RU:Moscow","55:45:00",0,"37:35:00",1,-180,"3:5:0","10:5:0"),
  new place("RU:Omsk","55:00:00",0,"73:22:00",1,-360,"3:5:0","10:5:0"),
  new place("S:Gothenburg","57:43:00",0,"11:58:00",1,-60,"3:5:0","10:5:0"),
  new place("S:Stockholm","59:35:00",0,"18:06:00",1,-60,"3:5:0","10:5:0"),
  new place("UK:Birmingham","52:30:00",0,"01:49:48",0,0,"3:5:0","10:5:0"),
  new place("UK:Belfast","54:34:48",0,"05:55:12",0,0,"3:5:0","10:5:0"),
  new place("UK:Cambridge","52:10:00",0,"00:06:00",0,0,"3:5:0","10:5:0"),
  new place("UK:Cardiff","51:30:00",0,"03:12:00",0,0,"3:5:0","10:5:0"),
  new place("UK:Edinburgh","55:55:48",0,"03:13:48",0,0,"3:5:0","10:5:0"),
  new place("UK:London","51:30:00",0,"00:10:12",0,0,"3:5:0","10:5:0"),
  new place("USA:Anchorage","61:10:00",0,"149:53:00",0,560,"04:1:0","10:5:0"),
  new place("USA:Dallas","32:48:00",0,"96:48:00",0,360,"04:1:0","10:5:0"),
  new place("USA:Denver","39:45:00",0,"104:59:00",0,420,"04:1:0","10:5:0"),
  new place("USA:Honolulu","21:19:00",0,"157:86:00",0,600,"04:1:0","10:5:0"),
  new place("USA:Los Angeles","34:03:15",0,"118:14:28",0,480,"04:1:0","10:5:0"),
  new place("USA:Miami","25:47:00",0,"80:20:00",0,300,"04:1:0","10:5:0"),
  new place("USA:Minneapolis","44:58:01",0,"93:15:00",0,360,"04:1:0","10:5:0"),
  new place("USA:Seattle","47:36:00",0,"122:19:00",0,480,"04:1:0","10:5:0"),
  new place("USA:Washington DC","38:53:51",0,"77:00:33",0,300,"04:1:0","10:5:0"),
  new place("Aus:Melbourne","37:48:00",1,"144:58:00",1,-600,"10:5:0","03:5:0"),
  new place("Aus:Perth","31:58:00",1,"115:49:00",1,-480,"10:5:0","03:5:0"),
  new place("Brazil:Rio de Janeiro","22:54:00",1,"43:16:00",0,180,"","")
);

// The observatory object holds local date and time,
// timezone correction in minutes with daylight saving if applicable,
// latitude and longitude (west is positive)

function observatory(place,year,month,day,hr,min,sec) {
  this.name = place.name;
  this.year = year;
  this.month = month;
  this.day = day;
  this.hours = hr;
  this.minutes = min;
  this.seconds = sec;
  this.tz = place.tz;
  this.latitude = place.latitude;
  this.longitude = place.longitude;
}

// The default observatory (Greenwich noon Jan 1 2000) 
// changed by user setting place and time from menu

var observer  = new observatory(atlas[0],2000,1,1,12,0,0);

// Site name returns name and latitude / longitude as a string

function sitename() {
  var sname=observer.name;
  var latd=Math.abs(observer.latitude);
  var latdi=Math.floor(latd);
  sname+=((latdi < 10) ? " 0" : " ") + latdi;
  latm=60*(latd-latdi); latmi=Math.floor(latm);
  sname+=((latmi < 10) ? ":0" : ":") + latmi;
  lats=60*(latm-latmi); latsi=Math.floor(lats);
  sname+=((latsi < 10) ? ":0" : ":") + latsi;
  sname+=((observer.latitude >= 0) ? "N " : "S ");
  var longd=Math.abs(observer.longitude);
  var longdi=Math.floor(longd);
  sname+=((longdi < 10) ? "0" : "") + longdi;
  longm=60*(longd-longdi); longmi=Math.floor(longm);
  sname+=((longmi < 10) ? ":0" : ":") + longmi;
  longs=60*(longm-longmi); longsi=Math.floor(longs);
  sname+=((longsi < 10) ? ":0" : ":") + longsi;
  sname+=((observer.longitude >= 0) ? "W" : "E");
  return sname;
}

// Check DST is an attempt to check daylight saving, its not perfect.
// Returns 0 or -60 that is amount to remove to get to zone time.

function checkdst(obs) {
  // We only know daylight saving if in the atlas
  with (document.table1) {
    if ((Place.selectedIndex < 0) || (Place.selectedIndex >= atlas.length))
      return 0;
    var dss=atlas[Place.selectedIndex].dss;
    var dse=atlas[Place.selectedIndex].dse;
    var ns=atlas[Place.selectedIndex].ns;
  }
  if (dss.length==0) return 0;
  if (dse.length==0) return 0;
  // parse the daylight saving start & end dates
  var col1=dss.indexOf(":");
  var col2=dss.lastIndexOf(":");
  var col3=dss.length;
  var dssm=parseInt(dss.substring(0,col1),10);
  var dssw=parseInt(dss.substring(col1+1,col2),10);
  var dssd=parseInt(dss.substring(col2+1,col3),10);
  col1=dse.indexOf(":");
  col2=dse.lastIndexOf(":");
  col3=dse.length;
  var dsem=parseInt(dse.substring(0,col1),10);
  var dsew=parseInt(dse.substring(col1+1,col2),10);
  var dsed=parseInt(dse.substring(col2+1,col3),10);
  // Length of months
  // year,month,day and day of week
  var jdt=jd0(obs.year,obs.month,obs.day);
  var ymd=jdtocd(jdt);
  // first day of month - we need to know day of week
  var fymd=jdtocd(jdt-ymd[2]+1);
  // look for daylight saving / summertime changes
  // first the simple month checks
  // Test for the northern hemisphere
  if (ns==0) {
    if ((ymd[1]>dssm) && (ymd[1]<dsem)) return -60;
    if ((ymd[1]<dssm) || (ymd[1]>dsem)) return 0;
  } else{
  // Southern hemisphere, New years day is summer.
    if ((ymd[1]>dssm) || (ymd[1]<dsem)) return -60;
    if ((ymd[1]<dssm) && (ymd[1]>dsem)) return 0;
  }
  // check if we are in month of change over
  if (ymd[1]==dssm) { // month of start of summer time
    // date of change over
    var ddd=dssd-fymd[3]+1;
    ddd=ddd+7*dssw;
    while (ddd>month_length[ymd[1]-1]) ddd-=7;
    if (ymd[2]<ddd) return 0;
    // assume its past the change time, its impossible
    // to know if the change has occured.
    return -60;
  } 
  if (ymd[1]==dsem) { // month of end of summer time
    // date of change over
    var ddd=dsed-fymd[3]+1;
    ddd=ddd+7*dsew;
    while (ddd>month_length[ymd[1]-1]) ddd-=7;
    if (ymd[2]<ddd) return -60;
    // see comment above for start time
    return 0;
  }
  return 0;
}

// The Julian date at observer time

function jd(obs) {
  var j = jd0(obs.year,obs.month,obs.day);
  j+=(obs.hours+((obs.minutes+obs.tz)/60.0)+(obs.seconds/3600.0))/24;
  return j;
}

// sidereal time in hours for observer

function local_sidereal(obs) {
  var res=g_sidereal(obs.year,obs.month,obs.day);
  res+=1.00273790935*(obs.hours+(obs.minutes+obs.tz+(obs.seconds/60.0))/60.0);
  res-=obs.longitude/15.0;
  while (res < 0) res+=24.0;
  while (res > 24) res-=24.0;
  return res;
}

// radtoaa converts ra and dec to altitude and azimuth

function radtoaa(ra,dec,obs) {
  var lst=local_sidereal(obs);
  var x=cosd(15.0*(lst-ra))*cosd(dec);
  var y=sind(15.0*(lst-ra))*cosd(dec);
  var z=sind(dec);
  // rotate so z is the local zenith
  var xhor=x*sind(obs.latitude)-z*cosd(obs.latitude);
  var yhor=y;
  var zhor=x*cosd(obs.latitude)+z*sind(obs.latitude);
  var azimuth=rev(atan2d(yhor,xhor)+180.0); // so 0 degrees is north
  var altitude=atan2d(zhor,Math.sqrt(xhor*xhor+yhor*yhor));
  return new Array(altitude,azimuth);
}

// aatorad converts alt and azimuth to ra and dec

function aatorad(alt,az,obs) {
  var lst=local_sidereal(obs)
  var lat=obs.latitude
  var j=sind(alt)*sind(lat)+cosd(alt)*cosd(lat)*cosd(az);
  var dec=asind(j);
  j=(sind(alt)-sind(lat)*sind(dec))/(cosd(lat)*cosd(dec));
  var s=acosd(j);
  j=sind(az);
  if (j>0) s=360-s;
  var ra=lst-s/15;
  if (ra<0) ra+=24;
  if (ra>=24) ra-=24;
  return new Array(ra,dec);
}
