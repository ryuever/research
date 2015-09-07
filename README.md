# Real-time simulation of Solar PV and Wind Turbine -- Node.js, Express, Ajax, Google Map API
===========================================
Simulation is deployed on AWS EC2 cloud server and supported by Node.js. It is fatured with Google map API which is used to provide the location information with more convenient way.Moreover, in order to present the powerful ability on data visulization of Google map API, two applications called "travel" and "heatmap" are provided as well.

## simulation / home
It consists of three parts : real-time simulation of solar PV, real-time simulation of wind turbine and simulation of solar radiation. For every module, it will consider the climated data which could be iHouse system. However, the simulation of solar PV and wind turbine, the manufacture specification will be token account as well...The applied factore is present on the right side of each simulation graph.

One thing to note, The present of __Google map__ is to provide a convenient way to select location. Because the simuation of solar radiation is based on the solar position, and it could be affected by the observed location.

####Socket.io or Ajax
In this simulation, the usage of Socket.io or Ajax is concerned about on the implementation of __start / terminate__ button's functionality. So the choice will be __NON-persistent connection__ and __AJAX__. However, According to [A Node.js speed dilemma: AJAX or Socket.IO? | CUBRID Blog](http://www.cubrid.org/blog/cubrid-appstools/nodejs-speed-dilemma-ajax-or-socket-io/), when using Socket.IO non-persistent connections, the performance numbers are significantly worse than __Ajax__. Therefore, in the recent version _socket.io_ is already replaced by _Ajax_.
![alt tag](https://cloud.githubusercontent.com/assets/2316727/9667806/050d0032-52b9-11e5-9b8c-f86666470ddd.png)

## Travel
It is usage of drawing polyline on Google map on recent. If the departure and destination location is provided, clicking the "start simulation" button it will draw a __polyline__ line on Google map which is featured with a arrow to indicate the direction. 

It also support multiple travelling items input. The simulation will sort the items by date first, and then calculate the coordination of each location. Finally drawing a polyline to connect each node with arrow to identify direction.

It provide the following functionalities:

 1. __Arbitrary time event input__ : It means the latter time event should not be latter than the previous item. What you have to do is to input the departure location, destination location and choose time. Time event sort will be done automatically.
 2. __Independent time event__ : For one time event, the departure and destination location is not affected by other items.
 3. __Direction indicated result__ : Once the "start simulation" button is clicked, the polyline will be featured with a animated arrow which is used to indicate the direction of the time event(travel)
 4. __ordered simulation result__ : For each polyline between two nodes, a __infowindow__ will be present on the the departure location with a value to indicate the order number of the time event.
 
 ![alt tag](https://cloud.githubusercontent.com/assets/2316727/9667850/3d0366fc-52b9-11e5-94a7-ee57a225c041.png)
## heatmap
__heatmap__ layer is used to present large amounts of data on a map. In this application, it is applied to animate the opening of solar panel selling store during 2004-2008.  Howerer, the data is imaginary and in Jason format.
![alt tag](https://cloud.githubusercontent.com/assets/2316727/9719594/9ff2f6ba-55c0-11e5-8a3f-ab02e6b91873.png)

## Navi
This application is the usage of direction service of Google map API v3. If it is provided with a __"From ...."__ location, a __"To ..."__ location and __speed__, the application will present a real-time simulation of road direction with __"step information"__, __"running distance"__, __"elapsed time"__ and __"remaining time"__ to the destination.

![alt tag](https://cloud.githubusercontent.com/assets/2316727/9719603/d376ad2e-55c0-11e5-82c0-70de5d3866c7.png)