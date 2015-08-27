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
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log("connection established");
    var previous = new Date(2015, 03, 24, 00, 00, 00, 00);
    var latter = new Date(2015, 03, 24, 00, 05, 00, 00);
    
    setInterval(function() {
        previous = new Date(previous.getTime() + 10*60000);
        latter = new Date(latter.getTime() + 10*60000);
        
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
            sql = 'select * from research_value where get_date >"' + prev_time + '" and get_date < "' + latter_time + '"; select * from research_value2';
            console.log(sql);
            connection.query(sql,function(err,first){
                connection.release();
                if(!err) {
                    // console.log(first[0]);
                    total["temperature"] = first[0];
                    // total["power"] = first[1];
                    total["power"] = "second";
                    // res.render('index.jade', total);
                }
                // console.log(err);
            });
            
            // connection.on('error', function(err) {      
            //     res.json({"code" : 100, "status" : "Error in connection database"});
            //     return;     
            // });
        });
        console.log("sent interval");        
        socket.emit('status', total);        
    }, 1 * 1000);
});


http.listen(3010, function(){
  console.log('listening on *:3000');
});

// app.get('/', function(req, res, next) {

//     var total = {};
//     pool.getConnection(function(err,connection){
//         if (err) {
//           connection.release();
//           res.json({"code" : 100, "status" : "Error in connection database"});
//           return;
//         }   
//         console.log('connected as id ' + connection.threadId);

//         connection.query('select * from research_value; select * from research_value2',function(err,first){
//             connection.release();
//             if(!err) {
//                 total["temperature"] = first[0];
//                 total["power"] = first[1];
//                 res.render('index.jade', total);
//             }
//             console.log(err);
//         });
        
//         connection.on('error', function(err) {      
//               res.json({"code" : 100, "status" : "Error in connection database"});
//               return;     
//         });
//     });
// });

app.listen(3000);
