var map, timer;
var offset = {};
var tracks;
var unlock = false;
var travel_item = [];

Array.prototype.sortBy = function(p) {
    return this.slice(0).sort(function(a,b) {
        return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
    });
};

function initialize(){
    console.log("running from travel js ");
    window.coord_list = [];
    var sorted_obj = [];
    var map = new google.maps.Map(document.getElementById('travel_map'), {
        center: {lat: 37.46, lng: 121.448},
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    $('#travel_start_sim').click(function(){
        sorted_obj = travel_item.sortBy('date');

        var geocoder = new google.maps.Geocoder();
        
        // for (var i = sorted_obj.length-1; i >= 0; i--) {
        //     geocodeAddress(geocoder, map, sorted_obj[i]['from']);
        //     geocodeAddress(geocoder, map, sorted_obj[i]['to']);
        // };

        for (var i = 0; i < sorted_obj.length; i++) {
            geocodeAddress(geocoder, map, sorted_obj[i]['from']);
            geocodeAddress(geocoder, map, sorted_obj[i]['to']);
        };
        
        console.log(sorted_obj.length);
        
        setTimeout(function(){            
            console.log(coord_list);

            var pos = {
                lat: coord_list[0].lat(),
                lng: coord_list[0].lng()
            };
            
            map.setCenter(pos);        
            
            if(tracks){
                  tracks.setMap(null);
            }
            tracks = new google.maps.Polyline({ 
                // path : [kaifeng, shanghai, nagoya, sapporo,kyoto,shanghai, kaifeng],
                path : coord_list,
                geodesic: true,
                strokeOpacity: 1.0,
                strokeWeight: 0.05,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        // path: "jpg/airplane.png",
                        strokeColor: 'red',
                        strokeOpacity: 1.0,
                        strokeWeight: 1,
                        fillColor: 'blue',
                        fillOpacity: 1.0,
                        scale: 1
                    },
                    repeat: '10%',
                    offset: '5%'
                }],
                map: map
            });    
            
            offset = {
                'tracks': 0
            };
            
            start();
            $(this).attr('disabled','disabled');
            $('#travel_terminate_sim').prop("disabled", false);
        }, 3000);                 
    });

    $('#travel_terminate_sim').click(function(){
        stop();
        $(this).attr('disabled','disabled');
        $('#travel_start_sim').prop("disabled", false);
    });

    $('#travel_datetimepicker').datetimepicker();

    $('#travel_add').click(function(){
        event.preventDefault(); // stop default behaviour of submit button
        from = $('#travel_from').val();
        to = $('#travel_to').val();
        date = $('#travel_datetimepicker').val();

        var match = date.match(/^(\d+)\/(\d+)\/(\d+) (\d+)\:(\d+)$/);        
        var dat = new Date(match[1], match[2] - 1, match[3], match[4], match[5]);

        travel_item.push({"from":from, "to":to, "date":dat}); 
        
        // add new list item
        $('#travel_list').prepend('<li> ' + from +'->' + to + ' : ' + date + '<a href="#" class="itemDelete"> D </a>' + '</li>');
        // clear value input
        $('#travel_from').val('');
        $('#travel_to').val('');
        $('#travel_datetimepicker').val('');                 
    });

    $('#travel_list').on('click', '.itemDelete', function() {
        $(this).closest('li').remove();
    });

    $('#travel_clear_sim').click(function(){
        stop();
        $('#travel_list').empty();
        tracks.setMap(null);
    });    
}

function start() {
    timer = setInterval(function() {
        animateTracks();
        console.log("start loop");
    }, 500);
}

function stop() {
    travel_item = [];
    coord_list = [];
    clearInterval(timer);    
}

function animateTracks() {
    if (offset['tracks'] == 9) {
        offset['tracks'] = 0;
    } else {
        offset['tracks']++;
    }
    var icons = tracks.get('icons');
    icons[0].offset = offset['tracks'] + '%';
    tracks.set('icons', icons); 
}

function geocodeAddress(geocoder, resultsMap, address) {
    // var address = document.getElementById('address').value;
    var tttt = [];
    var lat = 0;
    var lng = 0;
    var tt = "";
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            coord_list.push(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
    // return {'lat':lat, 'lng':lng};
}
