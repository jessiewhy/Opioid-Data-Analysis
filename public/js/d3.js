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
    numberHues = 2000;

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
var svg = d3.select(".prescriptions")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

svg.append("defs")
  .append("linearGradient")
    .attr("id",idGradient)
    .attr("x1","0%")
    .attr("x2","0%")
    .attr("y1","0%")
    .attr("y2","100%");

svg.append("rect")
  .attr("fill","url(#" + idGradient + ")")
  .attr("x",830)
  .attr("y",250)
  .attr("width",barWidth)
  .attr("height",barHeight)
  .attr("rx",10)  //rounded corners, of course!
  .attr("ry",10);

var textY = y1 + barHeight/2 + 15;
svg.append("text")
  .attr("class","legendText")
  .attr("text-anchor", "middle")
  .attr("x",842.5)
  .attr("y",245)
  .text("0");
svg.append("text")
  .attr("class","legendText")
  .attr("text-anchor", "middle")
  .attr("x", 842.5)
  .attr("y",barHeight+265)
  .text(numberHues);
svg.append("text")
  .attr("class", "legendText")
  .attr("text-anchor", "right")
  .attr("x", 860)
  .attr("y", 285)
  .text("# of Prescriptions");
svg.append("text")
  .attr("class", "legendText")
  .attr("text-anchor", "right")
  .attr("x", 860)
  .attr("y", 300)
  .text("(hundreds)");

var g = svg.append("g");
var hueStart = 50, hueEnd = 0;
var opacityStart = 0.3, opacityEnd = 1.0;
var theHue, rgbString, opacity,p;

var deltaPercent = 1/(numberHues-1);
var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

var theData = [];
var legendColors = [];
for (var i=0;i < numberHues;i++) {
    theHue = hueStart + deltaHue*i;
    //the second parameter, set to 1 here, is the saturation
    // the third parameter is "lightness"    
    rgbString = d3.hsl(theHue,1,0.4).toString();
    legendColors.push(rgbString);
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
d3.csv("/resources/stateOpioids.csv", function(data) {
  color.domain([0,1,2,3]);
  d3.json("/resources/us-states.json", function(json) {
    for (var i = 0; i < data.length; i++) {
      var dataState = data[i].state;
      var dataValue = data[i].prescribs;
      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++)  {
          var jsonState = json.features[j].properties.name;
          if (dataState == jsonState) {
            json.features[j].properties.prescribs = Math.floor(dataValue/100); 
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
          var value = d.properties.prescribs;
          console.log(value)
          if (value) {
            return legendColors[value];
          }
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