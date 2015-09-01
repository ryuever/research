var map, heatmap, data;
var nextStore = 0;

var year = 2005;
var month = 1;
var running = false;
var unlock = false;

function initialize() {
    data = new google.maps.MVCArray();
    
    map = new google.maps.Map(document.getElementById('heatmap_stores_map'), {
        zoom: 5,
        center: new google.maps.LatLng(36.70365959719453,139.1748046875),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{
            stylers: [{saturation: -100}]
        }, {
            featureType: 'poi.park',
            stylers: [{visibility: 'off'}]
        }],
        disableDefaultUI: true
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        map: map,
        data: data,
        radius: 16,
        dissipate: false,
        maxIntensity: 8,
        gradient: [
            'rgba(0, 0, 0, 0)',
            'rgba(255, 255, 0, 0.50)',
            'rgba(0, 0, 255, 1.0)'
        ]
    });
}

$(document).ready(function(){
    $('#heatmap_start_sim').click(function(){
        unlock = true;
        start();        
        $(this).attr('disabled','disabled');
        $('#heatmap_start_sim').prop("disabled", false);
    });
    
    $('#heatmap_terminate_sim').click(function(){
        stop();
        $(this).attr('disabled','disabled');
        $('#heatmap_terminate_sim').prop("disabled", false);
    });
});

function start() {
    if (unlock && !running) {    
        running = true;
        nextMonth();
    }
}

function stop() {
    running = false;
}

function nextMonth() {
    if (! running) {
        return;
    }
    while (stores[nextStore].date[0] <= year && stores[nextStore].date[1] <= month) {
        data.push(new google.maps.LatLng(stores[nextStore].coords[0], stores[nextStore].coords[1]));
        nextStore++;
    }
    if (nextStore < stores.length) {
        if (month == 12) {
            month = 1;
            year++;
        } else {
            month++;
            document.getElementById('heatmap_stores_year').innerHTML = year.toString() + "-" +month.toString();
        }
        setTimeout(nextMonth, 300);
    }
}
