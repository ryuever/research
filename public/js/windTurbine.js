var log = Math.log,
    pow = Math.pow,
    pi = Math.PI;

var windTurbine = function(module, diameter, cut_in_ws, cut_out_ws, cp_max,
                           ws_maxcp, cp_rated, ws_rated,turbine_height,
                           ref_height){
    this.module = typeof module !== 'undefined' ? module : "small";
    
    if (module == "smart"){
        this.diameter = typeof diameter !== 'undefined' ? diameter : 4.4;
        this.cut_in_ws = typeof cut_in_ws !== 'undefined' ? cut_in_ws : 2.5;
        this.cut_out_ws = typeof cut_out_ws !== 'undefined' ? cut_out_ws : 15;
        this.cp_max = typeof cp_max !== 'undefined' ? cp_max : 0.478;
        this.ws_maxcp = typeof ws_maxcp !== 'undefined' ? ws_maxcp : 6;
        this.cp_rated = typeof cp_rated !== 'undefined' ? cp_rated : 0.188;
        this.ws_rated = typeof ws_rated !== 'undefined' ? ws_rated : 13;
        this.turbine_height = typeof turbine_height !== 'undefined' ? turbine_height : 10;
        this.ref_height = typeof ref_height !== 'undefined' ? ref_height : 4;
    }else{
        this.diameter = typeof diameter !== 'undefined' ? diameter : 4.4;
        this.cut_in_ws = typeof cut_in_ws !== 'undefined' ? cut_in_ws : 2.5;
        this.cut_out_ws = typeof cut_out_ws !== 'undefined' ? cut_out_ws : 15;
        this.cp_max = typeof cp_max !== 'undefined' ? cp_max : 0.478;
        this.ws_maxcp = typeof ws_maxcp !== 'undefined' ? ws_maxcp : 6;
        this.cp_rated = typeof cp_rated !== 'undefined' ? cp_rated : 0.188;
        this.ws_rated = typeof ws_rated !== 'undefined' ? ws_rated : 13;
        this.turbine_height = typeof turbine_height !== 'undefined' ? turbine_height : 10;
        this.ref_height = typeof ref_height !== 'undefined' ? ref_height : 4;
    }
};

windTurbine.prototype.ws_adj = function(ws){
    var roughness_l = 0.055;
    var wsadj = ws * log(this.turbine_height / roughness_l) / log(this.ref_height / roughness_l);
    return wsadj;   
};

windTurbine.prototype.cal_cp = function(ws){
    var cp = 0;
    wsadj = this.ws_adj(ws);
    if (this.module == "small"){
        if (1.5 < wsadj < 2.5){
            wsadj = ws + 1.2;
            var m00 = pow((this.ws_maxcp/this.cut_in_ws - 1), 2);
            var m01 = pow((this.ws_maxcp/this.cut_in_ws - 1), 3);
            var m02 = 1;
            
            var m10 = pow((this.ws_maxcp / this.ws_rated - 1), 2);
            var m11 = pow((this.ws_maxcp / this.ws_rated - 1), 3);
            var m12 = 1 - this.cp_rated / this.cp_max;
            var detcp = m00 * m11 - m01*m10;
            var F = (m02 * m11 - m01 * m12) / detcp;
            var G = (m00 * m12 - m02 * m10) / detcp;
            cp = this.cp_max * (1 - F * pow((this.ws_maxcp / wsadj - 1), 2) - G * pow((this.ws_maxcp / wsadj - 1), 3));

        }else if (2.5 <= wsadj < 4){        
            cp = -0.138 * wsadj + 1.325;
        }else if (4 <= wsadj < 6){
            cp = -0.142 * wsadj + 1.342;
        }else if (6 <= wsadj < 9){
            cp = -0.069 * wsadj + 0.904;
        }else if (9 <= wsadj < this.ws_rated){
            cp = -0.024 * wsadj + 0.499;
        }else if (this.ws_rated <= wsadj < this.cut_out_ws){
            cp = this.cp_rated * pow(this.ws_rated,3) / pow(wsadj,3);
        }else{
            cp = 0;
        }}else{
            if (wsadj <= this.cut_in_ws){            
                cp = 0;
            }else if (wsadj > this.cut_out_ws){            
                cp = 0;
            }else if (wsadj > this.ws_rated){            
                cp = this.cp_rated * pow(this.ws_rated,3) / pow(wsadj,3);
            }else{
                var m00 = pow((this.ws_maxcp/this.cut_in_ws - 1), 2);
                var m01 = pow((this.ws_maxcp/this.cut_in_ws - 1), 3);
                var m02 = 1;

                var m10 = pow((this.ws_maxcp / this.ws_rated - 1), 2);
                var m11 = pow((this.ws_maxcp / this.ws_rated - 1), 3);
                var m12 = 1 - this.cp_rated / this.cp_max;
                var detcp = m00 * m11 - m01*m10;
                var F = (m02 * m11 - m01 * m12) / detcp;
                var G = (m00 * m12 - m02 * m10) / detcp;
                cp = this.cp_max * (1 - F * pow((this.ws_maxcp / wsadj - 1), 2) - G * pow((this.ws_maxcp / wsadj - 1), 3));
            }
        }    
    return cp;
};

windTurbine.prototype.cal_available_power = function(ws){
    var cp = this.cal_cp(ws);

    var available_pow = 0;

    wsadj = this.ws_adj(ws);

    console.log("wind speed " + wsadj.toString() + ws.toString());
    if (this.module == "small"){
        if (1.5 < wsadj < 2.5){
            console.log("hello 1");            
            available_pow = 1/2 * pow(wsadj + 1.2, 3) * 1.2754 * pi * pow(this.diameter / 2 , 2);
        } else{
            console.log("hello 2");
            available_pow = 1/2 * pow(wsadj, 3) * 1.2754 * pi * pow(this.diameter / 2 , 2);
        }
    }else{
        console.log("hello 3");
        available_pow = 1/2 * pow(wsadj, 3) * 1.225 * pi * pow(this.diameter / 2 , 2);
    }
    p = available_pow * Math.abs(cp);

    console.log(cp.toString() + " " + p.toString());
    return p;
};
