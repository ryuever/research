var sin = Math.sin,
    cos = Math.cos,
    pow = Math.pow,
    pi  = Math.PI;

var day_time = new Array();
for(var i=0.5; i<24; i=i+1){
    day_time.push(i);
}   

var solarAngle = function(lat, lgt, std_meridian, doy, G_sc){
    this.lat = typeof lat !== 'undefined' ? lat : 36.44;
    this.lgt = typeof lgt !== 'undefined' ? lgt : 136.59;    
    this.doy = typeof doy !== 'undefined' ? doy : 1;
    this.std_meridian = typeof std_meridian !== 'undefined' ? std_meridian : 9;
    // this.local_time  = typeof local_time !== 'undefined' ? local_time : 12;
    // this.altitude = typeof altitude !== 'undefined' ? altitude : 36.44;
    this.G_sc = typeof G_sc !== 'undefined' ? G_sc : 1367;
};

function deg2rad(degree){
    return degree * (pi/180);
}

function rad2deg(radian){
    return radian * (180/pi);
}
solarAngle.prototype.eq_time = function(doy){
    var rad = deg2rad(360 * (doy - 81) / 365);
    return 9.87 * sin(rad * 2) - 7.53 * cos(rad) - 1.5 * sin(rad);
};

solarAngle.prototype.sol_time = function(localtime, doy){
    var local_time = localtime;
    var std_meridian_degree = 15 * this.std_meridian;
    var solar_time = loc_time + this.eq_time(doy) / 60 + 4 * (this.lgt_deg - std_meridian_degree) / 60;
    return solar_time;
};

solarAngle.prototype.diff_std_sol_time = function(doy){
    var std_meridian_degree = 15 * this.std_meridian;
    return this.eq_time(doy) / 60 + 4 * (this.lgt_deg - std_meridian_degree) / 60;    
};

solarAngle.prototype.local_time = function(sol_time, doy){
    var std_meridian_degree = 15 * this.std_meridian;
    var solar_time = sol_time;
    var local_time = solar_time - this.eq_time(doy) / 60 - 4 * (this.lgt_deg - std_meridian_degree) / 60;
    return local_time;
};

solarAngle.prototype.declination = function(doy){
    return 23.45 * sin(deg2rad(360 * (doy - 81) / 365));    
};

solarAngle.prototype.zenith_cos = function(loc_time, doy){

    var hour_angle = deg2rad((loc_time - 12) * 15);
    var decl = deg2rad(this.declination(doy));
    var lat_rad = deg2rad(this.lat);

    var t = sin(decl) * sin(lat_rad) + cos(decl) * cos(lat_rad) * cos(hour_angle);
    // console.log('doy' + doy.toString() + " " + hour_angle.toString() + " " + decl.toString() + " " + decl.toString() + " " + t.toString() + " " + this.lat.toString());
    // console.log(sin(decl).toString() + " " + sin(lat_rad).toString());
    return t;
};

solarAngle.prototype.zenith_cos_daily = function(doy){
    var ze_cos_daily = new Array();
    var value = 0;
    for(var i=0; i<24; i++){
        value = this.zenith_cos(day_time[i], doy);
        ze_cos_daily.push(value);
    }
    return ze_cos_daily;
};

solarAngle.prototype.cal_diff_beam = function(rh, rainfall){
    ze_cos_daily = this.zenith_cos_daily(this.doy);
    if (rh <= 40){        
        ratio = 0.69;
    }else if (40 <rh <= 45){
        ratio = 0.67;
    }else if(45 < rh <= 55){
        ratio = 0.57;
    }else if(55 < rh <= 65){
        ratio = 0.47;
    }else if(65 < rh <= 75){
        ratio = 0.41;
    }else if(75 < rh <= 80){
        ratio = 0.3 / 3;
    }else{
        ratio = 0.2;
    }

    radiation = [];
    G_bh_list = [];
    G_dh_list = [];

    for(var i=6; i<18; i++){        
        am = 1 / ze_cos_daily[i];
        G_bh = 1367 * pow(ratio, am);
        G_dh = 0.3 * (1 - pow(ratio, am)) * 1367;
        
        if (rainfall > 0){
            G_bh = 1367 * pow(ratio, am) * ze_cos_daily[i] / 3;
            G_dh = 0.3 * (1 - pow(ratio, am)) * 1367 * ze_cos_daily[i] / 3;
        }else{
            G_bh = 1367 * pow(ratio, am);
            G_dh = 0.3 * (1 - pow(ratio, am)) * 1367;
        }
        radiation.push(parseFloat(((G_bh + G_dh) * 3600 / 10000).toFixed(2)));
    }

    return radiation;
};

