var solarAngle = function(lat, lgt, std_meridian, doy, altitude, G_sc){
    this.lat = typeof lat !== 'undefined' ? lat : 36.44;
    this.lgt = typeof lgt !== 'undefined' ? lgt : 136.59;    
    this.doy = typeof doy !== 'undefined' ? doy : 0;
    this.std_meridian = typeof std_meridian !== 'undefined' ? std_meridian : 9;
    this.local_time  = typeof local_time !== 'undefined' ? local_time : 12;
    this.altitude = typeof altitude !== 'undefined' ? altitude : 36.44;
    this.G_sc = typeof G_sc !== 'undefined' ? G_sc : 1367;
};

function deg2rad(degree){
    return degree * (Math.PI/180);
}

function rad2deg(radian){
    return radian * (180/Math.PI);
}
solarAngle.prototype.eq_time = function(doy){
    var rad = deg2rad(360 * (doy - 81) / 365);
    return 9.87 * Math.sin(rad * 2) - 7.53 * Math.cos(rad) - 1.5 * Math.sin(rad);
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
  









var test1 = new solarAngle();
console.log(test1.equation_time(100));
