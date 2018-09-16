(async function() {
    d3.csv('/resources/total_opioids_prescribed_by_profession.csv', (data) => {

        var w = 400;
        var h = 400;
        var r = h / 2;
        var cssHSL = () => "hsl(" + (30 + 360 * Math.random()) + ',' +
            (25 + 70 * Math.random()) + '%,' +
            (85 + 10 * Math.random()) + '%)';
        data = data.filter(e => {
            return e["Opioid.Prescriber"] > 100;
        });
        data.forEach(e => {
            e["label"] = e["Specialty"];
            e["value"] = e["Opioid.Prescriber"];
        });

        var vis = d3.select('.pie').append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");

        var pie = d3.layout.pie().value(function(d) { return d.value; });

        // Declare an arc generator function
        var arc = d3.svg.arc().outerRadius(r);

        // Select paths, use arc generator to draw
        var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
        arcs.append("svg:path")
            .attr("fill", function(d, i) { return cssHSL(); })
            .attr("d", function(d) { return arc(d); });

        // Add the text
        arcs.append("svg:text")
            .attr("transform", function(d) {
                d.innerRadius = 100; /* Distance of label to the center*/
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d, i) { return d.value > 250 ? d.value : ""; });

        var txt = d3.select('.pie').append('text').text("Mouse over to view specialty");
        arcs.on('mouseover', (d, i) => {
            d3.select('svg>text').text(() => d.data.Specialty);
        }).on('mouseout', (d, i) => {
            d3.select('svg>text').text(() => "Mouse over to view specialty");
        });
    });
})();