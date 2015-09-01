$(document).ready(function(){
    // $('#radiation_start_btn').one('click', function() {
    
    //     // $(this).attr('disabled','disabled');
    // });
    
    $('#radiation_start_btn').click(function() {        
        radiation_simulation();        
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

    current_date = new Date();
    var cur = [current_date.getFullYear(),'-',
               ('0' + (current_date.getMonth() + 1)).slice(-2),'-',
               ('0' + current_date.getDate()).slice(-2)].join('');

    var radiation_list = [];
    
    for(var i=6; i<18; i++){
        var radiation_item = [];
        var time_sim = cur + " " + i.toString() + ":00";
        radiation_item.push(time_sim);
        radiation_item.push(0);                
        radiation_list.push(radiation_item);
    }

    var options_radiation = {
        // var plot3 = $.jqplot('radiation_simulation', [line1], {
        title:'Simulation of Solar Radiation', 
        axes:{
            xaxis:{
                renderer:$.jqplot.DateAxisRenderer,
                tickOptions:{
                    formatString:'%H',                                
                    angle: -40
                },
                tickInterval:'1 hour'
            }
        },
        series:[{lineWidth:4, markerOptions:{style:'square'}}]
    };
    
    var radiation_plot = $.jqplot('radiation_simulation', [radiation_list], options_radiation);

    function radiation_simulation(){
        radiation_list = [];
        
        var lat = parseFloat(document.getElementById("rad_lat").value);
        var lng = parseFloat(document.getElementById("rad_lng").value);
        var date = document.getElementById("rad_date").value;
        var relative_humidity = parseFloat(document.getElementById("rad_rh").value);
        var rainfall = parseFloat(document.getElementById("rad_rainfall").value);
        
        var match = date.match(/^(\d+)-(\d+)-(\d+)$/);

        var doy = md2doy(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        var solarAngle_obj = new solarAngle(lat, lng, 9, doy);
        var radiation = solarAngle_obj.cal_diff_beam(relative_humidity, rainfall);

        console.log(radiation);

        
        for(var i=6; i<18; i++){
            var radiation_item = [];
            var time_sim = date + " " + i.toString() + ":00";
            radiation_item.push(time_sim);
            radiation_item.push(radiation[i-6]);


            radiation_list.push(radiation_item);
        }

        console.log(radiation_list);
        // var line1 = [['2011-10-29 6:00',4], ['2011-10-29 7:00',6.5], ['2011-10-29 8:00',6.5]];
        // var plot3 = $.jqplot('radiation_simulation', [radiation_list], {
        //     // var plot3 = $.jqplot('radiation_simulation', [line1], {
        //     title:'Simulation of Solar Radiation', 
        //     axes:{
        //         xaxis:{
        //             renderer:$.jqplot.DateAxisRenderer,
        //             tickOptions:{
        //                 formatString:'%H',                                
        //                 angle: -40
        //             },
        //             tickInterval:'1 hour'
        //         }
        //     },
        //     series:[{lineWidth:4, markerOptions:{style:'square'}}]
        // });
       if (radiation_plot) {
    	    radiation_plot.destroy();
        }
 
        radiation_plot = $.jqplot('radiation_simulation', [radiation_list], options_radiation);
    }
});
