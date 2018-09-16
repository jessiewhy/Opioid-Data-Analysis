/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
    
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */

    
//Width and height of map
var width = 960;
var height = 500;
var active = d3.select(null);
// D3 Projection
var projection = d3.geo.albersUsa()
           .translate([width/2, height/2])    // translate to center of screen
           .scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
         .projection(projection);  // tell path generator to use albersUsa projection

    
// Define linear scale for output
var color = d3.scale.linear()
        .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

//Create SVG element and append map to the SVG
var svg = d3.select(".map")
      .append("svg")
      .attr("width", width)
      .attr("height", height)        
      .style("display", "block")
      .style("margin", "auto");
        
// Append Div for tooltip to SVG
var div = d3.select(".map")
        .append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0)               
        .style("display", "block");

var g = svg.append("g");

// Load in my states data!
d3.csv("/resources/stateslived.csv", function(data) {
  color.domain([0,1,2,3]);
  d3.json("/resources/us-states.json", function(json) {
    for (var i = 0; i < data.length; i++) {
      var dataState = data[i].state;
      var dataValue = data[i].visited;
      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++)  {
          var jsonState = json.features[j].properties.name;
          if (dataState == jsonState) {
            json.features[j].properties.visited = dataValue; 
            break;
          }
        }
    }
    // Bind the data to the SVG and create one path per GeoJSON feature
    g.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .on("click", clicked)
       .attr("class", "feature")
       .style("fill", function(d) {
          var value = d.properties.visited;
          if (value) {
            return color(value);
          }
        })
;  
    d3.csv("resources/cities-lived.csv", function(data) {
      g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        .attr("r", function(d) {
          return Math.sqrt(d.years) * 4;
        })
          .style("fill", "rgb(217,91,67)")  
          .style("opacity", 0.85) 
        // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
        // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
        .on("mouseover", function(d) {      
            div.transition()        
                 .duration(200)      
                 .style("opacity", .9);      
                 div.text(d.place)
                 .style("left", (d3.event.pageX) + "px")     
                 .style("top", (d3.event.pageY - 28) + "px");    
        })   
        // fade out tooltip on mouse out               
        .on("mouseout", function(d) {       
            div.transition()        
               .duration(500)      
               .style("opacity", 0);   
        });
    });
    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
    var legend = d3.select("body").append("svg")
                .attr("class", "legend")
              .attr("width", 140)
              .attr("height", 200)
              .selectAll("g")
              .data(color.domain().slice().reverse())
              .enter()
              .append("g")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .data(legendText)
              .attr("x", 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .text(function(d) { return d; });
  });
});

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);
  console.log(path.bounds(d));
  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  g.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");
}