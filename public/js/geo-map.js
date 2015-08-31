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

            var elem1 = document.getElementById("lat");
            elem1.value = pos["lat"];
        
            var elem2 = document.getElementById("lng");
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

        var elem1 = document.getElementById("lat");
        elem1.value = lat;
        
        var elem2 = document.getElementById("lng");
        elem2.value = lng;
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}
