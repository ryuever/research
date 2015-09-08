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

var step_info = [];
var step_distances = 0;
var steps_index = [];
var step_index = 0;

var start_time = 0;
var temp_time = 0;
var remaining_time = 0;

var distance = 0;

// save time state to resume simulation 
var suspend_time = 0;
var suspend_remaining_time = 0;

$(document).ready(function(){
    $('#direction_start_sim').click(function(){
        calcRoute();
    });

    $('#direction_suspend_sim').click(function(){
        suspend_time = time_to_msec(document.getElementById("time").innerHTML);
        suspend_remaining_time = time_to_msec(document.getElementById("time_remaining").innerHTML);
        if (timerHandle) { clearTimeout(timerHandle); }
        $('#speed').prop('readonly', false);
        document.getElementById("direction_start_sim").disabled = true;
    });
    
    $('#direction_resume_sim').click(function(){
        var speed_str = document.getElementById("speed").value;
        var reg = /\d+/g;
        speed = parseFloat(speed_str.match(reg));
        
        step = speed / 3.6;

        $('#speed').prop('readonly', true);
        if (timerHandle) { clearTimeout(timerHandle); }
        start_time = new Date();
        timerHandle = setTimeout("animate("+(distance+step)+"," + suspend_time + "," + suspend_remaining_time + ")", tick);
        document.getElementById("direction_start_sim").disabled = false;
    });
    
    $('#direction_clear_sim').click(function(){
        route_direction_clear();
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
    
    infowindow = new google.maps.InfoWindow({ 
        size: new google.maps.Size(150,50)
    });
    
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();
    
    // Create a map and center it on kanazawa station
    var myOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("direction_map"), myOptions);

    address = 'kanazawa';
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
        strokeColor: 'black',
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
                    marker = createMarker(legs[i].start_location,"start",legs[i].start_address,"green");
                }
                endLocation.latlng = legs[i].end_location;
                endLocation.address = legs[i].end_address;
                var steps = legs[i].steps;
                for (j=0;j<steps.length;j++) {
                    console.log(steps[j]);
                    console.log(steps[j].distance['text']);

                    if((steps[j].distance['text']).split(" ")[1] == 'km'){
                        step_distances += parseFloat(steps[j].distance['text']) * 1000; // length in meter
                    }else{
                        step_distances += parseFloat(steps[j].distance['text']); // length in meter
                    }
                    
                    step_info.push({step_distance:step_distances, step_text:steps[j].instructions });                                          

                    var nextSegment = steps[j].path;
                    for (k=0;k<nextSegment.length;k++) {
                        polyline.getPath().push(nextSegment[k]);
                        bounds.extend(nextSegment[k]);
                        step_index++;
                    }
                    steps_index.push(step_index);
                }
            }

            console.log('steps_index ' + steps_index);   // 4,8,15,21,79,90,99,102
            polyline.setMap(map);
            map.fitBounds(bounds);
	        map.setZoom(18);
	        startAnimation();
        }                                                    
    });
}

var step = 5; // 5; // metres
var tick = 1000; // milliseconds
var eol;
var k=0;
var stepnum=0;
var lastVertex = 1;
var indicator = 0;

function animate(d, suspend_time, suspend_remaining_time) {

    if (d == (eol + step)) {
        map.panTo(endLocation.latlng);
        marker.setPosition(endLocation.latlng);
        return;
    } else if(eol < d && d < (eol+step)){
        d = eol;
        console.log("second");
    }
               
    var p = polyline.GetPointAtDistance(d);
    var d_index = polyline.GetIndexAtDistance(d);
    console.log("d_index " + d_index.toString());

    // algorithm should be revised in the future.
    var d_in_steps_index = 0;
    for(d_in_steps_index ; d_in_steps_index < steps_index.length;d_in_steps_index++){
        console.log("d_in_steps_index " + d_in_steps_index.toString());
        console.log(d_index.toString() + " " + steps_index[d_in_steps_index]);
        if (d_index <= steps_index[d_in_steps_index]){
            break;
        }
    }

    // console.log("d_in_steps_index " + d_in_steps_index.toString());

    if (d_in_steps_index < steps_index.length-1){
        document.getElementById("step").innerHTML = step_info[d_in_steps_index+1]['step_text'];
    }else{
        document.getElementById("step").innerHTML = "<b>Trip completed</b>";
    }
        document.getElementById("distance").innerHTML =  parseInt(d).toString() + 'm';
        
    temp_time = new Date();
    var diff_time = temp_time - start_time;     // milliseconds
    
    document.getElementById("time").innerHTML =
        time_diff_conversion(diff_time + suspend_time);

    var speed_str = document.getElementById("speed").value;
    var reg = /\d+/g;
    speed = parseFloat(speed_str.match(reg));
    document.getElementById("speed").value = speed + "km/h";
    
    console.log("eol" + eol.toString() + " step " + step.toString());
    remaining_time = eol / step * 1000 - diff_time - suspend_time;
    if(remaining_time < 0){
        remaining_time = 0;
    }
    document.getElementById("time_remaining").innerHTML = time_diff_conversion(remaining_time);    
    
    map.panTo(p);
    marker.setPosition(p);

    distance = d;

    timerHandle = setTimeout("animate("+(d+step)+"," + suspend_time + "," + suspend_remaining_time + ")", tick);
}

function startAnimation() {
    start_time = new Date();
    // console.log("step_info" + step_info);
    eol=polyline.Distance();
    // console.log("eol" + eol.toString());
    // console.log("get Index at distance : " + polyline.GetIndexAtDistance(eol));    // 102
    map.setCenter(polyline.getPath().getAt(0));
    polyline.setMap(null);
    var speed_str = document.getElementById("speed").value;
    var reg = /\d+/g;
    speed = parseFloat(speed_str.match(reg));

    step = speed / 3.6;
    
    $('#speed').prop('readonly', true);
    // Allow time for the initial map display
    setTimeout("animate("+ step +"," + suspend_time + "," + suspend_remaining_time + ")", 2000);
    // setTimeout("animate(" + step + ")",2000);  
}

function route_direction_clear(){
    if (timerHandle) { clearTimeout(timerHandle); }
    polyline.setMap(null);
    directionsDisplay.setMap(null);
    step_info = [];
    step_distances = 0;
    steps_index = [];
    step_index = 0;
    if (marker){
        marker.setMap(null);
    }    
    document.getElementById("direction_from").value = null;
    document.getElementById("direction_to").value = null;    
    document.getElementById("step").innerHTML = "";
    document.getElementById("distance").innerHTML = "";
    document.getElementById("speed").value = "";
    document.getElementById("time").innerHTML = "";
    document.getElementById("time_remaining").innerHTML = "";
    suspend_time = 0;
    suspend_remaining_time = 0;
    $('#speed').prop('readonly', false);
}

function time_diff_conversion(msec){
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;    
    if (hh<10){
        hh = '0'+hh;
    }
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    if (mm < 10){
        mm = '0' + mm;
    }    
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    if (ss < 10){
        ss = '0' + ss;
    }
    return hh + ":" + mm +":" + ss;
}

function time_to_msec(time_string){
    var reg = /\d+/g;
    var time_list = time_string.match(reg);
    
    return time_list[0] * 1000 * 60 * 60 + time_list[1] * 1000 * 60 + time_list[2] * 1000;    
}
