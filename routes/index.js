var express   = require('express');
var router    = express.Router();
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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'real-time simulation' });
});

router.get('/haha', function(req, res) {
    
    var prev_time = req.query['previous'];
    var latter_time = req.query['latter'];
    var total = {};
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }   
        console.log('connected as id ' + connection.threadId);
        
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
                console.log(total);
                res.json({"data": total});
            }
        });
    });
});

module.exports = router;
