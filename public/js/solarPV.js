var month_days = [[0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
                  [0, 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ]];
function c2f(c_temp){
    // Purpose : Convert Celsius to Fahrenheit
    return c_temp * 9 / 5 + 32;
}

function md2doy(year, month, day){
    if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0 ))
        leap = 1;
    else
        leap = 0;

    selected_month_days = month_days[leap];
    doy = selected_month_days[month] + day;
    return doy;
}

var solarPV = function(V_max, Voc_max, Voc_temp_coeff, module_Tcoeff,
                       module_acoeff, module_bcoeff, module_dTcoeff,
                       soiling_factor, derating_factor, efficiency,
                       Pmax_temp_coeff, size, panel_type_v){    
    this.V_max = typeof V_max !== 'undefined' ? V_max : 43.4;
    this.Voc_max = typeof Voc_max !== 'undefined' ? Voc_max : 53;
    this.Voc_temp_coeff = typeof Voc_temp_coeff !== 'undefined' ? Voc_temp_coeff : -0.147;
    this.module_Tcoeff = typeof module_Tcoeff !== 'undefined' ? module_Tcoeff : -0.336;
    this.module_acoeff = typeof module_acoeff !== 'undefined' ? module_acoeff : -2.81;
    this.module_bcoeff = typeof module_bcoeff !== 'undefined' ? module_bcoeff : -0.0455;
    this.module_dTcoeff = typeof module_dTcoeff !== 'undefined' ? module_dTcoeff : 0.0;
    this.soiling_factor = typeof soiling_factor !== 'undefined' ? soiling_factor : 0;
    this.derating_factor = typeof derating_factor !== 'undefined' ? derating_factor : 0;
    this.efficiency = typeof efficiency !== 'undefined' ? efficiency : 0;
    this.Pmax_temp_coeff = typeof Pmax_temp_coeff !== 'undefined' ? Pmax_temp_coeff : 0;
    this.size = typeof size !== 'undefined' ? size : 1.5;
    this.panel_type_v = typeof panel_type_v !== 'undefined' ? panel_type_v : "single_crystal_silicon";    

    if (soiling_factor <= 0 || soiling_factor > 1.0 || typeof soiling_factor == 'undefined'){
        this.soiling_factor = 0.95;
        console.log("Invalid soiling factor specified, defaulting to 95%");
    }else{
        this.soiling_factor = soiling_factor;
    }

    if (derating_factor <= 0 || derating_factor > 1.0 || typeof derating_factor == 'undefined'){
        this.derating_factor = 0.95;
        console.log("Invalid derating factor specified, defaulting to 95%");
    }else{
        this.derating_factor = derating_factor;
    }
};

solarPV.prototype.generatedPower = function(temp,wind,power){
    // var year = timestamp.getFullYear();
    // var month = timestamp.getMonth();
    // var day = timestamp.getDay();
    // doy = md2doy(year, month, day);

    var Tambient = temp;
    var insolwmsq = 0.95 * power;
    var windspeed = wind;
    var a = this.module_acoeff;
    var b = this.module_bcoeff;

    var Tback = (insolwmsq * Math.exp(a + b * windspeed)) + Tambient;
    var Tcell = Tback + insolwmsq/1000.0 * this.module_dTcoeff;
    // Conversion from Celsius to Fahrenheit
    var Tmodule = c2f(Tback);
    var tempcorr = 1.0 + this.module_Tcoeff * (Tcell - 25.0)/100;
    var efficiency = 0.2;          

    var P_Out = insolwmsq * this.derating_factor * 12.8 * efficiency * tempcorr;

    var VA_Out = P_Out;
    var Voc = this.Voc_max * (1 + this.Voc_temp_coeff * (Tmodule - 77) / 100);
    var V_Out = this.V_max * (Voc/this.Voc_max);

    var p_dco = 2700;
    var v_dco = 380;
    var p_so = 20.7;
    
    var c_o = 0;
    var c_1 = 0;
    var c_2 = 0;
    var c_3 = 0;

    var p_max = 2500;

    var C1 = p_dco*(1+c_1*(V_Out-v_dco));
    var C2 = p_so*(1+c_2*(V_Out-v_dco));
    var C3 = c_o*(1+c_3*(V_Out-v_dco));
    var ac = ((p_max/(C1-C2))-C3*(C1-C2))*(P_Out-C2)+C3*(P_Out-C2)*(P_Out-C2);

    return ac;
};
