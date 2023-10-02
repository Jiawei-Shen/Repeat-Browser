<script>
    import * as d3 from 'd3';
    import {onMount, afterUpdate} from 'svelte';
    import Plotly from "plotly.js";
    import { Cart, genomeModal } from "../../stores/CartStore";
    import { createSession } from './createSession';
    import uuid from "uuid";
    import VirtualList from 'svelte-tiny-virtual-list';
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import {Text} from "@smui/list";
    import {repeat} from "./Chromosome.svelte";

    export let data
    let nodeRef;
    let AxisRange;
    let start = 0;
    let UUID;
    // let data = [{'start': 36310328, 'end': 36310479, 'RPKM': 2.236}];
    let div_width=800;
    let div_height=500;

    // set the dimensions and margins of the graph
    var margin = {top: 100, right: 30, bottom: 60, left: 100},
        width = div_width - margin.left - margin.right,
        height = div_height - margin.top - margin.bottom;

    onMount(() =>{
        UUID = uuid.v4();
        d3.select(nodeRef).selectAll().remove();
        // append the SVG object to the body of the page
        var SVG = d3.select(nodeRef)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 4e7])
            .range([0, width]);
        let axis_x = d3.axisBottom(x);
        axis_x.ticks(5);
        var xAxis = SVG.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(axis_x);
        // text label for the x axis
        SVG.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + 40) + ")")
            .style("text-anchor", "middle")
            .attr("font-family", "Saira")
            .text("Position");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 3])
            .range([ height, 0]);
        var yAxis = SVG.append("g")
            .call(d3.axisLeft(y));
        SVG.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left/2)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-family", "Saira")
            .text("RPKM");


        // Add a clipPath: everything out of this area won't be drawn.
        var clip = SVG.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = SVG.append('g')
            .attr("clip-path", "url(#clip)");

        // Add circles
        scatter
            .selectAll("genome")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.start); } )
            .attr("y", function (d) { return y(d.RPKM); } )
            .attr("width", function(d){return Math.max(5, x(d.end) - x(d.start))})
            .attr("height", 10)
            .style("fill", "#ff0000")
            .style("opacity", 0.5);

        // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
        var zoom = d3.zoom()
            .scaleExtent([.1, 100])  // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([[0, 0], [width, height]])
            .on("zoom", updateChart);

        // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
        SVG.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoom);
        // now the user can zoom and it will trigger the function called updateChart

        // A function that updates the chart when the user zoom and thus new boundaries are available
        function updateChart() {
            // recover the new scale
            var newX = d3.event.transform.rescaleX(x);
            var newY = d3.event.transform.rescaleY(y);
            console.log(newX);
            let newaxis_x = d3.axisBottom(newX);
            newaxis_x.ticks(5);
            // update axes with these new boundaries
            xAxis.call(newaxis_x)
            yAxis.call(d3.axisLeft(newY))

            // update circle position
            scatter
                .selectAll("rect")
                .attr('x', function(d) {return newX(d.start)})
                .attr('y', function(d) {return newY(d.RPKM)})
                .attr("width", function(d){ return Math.max(3,newX(d.end) - newX(d.start))})
                .attr("height", 10);
        }

        function changeRange() {
            console.log(parseInt(this.value));
            x = d3.scaleLinear()
                .domain([parseInt(this.value), parseInt(this.value) + 5000])
                .range([0, width]);
            axis_x = d3.axisBottom(x);
            axis_x.ticks(5);
            xAxis.call(axis_x)

            // update circle position
            scatter
                .selectAll("rect")
                .attr('x', function(d) {return x(d.start)})
                .attr('y', function(d) {return y(d.RPKM)})
                .attr("width", function(d){ return x(d.end) - x(d.start)})
                .attr("height", 10);
        }

        d3.select(AxisRange).on("input", changeRange)

        let testData = [];
        data.forEach(d => {
            let traceIndex = testData.findIndex(x => x.name == d.data);
            if (traceIndex != -1){
                testData[traceIndex].x.push(parseInt(d.start));
                testData[traceIndex].y.push(d.RPKM);
                testData[traceIndex].text.push(`${d.start} - ${d.end}`);
            } else {
                let trace = {
                    x: [parseInt(d.start)],
                    y: [d.RPKM],
                    mode: 'markers',
                    type: 'scatter',
                    name: d.data,
                    chr: d.chr,
                    opacity: 0.6,
                    text: [`${d.start} - ${d.end}`],
                    marker: { size: 8 }
                }
                testData.push(trace)
            }
        })
        console.log(testData, data);

        var myPlot = document.getElementById('myDiv');

        let layout = {
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            xaxis: {
                title: {
                    text: 'Chromosome'
                }
                // range: [0, 6]
            },
            yaxis: {
                title: {
                    text: 'RPKM'
                }
                // range: [0, 8]
            },
            title:`Genome View on Chromosome ${data[0].chr.replace('chr', '')}`
        };

        Plotly.newPlot('myDiv', testData, layout, {displaylogo: false});

        myPlot.on('plotly_click', async function(data){
            var pts = '';
            for(var i=0; i < data.points.length; i++){
                pts = 'x = '+data.points[i].x +'\ny = '+
                    data.points[i].y.toPrecision(4) + '\n\n';
            }
            let dataDetail = $Cart.data.filter(d => d.id == data.points[0].data.name).pop();

            let sessionInput = [{'key': data.points[0].data.chr, 'values':[{'RPKM': data.points[0].y,
                    'chr': data.points[0].data.chr, 'data': dataDetail, 'end': data.points[0].text.split(' - ')[1],
                    'start': data.points[0].text.split(' - ')[0]}]}]

            console.log(data.points[0], sessionInput);
            let sessionFile = createSession(sessionInput, 1, repeat, UUID);
            alert("Jumping to the WashU Epigenome Browser!");

            // const form = new FormData();
            // form.append("_id", `${UUID}`);
            // form.append("hub", {"content": [1,2]});
            let form = {
                "_id": `${UUID}`,
                "hub": {
                    "content": JSON.parse(sessionFile)
                }
            }
            let jsonForm = JSON.stringify(form)
            // console.log(form);
            const url_submit="https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/";
            await fetch(url_submit, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: jsonForm,
            }).then(()=>{
                window.open(`http://epigenomegateway.wustl.edu/browser/?genome=hg38&hub=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${UUID}`, '_blank').focus()
            })
        });
    })


</script>

<style>
    .range-input
    {
        padding-right: 20px;
        margin-top: 10px;
        margin-left: 10%;
    }
</style>

<!--<div>-->
<!--    <svg bind:this="{nodeRef}" width={div_width} height={div_height}></svg>-->
<!--</div>-->

<!--<div class=range-input>-->
<!--    <p style="display: inline; font-family: Saira"> Input the start of the X-axis: </p> 	<input bind:this="{AxisRange}" bind:value={start} min=0 max=1e9>-->
<!--</div>-->

<div id='myDiv'></div>
