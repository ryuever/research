$(document).ready(function(){
    $('#solar_start_btn').one('click', function() {
        solar_doUpdate();
        $(this).attr('disabled','disabled');
    });

    $('#windTurbine_start_btn').one('click', function() {
        wind_doUpdate();
        $(this).attr('disabled','disabled');
    });

    // $('#myForm').ajaxForm(function() { 
    //             alert("Thank you for your comment!"); 
    // }); 

    $('.item-wrapper a').mouseenter(function () {
        console.log($(this).data('panel'));
        // alert("hello");
        if ($(this).data('panel')) {
            $('.panel').hide();
            $('#' + $(this).data('panel')).show();
        }
    });
    $('.item-wrapper a').mouseleave(function () {
        $('.panel').hide();
    });
});

var t = 1000;
var n = 20;

var solar_data = [];

var x = (new Date()).getTime(); // current Fri Aug 28 08:52:42 2015
for(i=0; i<n; i++){
	solar_data.push([x - (n-1-i)*t,0]);
}

var options_solar = {
    axes: {
  	    xaxis: {
  	   	    numberTicks: 10,
            renderer:$.jqplot.DateAxisRenderer,
            tickOptions:{
                formatString:'%H:%M',
                angle:15
            },
            min : solar_data[0][0],
            max: solar_data[solar_data.length-1][0],
            tickInterval:'5 minute'
	    },
	    yaxis: {min:0, max: 2000,numberTicks: 6,
  	            tickOptions:{formatString:'%.1f'} 
	           }
    },
    seriesDefaults: {
  	    rendererOptions: { smooth: true}
    }
};

var plot1 = $.jqplot ('solarPV_simulation', [solar_data],options_solar);

function solar_doUpdate(){
    var socket = io();
    var count = 1;
    socket.on('status', function(msg){

        if(solar_data.length > n-1){
    	    solar_data.shift();
        }

        // 2015-04-25 00:00:00 -> date object
        var match = msg['time'].match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);        
        var dat = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

        var x = dat.getTime(); // current time

        if(count == 1){
            for(i=0; i<n-1; i++){
                if(solar_data.length > n-1){
    	            solar_data.shift();
                }
	            solar_data.push([new Date(dat.getTime() - (n-1-i)*5*60000).getTime(),0]);
            }
            count = 2;             
        }

        if(solar_data.length > n-1){
    	    solar_data.shift();
        }

        var solar_obj = new solarPV();
        var power = solar_obj.generatedPower(msg['temperature'], msg['wind'], msg['radiation']);
        // var y = msg["temperature"];
        solar_data.push([x,power]);
        
        if (plot1) {
    	    plot1.destroy();
        }
        plot1.series[0].data = solar_data; 
        
        options_solar.axes.xaxis.min = solar_data[0][0];
        options_solar.axes.xaxis.max = solar_data[solar_data.length-1][0];
        plot1 = $.jqplot ('solarPV_simulation', [solar_data],options_solar);
    });
}



/*--------------------- wind Turbine simulation  --------------------*/
var wind_data = [];

var y = (new Date()).getTime(); // current Fri Aug 28 08:52:42 2015
for(i=0; i<n; i++){
	wind_data.push([y - (n-1-i)*t,0]);
}

var options_wind = {
    axes: {
  	    xaxis: {
  	   	    numberTicks: 10,
            renderer:$.jqplot.DateAxisRenderer,
            tickOptions:{
                formatString:'%H:%M',
                angle:15
            },
            min : wind_data[0][0],
            max: wind_data[wind_data.length-1][0]
	    },
	    yaxis: {min:0, max: 2000,numberTicks: 6,
  	            tickOptions:{formatString:'%.1f'} 
	           }
    },
    seriesDefaults: {
  	    rendererOptions: { smooth: true}
    }
};

var plot2 = $.jqplot ('windTurbine_simulation', [wind_data],options_wind);

function wind_doUpdate(){
    var socket = io();
    var count = 1;
    socket.on('status', function(msg){

        if(wind_data.length > n-1){
    	    wind_data.shift();
        }

        // 2015-04-25 00:00:00 -> date object
        var match = msg['time'].match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);        
        var dat = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

        var x = dat.getTime(); // current time

        if(count == 1){
            for(i=0; i<n-1; i++){
                if(wind_data.length > n-1){
    	            wind_data.shift();
                }
	            wind_data.push([new Date(dat.getTime() - (n-1-i)*5*60000).getTime(),0]);
            }
            count = 2;             
        }

        if(wind_data.length > n-1){
    	    wind_data.shift();
        }

        var wind_obj = new windTurbine();
        var power = wind_obj.cal_available_power(msg['wind']);
        // var y = msg["temperature"];
        wind_data.push([x,power]);
        
        if (plot2) {
    	    plot2.destroy();
        }
        plot2.series[0].data = wind_data; 
        
        options_wind.axes.xaxis.min = wind_data[0][0];
        options_wind.axes.xaxis.max = wind_data[wind_data.length-1][0];
        plot2 = $.jqplot ('windTurbine_simulation', [wind_data],options_wind);
    });
}

