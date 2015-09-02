var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
    // var infoWindow = new google.maps.InfoWindow({map: map});

    var marker = new google.maps.Marker({
       //  position: myLatLng,
        map: map,
        title: 'Current place'
    });

    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            var elem1 = document.getElementById("rad_lat");
            elem1.value = pos["lat"];
        
            var elem2 = document.getElementById("rad_lng");
            elem2.value = pos["lng"];
 
            marker.setPosition(pos);
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, marker, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, marker, map.getCenter());
    }
    
    map.addListener('click',function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();

        var elem1 = document.getElementById("rad_lat");
        elem1.value = lat;
        
        var elem2 = document.getElementById("rad_lng");
        elem2.value = lng;
        
        var pos = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        marker.setPosition(pos);
        map.setCenter(pos);        
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    // console.log(pos);
    // infoWindow.setPosition(pos);
    // infoWindow.setContent(browserHasGeolocation ?
    //                       'Error: The Geolocation service failed.' :
    //                       'Error: Your browser doesn\'t support geolocation.');

    var pos = {
        lat: 36.4449219,
        lng: 136.592526
    };
    var elem1 = document.getElementById("rad_lat");
    elem1.value = 36.4449219;
        
    var elem2 = document.getElementById("rad_lng");
    elem2.value = 136.592526;

    marker.setPosition(pos);
    map.setCenter(pos);
}
