function responsivefy(svg) {
    var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    aspect = width / height;

    svg.attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMid")
    .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);

    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));

        if (targetWidth < 1000) {
            svg.attr("transform", "translate(0, 350) rotate(90)")
        }
    }
}

var margin = {top: 30, right: 30, bottom: 30, left: 100},
width = 1500 - margin.left - margin.right,
height = 350 - margin.top - margin.bottom;

// bind svg to div and create group element for the content
var svg = d3.select('#heatmap')
    .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(responsivefy)
        // .attr("transform", "rotate(90)")
    .append("g")
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");

svg.append("g")
    .attr("id", "content");

// scale creator
var makeScale = function(range) {
    return d3.scaleBand()
        .range(range)
        .padding(0.05);
}

// axis content
var datum = ["24 februari", "25 februari", "26 februari", "27 februari", "28 februari", "29 februari", "1 maart", "2 maart", "3 maart", "4 maart", "5 maart", "6 maart", "7 maart", "8 maart", "9 maart", "10 maart", "11 maart", "12 maart", "13 maart", "14 maart", "15 maart", "16 maart", "17 maart", "18 maart", "19 maart", "20 maart", "21 maart", "22 maart", "23 maart", "24 maart", "25 maart", "26 maart", "27 maart", "28 maart", "29 maart", "30 maart", "31 maart", "1 april", "2 april", "3 april", "4 april", "5 april", "6 april", "7 april", "8 april", "9 april", "10 april", "11 april", "12 april"]
var datum_night = ["23 februari", "24 februari", "25 februari", "26 februari", "27 februari", "28 februari", "29 februari", "1 maart", "2 maart", "3 maart", "4 maart", "5 maart", "6 maart", "7 maart", "8 maart", "9 maart", "10 maart", "11 maart", "12 maart", "13 maart", "14 maart", "15 maart", "16 maart", "17 maart", "18 maart", "19 maart", "20 maart", "21 maart", "22 maart", "23 maart", "24 maart", "25 maart", "26 maart", "27 maart", "28 maart", "29 maart", "30 maart", "31 maart", "1 april", "2 april", "3 april", "4 april", "5 april", "6 april", "7 april", "8 april", "9 april", "10 april", "11 april"]
var meetstation = ["Rotselaar", "Koningslo", "Grimbergen", "Diegem", "Erps-Kwerps", "Tervuren", "Meise", "Wezembeek-Oppem", "Sterrebeek", "Bertem"]

// create scales and axes
var scaleX = makeScale([0, width]);
var scaleY = makeScale([height, 0]);

var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
var yAxis = svg.append("g")

// create tooltip
var tooltip = d3.select("#heatmap")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0)
.attr("class", "tooltip");    
            
// function to create the data
    function update(variabele, kleur) {
        d3.csv("noise_all.csv")
        .then(function(data) {
            // create scale color
            var scaleColor = d3.scaleLinear()
                .domain(d3.extent(data, d => d[variabele]))
                .range(["#ffecef", kleur]);

            // instantiate axes
            if (variabele == 'meting_day') {
                scaleX.domain(datum);
                xAxis.transition()
                .duration(1000)
                .call(d3.axisBottom(scaleX)
                .tickValues(["24 februari", "29 februari", "6 maart", "12 maart", "18 maart", "24 maart", "31 maart", "6 april", "12 april"])
                .tickSizeOuter(0));
            }

            else {
                scaleX.domain(datum_night);
                xAxis.transition()
                .duration(1000)
                .call(d3.axisBottom(scaleX)
                .tickValues(["23 februari", "28 februari", "5 maart", "11 maart", "18 maart", "24 maart", "30 maart", "5 april", "11 april"])
                .tickSizeOuter(0));
            }

            scaleY.domain(meetstation);
            yAxis.call(d3.axisLeft(scaleY)
                .tickSizeOuter(0));

            // bind data to the elements
            var u = svg.select("#content")
                .selectAll("rect")
                .data(data);

            // create new elements and merge, create tooltip actions
            u = u.enter().append("rect")
                .attr("width", scaleX.bandwidth())
                .attr("height", scaleY.bandwidth())
                .attr("x", d => scaleX(d["datum"]))
                .attr("y", d => scaleY(d["meetstation"]))
                .merge(u);

                // create tooltip actions
                u.on("mouseover", function(d) {
                    d3.select(this).style("stroke", "black")
                                    .style("stroke-width", "2px")
                                    .style("stroke-opacity", 1);

                    var plane = d[variabele] == 1 ? " vliegtuig" : " vliegtuigen"
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(d[variabele] + plane)
                        .style("left", d3.event.pageX + "px")
                        .style("top", (d3.event.pageY - 50) + "px");})
                .on("mouseout", function(d) {
                    d3.select(this).style("stroke-opacity", 0);

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                })

                // update elements with new data
                u.transition()
                .duration(500)
                .style("fill", d => scaleColor(d[variabele]))
        });
    }

    // initialize graph
    update("meting_day", '#FF4262');

