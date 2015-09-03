var solar_previous = new Date(2015, 03, 25, 23, 55, 00, 00);
var solar_latter = new Date(2015, 03, 26, 00, 00, 00, 00);
var solar_stop = false;
var solar_timer = 0;
var solar_data = [];

var windTurbine_previous = new Date(2015, 03, 25, 23, 55, 00, 00);
var windTurbine_latter = new Date(2015, 03, 26, 00, 00, 00, 00);
var windTurbine_stop = false;
var windTurbine_timer = 0;
var wind_data = [];
$(document).ready(function(){
    $('#solar_start_btn').click(function() {
        // solar_stop = false;
        solar_previous = new Date(solar_previous.getTime() + 5*60000);
        solar_latter = new Date(solar_latter.getTime() + 5*60000);

        var solar_prev_time = [solar_previous.getFullYear(),'-',
                               ('0' + (solar_previous.getMonth() + 1)).slice(-2),'-',
                               ('0' + solar_previous.getDate()).slice(-2),' ',
                               solar_previous.getHours(), ':',
                               solar_previous.getMinutes(),':',
                               solar_previous.getSeconds()] .join('');

        var solar_latter_time = [solar_latter.getFullYear(),'-',
                                       ('0' + (solar_latter.getMonth() + 1)).slice(-2),'-',
                                       ('0' + solar_latter.getDate()).slice(-2),' ',
                                       solar_latter.getHours(), ':',
                                       solar_latter.getMinutes(),':',
                                       solar_latter.getSeconds()] .join('');            

        
        var send_data = {previous:solar_prev_time, latter:solar_latter_time};
        
        $.ajax({
            url:document.location.href+'haha',
            data: send_data,
            // type: 'POST',
            success:function(response){
                solar_doUpdate(response);
            }
        });
        // $(this).attr('disabled','disabled');
    });

    $('#solar_terminate_btn').click(function() {
        clearTimeout(solar_timer);
        solar_stop = true;
    });
    
    $('#windTurbine_start_btn').click(function() {
        // windTurbine_stop = false;
        windTurbine_previous = new Date(windTurbine_previous.getTime() + 5*60000);
        windTurbine_latter = new Date(windTurbine_latter.getTime() + 5*60000);
        var windTurbine_prev_time = [windTurbine_previous.getFullYear(),'-',
                                     ('0' + (windTurbine_previous.getMonth() + 1)).slice(-2),'-',
                                     ('0' + windTurbine_previous.getDate()).slice(-2),' ',
                                     windTurbine_previous.getHours(), ':',
                                     windTurbine_previous.getMinutes(),':',
                                     windTurbine_previous.getSeconds()] .join('');
        
        var windTurbine_latter_time = [windTurbine_latter.getFullYear(),'-',
                                       ('0' + (windTurbine_latter.getMonth() + 1)).slice(-2),'-',
                                       ('0' + windTurbine_latter.getDate()).slice(-2),' ',
                                       windTurbine_latter.getHours(), ':',
                                       windTurbine_latter.getMinutes(),':',
                                       windTurbine_latter.getSeconds()] .join('');                    
        
        var send_data = {previous:windTurbine_prev_time, latter : windTurbine_latter_time};

        $.ajax({
            url:document.location.href+'haha',
            data: send_data,
            // type: 'POST',
            success:function(response){
                windTurbine_doUpdate(response);                
            }
        });
        // $(this).attr('disabled','disabled');
    });

    $('#windTurbine_terminate_btn').click(function() {
        clearTimeout(windTurbine_timer);
        windTurbine_stop = true;
    });
    

    $('.item-wrapper a').mouseenter(function () {
        console.log($(this).data('panel'));
        if ($(this).data('panel')) {
            $('.panel').hide();
            $('#' + $(this).data('panel')).show();
        }
    });
    $('.item-wrapper a').mouseleave(function () {
        $('.panel').hide();
    });
});

var t = 60000;    // 1 minute in js
var n = 20;

var x = (new Date()).getTime(); // current Fri Aug 28 08:52:42 2015
for(i=0; i<n; i++){
    var temp = new Date(x - (n-1-i)*5*t);
    var temp_time = [temp.getFullYear(),'-',
                     ('0' + (temp.getMonth() + 1)).slice(-2),'-',
                     ('0' + temp.getDate()).slice(-2),' ',
                     temp.getHours(), ':',
                     temp.getMinutes(),':',
                     temp.getSeconds()] .join('');
    
	solar_data.push([temp_time,0]);
    wind_data.push([temp_time,0]);
}

var options_solar = {
    title:'Simulation of solar PV', 
    axes: {
  	    xaxis: {
  	   	    numberTicks: 11,
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

var solar_count = 1;
function solar_doUpdate(response){
    solar_stop = false;
    console.log('in solar_doUPdate');

    if(solar_data.length > n-1){
    	solar_data.shift();
    }

    // 2015-04-25 00:00:00 -> date object
    var match = response['data']['time'].match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);        
    var dat = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
    
    var x = dat.getTime(); // current time

    if(solar_count == 1){
        for(i=0; i<n-1; i++){
            if(solar_data.length > n-1){
    	        solar_data.shift();
            }
	        // solar_data.push([new Date(dat.getTime() - (n-1-i)*10*60000).getTime(),0]);
            solar_data.push([new Date(dat.getTime() - (n-1-i)*5*t).getTime(),0]);
        }
        solar_count = 2;             
    }

    if(solar_data.length > n-1){
    	solar_data.shift();
    }

    var solar_obj = new solarPV();
    var power = solar_obj.generatedPower(response['data']['temperature'], response['data']['wind'], response['data']['radiation']);
    console.log("power" + power.toString());
    // var y = response['data']["temperature"];
    solar_data.push([x,power]);
    
    if (plot1) {
    	plot1.destroy();
    }
    plot1.series[0].data = solar_data;
    
    options_solar.axes.xaxis.min = solar_data[0][0];
    options_solar.axes.xaxis.max = solar_data[solar_data.length-1][0];
    plot1 = $.jqplot ('solarPV_simulation', [solar_data],options_solar);

    if (!solar_stop){
        solar_timer = setTimeout(triggerSolarClick, 2000);
    }
}

function triggerSolarClick() {
    $('#solar_start_btn').trigger('click');
}

/*--------------------- wind Turbine simulation  --------------------*/

var options_wind = {
    title:'Simulation of Wind Turbine', 
    axes: {
  	    xaxis: {
  	   	    numberTicks: 11,
            renderer:$.jqplot.DateAxisRenderer,
            tickOptions:{
                formatString:'%H:%M',
                angle:15
            },
            min : wind_data[0][0],
            max: wind_data[wind_data.length-1][0],
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

var plot2 = $.jqplot ('windTurbine_simulation', [wind_data],options_wind);

var wind_count = 1;
function windTurbine_doUpdate(response){
    windTurbine_stop = false;
    if(wind_data.length > n-1){
    	wind_data.shift();
    }

    // 2015-04-25 00:00:00 -> date object
    var match = response['data']['time'].match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);        
    var dat = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

    var x = dat.getTime(); // current time

    if(wind_count == 1){
        for(i=0; i<n-1; i++){
            if(wind_data.length > n-1){
    	        wind_data.shift();
            }
	        wind_data.push([new Date(dat.getTime() - (n-1-i)*5*60000).getTime(),0]);
        }
        wind_count = 2;             
    }
    
    if(wind_data.length > n-1){
    	wind_data.shift();
    }

    var wind_obj = new windTurbine();
    var power = wind_obj.cal_available_power(response['data']['wind']);
    wind_data.push([x,power]);
    
    if (plot2) {
    	plot2.destroy();
    }
    plot2.series[0].data = wind_data; 
    
    options_wind.axes.xaxis.min = wind_data[0][0];
    options_wind.axes.xaxis.max = wind_data[wind_data.length-1][0];
    plot2 = $.jqplot ('windTurbine_simulation', [wind_data],options_wind);

    if (!windTurbine_stop){
        windTurbine_timer = setTimeout(triggerWindClick, 2000);
    }
}

function triggerWindClick() {
    $('#windTurbine_start_btn').trigger('click');
}
