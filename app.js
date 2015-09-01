var express   =    require("express");
var mysql     =    require('mysql');
var path = require('path');


var pool      =    mysql.createPool({
    connectionLimit : 1000, //important
    multipleStatements : true,
    host     : 'localhost',
    user     : 'root',
    password : 'bingo',
    database : 'research',
    debug    :  false
});

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

var routes = require('./routes/index');
app.use('/', routes);

var travels = require('./routes/travel');
app.use('/travel', travels);

var heatmap_store = require('./routes/heatmap');
app.use('/heatmap', heatmap_store);

// app.get('/travel', function(req, res){
//     res.sendFile(__dirname + '/travel.html');
// });

// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/realtime_ploting.html');
// });

// app.get('/travel', function(req, res){
//     res.sendFile(__dirname + '/travel.html');
// });

// make the local file could be visible to server


io.on('connection', function(socket) {

    socket.on("close_socket", function(){
        // socket.close();
        socket.disconnect();
        // clearInterval(timer);
        console.log("socket is closed");
    });
    var timer;
    console.log("connection established");
    var previous = new Date(2015, 03, 26, 00, 00, 00, 00);
    var latter = new Date(2015, 03, 26, 00, 05, 00, 00);
    
    timer = setInterval(function() {
        previous = new Date(previous.getTime() + 5*60000);
        latter = new Date(latter.getTime() + 5*60000);
        
        var total = {};
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }   
            console.log('connected as id ' + connection.threadId);

            prev_time = [previous.getFullYear(),'-',
                         ('0' + (previous.getMonth() + 1)).slice(-2),'-',
                         ('0' + previous.getDate()).slice(-2),' ',
                         previous.getHours(), ':',
                         previous.getMinutes(),':',
                         previous.getSeconds()] .join('');

            latter_time = [latter.getFullYear(),'-',
                         ('0' + (latter.getMonth() + 1)).slice(-2),'-',
                         ('0' + latter.getDate()).slice(-2),' ',
                         latter.getHours(), ':',
                         latter.getMinutes(),':',
                         latter.getSeconds()] .join('');            

            //    used for multiple query :
            // sql = 'select * from research_value where get_date >"' + prev_time + '" and get_date < "' +
            //     latter_time + '"; select * from research_value2';
            // console.log(sql);
            // connection.query(sql,function(err,first){
            //     connection.release();
            //     if(!err) {

            //         var temperature_sum = 0;
            //         for (var i = 0; i < first[0].length; i++){
            //             temperature_sum += parseInt(first[0][i]["value"]);
            //         }                    
            //         console.log(temperature_sum);
            //         total["temperature"] = temperature_sum / first[0].length;
            //         total["power"] = "second";
            //         total["time"] = prev_time;
            //         console.log("beginning");
            //         console.log(total);
            //         socket.emit('status', total);
            //     }
            // });
            
            // connection.on('error', function(err) {      
            //     res.json({"code" : 100, "status" : "Error in connection database"});
            //     return;     
            // });

            sql = 'select * from device_value where get_date >"' + prev_time + '" and get_date < "' + latter_time + '";';
            console.log(sql);
            connection.query(sql,function(err,first){
                connection.release();
                if(!err) {
                    var temperature_sum = 0;
                    var wind_sum = 0;
                    var radiation_sum = 0;
                    var temperature_count = 0;
                    var wind_count = 0;
                    var radiation_count = 0;
                    for (var i = 0; i < first.length; i++){
                        if(first[i]["value"] != "" && first[i]["value"] != "    "){                                
                            //console.log(first[i]);
                            if (first[i]["property"] == "MeasuredTemp"){
                                // console.log(first[i]["value"]);                                
                                temperature_sum += parseInt(first[i]["value"],16) * 0.1;
                                temperature_count += 1;                               
                            }else if(first[i]["property"] == "WindSpeed"){
                                // console.log(first[i]["value"]);
                                wind_sum += parseInt(first[i]["value"],16) * 0.01;
                                wind_count += 1;
                            }else{
                                radiation_sum += parseInt(first[i]["value"],16);
                                radiation_count += 1;
                            }
                        }}
                    if(temperature_count == 0){
                        total["temperature"] = 25;
                    }else{
                        total["temperature"] = temperature_sum / temperature_count;
                    }                        
                    if (wind_count == 0){
                        total["wind"] = 1;
                    }else{
                        total["wind"] = wind_sum / wind_count;
                    }
                    if (radiation_count == 0){
                        total["radiation"] = 500;
                    }else{
                        total["radiation"] = radiation_sum / radiation_count;
                    }
                    total["time"] = prev_time;
                    // console.log(total);
                    socket.emit('status', total);
                }
            });
            

        });
    }, 1 * 2000);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
