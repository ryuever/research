var map;
var directionDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var position;
var marker = null;
var polyline = null;
var speed = 0.000005, wait = 1;
var infowindow = null;

var myPano;   
var panoClient;
var nextPanoId;
var timerHandle = null;


$(document).ready(function(){
    $('#direction_start_sim').click(function(){
        calcRoute();
    });
});
  
function createMarker(latlng, label, html) {
    var contentString = '<b>'+label+'</b><br>'+html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5
    });
    marker.myname = label;

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString); 
        infowindow.open(map,marker);
    });
    return marker;
}

function initialize() {
    infowindow = new google.maps.InfoWindow(
        { 
            size: new google.maps.Size(150,50)
        });
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();
    
    // Create a map and center it on Manhattan.
    var myOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("direction_map"), myOptions);

    address = 'new york';
    geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
        map.setCenter(results[0].geometry.location);
	});
    
    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: map
    };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    
    // Instantiate an info window to hold step text.
    stepDisplay = new google.maps.InfoWindow();

    polyline = new google.maps.Polyline({
	    path: [],
        strokeColor: 'red',
	    strokeWeight: 3
    });
}         

var steps = [];

function calcRoute(){
    if (timerHandle) { clearTimeout(timerHandle); }
    if (marker) { marker.setMap(null);}
    polyline.setMap(null);

    directionsDisplay.setMap(null);
    polyline = new google.maps.Polyline({
	    path: [],
	    // strokeColor: '#FF0000',
        // strokeColor: 'black',
        strokeColor: 'yellow',
	    strokeWeight: 3
    });

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: map
    };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

	var start = document.getElementById("direction_from").value;
	var end = document.getElementById("direction_to").value;
	var travelMode = google.maps.DirectionsTravelMode.DRIVING;

	var request = {
	    origin: start,
	    destination: end,
	    travelMode: travelMode
	};
    // Route the directions and pass the response to function to create markers for each step.
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK){
	        directionsDisplay.setDirections(response);
            
            var bounds = new google.maps.LatLngBounds();
            var route = response.routes[0];
            startLocation = new Object();
            endLocation = new Object();
            
            // For each route, display summary information.
	        // var path = response.routes[0].overview_path;
	        var legs = response.routes[0].legs;
            for (i=0;i<legs.length;i++) {
                if (i == 0) { 
                    startLocation.latlng = legs[i].start_location;
                    startLocation.address = legs[i].start_address;
                    // marker = google.maps.Marker({map:map,position: startLocation.latlng});
                    marker = createMarker(legs[i].start_location,"start",legs[i].start_address,"green");
                }
                endLocation.latlng = legs[i].end_location;
                endLocation.address = legs[i].end_address;
                var steps = legs[i].steps;
                for (j=0;j<steps.length;j++) {
                    var nextSegment = steps[j].path;
                    for (k=0;k<nextSegment.length;k++) {
                        polyline.getPath().push(nextSegment[k]);
                        bounds.extend(nextSegment[k]);
                    }
                }
            }
            polyline.setMap(map);
            map.fitBounds(bounds);
	        map.setZoom(18);
	        startAnimation();
        }                                                    
    });
}

var step = 50; // 5; // metres
var tick = 100; // milliseconds
var eol;
var k=0;
var stepnum=0;
var lastVertex = 1;

function animate(d) {
    if (d>eol) {
        map.panTo(endLocation.latlng);
        marker.setPosition(endLocation.latlng);
        return;
    }
    var p = polyline.GetPointAtDistance(d);
    map.panTo(p);
    marker.setPosition(p);
    timerHandle = setTimeout("animate("+(d+step)+")", tick);
}

function startAnimation() {
    eol=polyline.Distance();
    map.setCenter(polyline.getPath().getAt(0));
    setTimeout("animate(50)",2000);  // Allow time for the initial map display
}
