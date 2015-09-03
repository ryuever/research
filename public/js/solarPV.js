var month_days = [[0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
                  [0, 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ]];
function c2f(c_temp){
    // Purpose : Convert Celsius to Fahrenheit
    return c_temp * 9 / 5 + 32;
}

document.getElementById("V_max").defaultValue = 43.4;
document.getElementById("Voc_max").defaultValue = 53;
document.getElementById("Voc_temp_coeff").defaultValue = -0.147;
document.getElementById("module_Tcoeff").defaultValue = -0.336;
document.getElementById("module_acoeff").defaultValue = -2.81;
document.getElementById("module_bcoeff").defaultValue = -0.0455;
document.getElementById("module_dTcoeff").defaultValue = 0.0;
document.getElementById("soiling_factor").defaultValue = 0.95;
document.getElementById("solar_efficiency").defaultValue = 0.2;
document.getElementById("size").defaultValue = 12.8;
document.getElementById("derating_factor").defaultValue = 0.95;

function md2doy(year, month, day){
    if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0 ))
        leap = 1;
    else
        leap = 0;

    selected_month_days = month_days[leap];
    doy = selected_month_days[month] + day;
    return doy;
}

var solarPV = function(){

    this.V_max = parseFloat(document.getElementById("V_max").value);
    this.Voc_max = parseFloat(document.getElementById("Voc_max").value);
    this.Voc_temp_coeff = parseFloat(document.getElementById("Voc_temp_coeff").value);
    this.module_Tcoeff = parseFloat(document.getElementById("module_Tcoeff").value);
    this.module_acoeff = parseFloat(document.getElementById("module_acoeff").value);
    this.module_bcoeff = parseFloat(document.getElementById("module_bcoeff").value);
    this.module_dTcoeff = parseFloat(document.getElementById("module_dTcoeff").value);
    this.soiling_factor = parseFloat(document.getElementById("soiling_factor").value);
    this.efficiency_factor = parseFloat(document.getElementById("solar_efficiency").value);
    this.size = parseFloat(document.getElementById("size").value);
    this.derating_factor = parseFloat(document.getElementById("derating_factor").value);
    
    if (this.soiling_factor <= 0 || this.soiling_factor > 1.0 ){
        this.soiling_factor = 0.95;
        console.log("Invalid soiling factor specified, defaulting to 95%");
    }
    
    if (this.derating_factor <= 0 || this.derating_factor > 1.0){
        this.derating_factor = 0.95;
        console.log("Invalid derating factor specified, defaulting to 95%");
    }
};

solarPV.prototype.generatedPower = function(temp,wind,power){
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
    // this.efficiency = 0.2;
    var P_Out = insolwmsq * this.derating_factor * this.size * this.efficiency_factor * tempcorr;

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
