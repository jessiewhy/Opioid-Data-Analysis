var bar = d3.select('.opioidovertime')

d3.csv("/resources/maleopioid.csv", function(male) {
	d3.csv("/resources/femaleopioids.csv", function(female){
		for (i = 0; i < male.length; i++) {
			setInterval(display(male[i]), 11100000000000);
		}
	})
});

function display(raw) {
	var count = 0
	var data = []
		
	for (var key in raw) {
		if (count !== 0) {
			data.push(Math.floor(raw[key]/1000));
		}
		count += 1
	}
	var x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 10]);

	console.log(data)
	bar.selectAll("div")
		.data(data)
	.enter().append("div")
	.style("width", function(d) { return x(d) + "px"; })
}