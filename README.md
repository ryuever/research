# Real-time simulation of Solar PV and Wind Turbine 
===========================================
Simulation is deployed on AWS EC2 cloud server and supported by Node.js. It is fatured with Google map API which is used to provide the location information with more convenient way.Moreover, in order to present the powerful ability on data visulization of Google map API, two applications called "travel" and "heatmap" are provided as well.

## simulation / home
It consists of three parts : real-time simulation of solar PV, real-time simulation of wind turbine and simulation of solar radiation. For every module, it will consider the climated data which could be iHouse system. However, the simulation of solar PV and wind turbine, the manufacture specification will be token account as well...The applied factore is present on the right side of each simulation graph.

One thing to note, The present of __Google map__ is to provide a convenient way to select location. Because the simuation of solar radiation is based on the solar position, and it could be affected by the observed location.

## Travel
It is usage of drawing polyline on Google map on recent. If the departure and destination location is provided, clicking the "start simulation" button it will draw a __polyline__ line on Google map which is featured with a arrow to indicate the direction. 

It also support multiple travelling items input. The simulation will sort the items by date first, and then calculate the coordination of each location. Finally drawing a polyline to connect each node with arrow to identify direction.

## heatmap
__heatmap__ layer is used to present large amounts of data on a map. In this application, it is applied to animate the opening of solar panel selling store during 2004-2008.  Howerer, the data is imaginary and in Jason format.

