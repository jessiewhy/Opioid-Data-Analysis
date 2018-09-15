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
var idGradient = "legendGradient";
var x1 = 200,
    y1 = 150,
    barWidth = 25,
    barHeight = 100,
    numberHues = 35;

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
var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
        
// Append Div for tooltip to SVG
var div = d3.select("body")
  .append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var legend = d3.select("body").append("svg")
                .attr("class", "legend")
              .attr("width", 140)
              .attr("height", 200);

legend.append("defs")
  .append("linearGradient")
    .attr("id",idGradient)
    .attr("x1","0%")
    .attr("x2","0%")
    .attr("y1","0%")
    .attr("y2","100%");

legend.append("rect")
  .attr("fill","url(#" + idGradient + ")")
  .attr("x",0)
  .attr("y",0)
  .attr("width",barWidth)
  .attr("height",barHeight)
  .attr("rx",10)  //rounded corners, of course!
  .attr("ry",10);

var textY = y1 + barHeight/2 + 15;
legend.append("text")
  .attr("class","legendText")
  .attr("text-anchor", "middle")
  .attr("x",0)
  .attr("y",0)
  .attr("dy",0)
  .text("0");
legend.append("text")
  .attr("class","legendText")
  .attr("text-anchor", "left")
  .attr("x",x1 + barHeight + 15)
  .attr("y",textY)
  .attr("dy",0)
  .text(numberHues + "+");


var g = svg.append("g");
var hueStart = 100, hueEnd = 0;
var opacityStart = 0.3, opacityEnd = 1.0;
var theHue, rgbString, opacity,p;

var deltaPercent = 1/(numberHues-1);
var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

//kind of out of order, but set up the data here 
var theData = [];
for (var i=0;i < numberHues;i++) {
    theHue = hueStart + deltaHue*i;
    //the second parameter, set to 1 here, is the saturation
    // the third parameter is "lightness"    
    rgbString = d3.hsl(theHue,1,0.6).toString();
    opacity = opacityStart + deltaOpacity*i;
    p = 0 + deltaPercent*i;
    //onsole.log("i, values: " + i + ", " + rgbString + ", " + opacity + ", " + p);
    theData.push({"rgb":rgbString, "opacity":opacity, "percent":p});       
}

//now the d3 magic (imo) ...
var stops = d3.select('#' + idGradient).selectAll('stop')
                    .data(theData);
                    
    stops.enter().append('stop');
    stops.attr('offset',function(d) {
                            return d.percent;
  })
  .attr('stop-color',function(d) {
              return d.rgb;
  })
  .attr('stop-opacity',function(d) {
              return d.opacity;
  });
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
        });

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