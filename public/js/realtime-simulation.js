var t = 1000;
var n = 20;
var data = [];

var x = (new Date()).getTime(); // current Fri Aug 28 08:52:42 2015
for(i=0; i<n; i++){
	data.push([x - (n-1-i)*t,0]);
}

var options = {
    axes: {
  	    xaxis: {
  	   	    numberTicks: 10,
            renderer:$.jqplot.DateAxisRenderer,
            tickOptions:{formatString:'%H:%M:%S'},
            min : data[0][0],
            max: data[data.length-1][0]
	    },
	    yaxis: {min:0, max: 50,numberTicks: 6,
  	            tickOptions:{formatString:'%.1f'} 
	           }
    },
    seriesDefaults: {
  	    rendererOptions: { smooth: true}
    }
};
var plot1 = $.jqplot ('solar_simulation', [data],options);

$('button').click( function(){  
    doUpdate();
    /* $(this).hide(); */
});

function doUpdate(){
    var socket = io();

    var count = 1;
    socket.on('status', function(msg){

        if(data.length > n-1){
    	    data.shift();
        }

        // 2015-04-25 00:00:00 -> date object
        var match = msg['time'].match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);        
        var dat = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);

        var x = dat.getTime(); // current time

        if(count == 1){
            for(i=0; i<n-1; i++){
                if(data.length > n-1){
    	            data.shift();
                }
	            data.push([new Date(dat.getTime() - (n-1-i)*5*60000).getTime(),0]);
            }
            count = 2;             
        }

        if(data.length > n-1){
    	    data.shift();
        }

        var y = msg["temperature"];
        data.push([x,y]);
        
        if (plot1) {
    	    plot1.destroy();
        }
        plot1.series[0].data = data; 
        
        options.axes.xaxis.min = data[0][0];
        options.axes.xaxis.max = data[data.length-1][0];
        plot1 = $.jqplot ('solar_simulation', [data],options);
    });
}
