use research;

CREATE TABLE if not exists device_value(
       gateway_id varchar(64) default NULL,
       device_id varchar(64) default NULL,
       property varchar(64) default NULL,
       get_date DATETIME default NULL,
       value varchar(512),

       PRIMARY KEY(gateway_id, device_id, property, get_date)
);

LOAD DATA LOCAL INFILE '/Users/ryu/Documents/git/simple/research/20150426_temperature.csv' INTO TABLE device_value
                FIELDS TERMINATED BY ',';

LOAD DATA LOCAL INFILE '/Users/ryu/Documents/git/simple/research/20150426_wind.csv' INTO TABLE device_value
                FIELDS TERMINATED BY ',';
                
LOAD DATA LOCAL INFILE '/Users/ryu/Documents/git/simple/research/20150426_radiation.csv' INTO TABLE device_value
                FIELDS TERMINATED BY ',';

