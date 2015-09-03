var map, timer;
var offset = {};
var track_list = [];
var offset_list = [];
var timer_list = [];
var unlock = false;
var travel_item = [];
var coord_list = [];
var info_list = [];
Array.prototype.sortBy = function(p) {
    return this.slice(0).sort(function(a,b) {
        return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
    });
};

function initialize(){
    console.log("running from travel js ");

    var sorted_obj = [];
    var map = new google.maps.Map(document.getElementById('travel_map'), {
        center: {lat: 37.46, lng: 121.448},
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    $('#travel_start_sim').click(function(){
        sorted_obj = travel_item.sortBy('date');

        var geocoder = new google.maps.Geocoder();
        
        for (var i = 0; i < sorted_obj.length; i++) {
            geocodeAddress(geocoder, map, sorted_obj[i]['from'], i, "from");
            geocodeAddress(geocoder, map, sorted_obj[i]['to'], i, "to");
        };
        
        console.log(sorted_obj.length);
        
        setTimeout(function(){            
            // console.log(coord_list);

            // var pos = {
            //     lat: coord_list[0].lat(),
            //     lng: coord_list[0].lng()
            // };
            
            // map.setCenter(pos);        

            sorted_coord_list = coord_list.sortBy('sorted_id');

            for(var i=0; i<sorted_coord_list.length; i=i+2){
                
                var sim_item = [];
                var track;
                if(sorted_coord_list[i]["description"] == "from"){
                    var infoWindow = new google.maps.InfoWindow({map: map});
                    infoWindow.setPosition(sorted_coord_list[i]["pos"]);
                    infoWindow.setContent((i/2).toString());
                    info_list.push(infoWindow);
                    
                    sim_item.push(sorted_coord_list[i]["pos"]);
                    sim_item.push(sorted_coord_list[i+1]["pos"]);
                    track = new google.maps.Polyline({ 
                        path : sim_item,
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
                        track: 0
                    };
                    
                    track_list.push(track);
                    offset_list.push(offset);
                }else{
                    var infoWindow = new google.maps.InfoWindow({map: map});
                    infoWindow.setPosition(sorted_coord_list[i+1]["pos"]);
                    infoWindow.setContent((i/2).toString());

                    info_list.push(infoWindow);

                    sim_item.push(sorted_coord_list[i+1]["pos"]);
                    sim_item.push(sorted_coord_list[i]["pos"]);
                    track = new google.maps.Polyline({ 
                        // path : [kaifeng, shanghai, nagoya, sapporo,kyoto,shanghai, kaifeng],
                        path : sim_item,
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
                    track_list.push(track);
                    offset = {
                        track: 0
                    };
                    offset_list.push(offset);
                }
            }
            for(var k = 0; k<coord_list.length/2; k++){                    
                start(track_list[k], offset_list[k], k);
            }

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
        for(var track_count = 0; track_count < track_list.length; track_count++){            
            track_list[track_count].setMap(null);
            info_list[track_count].setMap(null);
        }
        track_list = [];
        info_list = [];
    });    
}

function start(track, offset, i) {
    // timer = setInterval(function() {
    timer_list.push(setInterval(function() {
        animateTrack_List(track, offset, i);
        console.log("start loop");
    }, 500));
    // timer_list.push(timer);
}

function stop() {
    for(var count = 0; count < timer_list.length; count++){
        clearInterval(timer_list[count]);
    }
    travel_item = [];
    offset = {};
    offset_list = [];
    timer_list = [];
    coord_list = [];
}

function animateTrack_List(track, offset, i) {
    if (offset['track'] == 6) {
        offset['track'] = 0;
    } else {
        offset['track']++;
    }
    var icons = track.get('icons');
    icons[0].offset = offset['track'] + '%';
    track.set('icons', icons); 
}

function geocodeAddress(geocoder, resultsMap, address, sorted_id, description) {
    // var address = document.getElementById('address').value;
    var temp = [];
    var lat = 0;
    var lng = 0;
    var tt = "";
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {

            var pos = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            temp = {pos : pos, sorted_id : sorted_id, description : description};            
            // coord_list.push(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
            coord_list.push(temp);
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
}
