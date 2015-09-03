var express = require("express");
var app     = express();
var http    = require('http').Server(app);
// var io      = require('socket.io')(http);
var path    = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
        
var routes = require('./routes/index');
app.use('/', routes);

app.use('/haha', routes);

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

http.listen(3000, function(){
  console.log('listening on *:3000');
});
