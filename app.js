var express   =    require("express");
var mysql     =    require('mysql');

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

app.get('/', function(req, res){
    res.sendFile(__dirname + '/realtime_ploting.html');
});

// make the local file could be visible to server
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    console.log("connection established");
    var previous = new Date(2015, 03, 24, 00, 00, 00, 00);
    var latter = new Date(2015, 03, 24, 00, 05, 00, 00);
    
    setInterval(function() {
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
            sql = 'select * from research_value where get_date >"' + prev_time + '" and get_date < "' +
                latter_time + '"; select * from research_value2';
            console.log(sql);
            connection.query(sql,function(err,first){
                connection.release();
                if(!err) {

                    var temperature_sum = 0;
                    for (var i = 0; i < first[0].length; i++){
                        temperature_sum += parseInt(first[0][i]["value"]);
                    }                    
                    console.log(temperature_sum);
                    total["temperature"] = temperature_sum / first[0].length;
                    total["power"] = "second";
                    total["time"] = prev_time;
                    console.log("beginning");
                    console.log(total);
                    socket.emit('status', total);
                }
            });
            
            // connection.on('error', function(err) {      
            //     res.json({"code" : 100, "status" : "Error in connection database"});
            //     return;     
            // });
        });
        console.log("sent interval");
        console.log(total);

    }, 1 * 1000);
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

// app.listen(3000);
