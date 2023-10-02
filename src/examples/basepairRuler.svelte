<script>
    import {onMount} from "svelte";
    import * as d3 from 'd3';
    import { createEventDispatcher } from 'svelte';

    // export let inputRange;
    // export let inputData;
    let fastqInput = Array.from({length: 800}, () => Math.floor(Math.random() * 4));
    let selectedRange = [100, 160];
    // Todo: export ruler range(origin), export selected range, import fastq file

    const dispatch = createEventDispatcher();

    function getRange(r) {
        dispatch('range', {
            range: r
        });
    }

    function basepairColor(i) {
        switch (i){
            case 0: return "#3899C7"; //G
            case 1: return "#e05144"; //C
            case 2: return "#9239c7"; //T
            case 3: return "#89C738"; //A
            default: return "#858585"; //N
        }
    }

    function colorAGCT(i) {
        switch (i){
            case "G": return "#3899C7"; //G
            case "C": return "#e05144"; //C
            case "T": return "#9239c7"; //T
            case "A": return "#89C738"; //A
            default: return "#858585"; //N
        }
    }

    const layout = ({
        width: 600,
        height: 40,
        margin: {
            top: 10,
            bottom: 0,
            left: 20,
            right: 20
        }
    })

    let nodeRef;
    let tooltip;

    let rulerAGCT = function(min, max, starting_min=min, starting_max=max) {

        var range = [min, max + 1];
        var starting_range = [starting_min, starting_max + 1];
        // console.log(nodeRef);

        const el = document.getElementById('nodeRef')
        // console.log(parseFloat(window.getComputedStyle(el).width.replace("px", '')))
        // console.log(window.getComputedStyle(el).height)


        // set width and height of svg
        // var w = layout.width
        var w = parseFloat(window.getComputedStyle(el).width.replace("px", ''))
        var h = layout.height
        var margin = layout.margin

        // dimensions of slider bar
        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;

        // create x scale
        var x = d3.scaleLinear()
            .domain(range)  // data space
            .range([0, width]);  // display space

        // create y scale
        var y = d3.scaleLinear()
            .domain(range)  // data space
            .range([0, height]);  // display space

        // var colorAGCT = d3.scaleLinear()
        //     .domain(["A", "G", "C", "T", "N"])
        //     .range(["#89C738", "#3899C7", "#e05144", "#9239c7", "#858585"])

        var basePair = d3.scaleLinear()
            .domain(selectedRange)
            .range([0, width])

        // create svg and translated g
        var svg = d3.select(nodeRef);
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        // g
        //     // .attr("transform", "translate(0,150)")      // This controls the vertical position of the Axis
        //     .call(d3.line()([[10, 60], [40, 90], [60, 10], [190, 10]]));

        var Tooltip = d3.select(tooltip)
            // .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("width", "150px")
            .style("position", "relative")
            .style("border", "solid")
            .style("text-align", "center")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            Tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var mousemove = function(d) {
            Tooltip
                .html(`Subfamily: ${d} - ${d+1}`)
                .style("left", basePair(d) + "px")
                .style("top", "-20" + "px")
        }
        var mouseleave = function(d) {
            Tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        const basepairHeight = 20;
        g.append('g').selectAll('rect')
            .data(d3.range(selectedRange[0], selectedRange[1]))
            .enter()
            .append('rect')
            .attr("x", d => basePair(d))
            .attr("y", height - basepairHeight)
            .attr("height", basepairHeight)
            .attr("width", d => basePair(d+1) - basePair(d))
            .style("fill", d => {console.log(fastqInput[d]); return basepairColor(fastqInput[d])})
            .style("opacity", 0.9)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        g.append('line')
            .attr("x1", 0)
            .attr("y1", height)
            .attr("x2", width)
            .attr("y2", height)
            .attr("stroke", "black")
            .attr("stroke-width", "1px");

        g.append('g').selectAll('line')
            .data(d3.range(selectedRange[0], selectedRange[1]+1))
            .enter()
            .append('line')
            .attr('x1', d => basePair(d))
            .attr('x2', d => basePair(d))
            .attr('y1', height/5 * 4)
            .attr('y2', height)
            .style('stroke', '#222222')

        g.append('g').selectAll('line')
            .data(d3.range(selectedRange[0], selectedRange[1]+1, 10))
            .enter()
            .append('line')
            .attr('x1', d => basePair(d))
            .attr('x2', d => basePair(d))
            .attr('y1', height/2)
            .attr('y2', height)
            .style("stroke-width", "2px")
            .style('stroke', '#222222')

        // labels
        // var labelL = g.append('text')
        //     .attr('id', 'labelleft')
        //     .attr('x', 0)
        //     .attr('y', height + 5)
        //     .style('text-anchor', 'end')
        //     .style('dominant-baseline', 'hanging')
        //     .text(range[0])
        //
        // var labelR = g.append('text')
        //     .attr('id', 'labelright')
        //     .attr('x', width)
        //     .attr('y', height + 5)
        //     .style('text-anchor', 'start')
        //     .style('dominant-baseline', 'hanging')
        //     .text(range[1])

        const smallRectLeng = 16;
        g.append('g').selectAll('rect')
            .data(["G", "C", "T", "A", "N"])
            .enter()
            .append('rect')
            .attr("x", (d, i) => i * smallRectLeng)
            .attr("y", height + 5)
            .attr("height", basepairHeight)
            .attr("width", smallRectLeng + "px")
            .style("fill", d => colorAGCT(d))
            .style("opacity", 0.9)

        g.append('g').selectAll('text')
            .data(["G", "C", "T", "A", "N"])
            .enter()
            .append('text')
            .attr("x", (d, i) => i * smallRectLeng + smallRectLeng/2)
            .attr("y", height + 10)
            .style('text-anchor', 'middle')
            .style('dominant-baseline', 'hanging')
            .text(d => d)

        if(selectedRange[1] - selectedRange[0] < 90){
            var labelBasePair = g.append('g').selectAll('text')
                .data(d3.range(selectedRange[0], selectedRange[1]))
                .enter()
                .append('text')
                .attr('id', 'labelbasepair')
                .attr('x', d => (basePair(d) + basePair(d+1))/2)
                .attr('y', height - 15)
                .style('text-anchor', 'middle')
                .style('dominant-baseline', 'hanging')
                .text(d => fastqInput[d])
        }

        return svg.node()
    }
    onMount(()=>{
        // console.log(inputData);
        // console.log(d3.range(0, 100))
        let rangeSlider = rulerAGCT(0, 800);
    })
</script>

<p>Ruler</p>
<svg bind:this="{nodeRef}" id="nodeRef" class="w-full h-16 block border-b border-gray-400">   </svg>
<div bind:this={tooltip} class="tooltip"></div>

<style>
    svg {
        font-family: sans-serif;
    }

    rect.overlay {
        stroke: black;
    }

    rect.selection {
        stroke: none;
        fill: steelblue;
        fill-opacity: 0.6;
    }

    #labelleft, #labelright {
        dominant-baseline: hanging;
        font-size: 12px;
    }

    .tooltip {
        position: absolute;
        /*text-align: center;*/
        width: 120px;
        height: 28px;
        padding: 2px;
        font-family: sans-serif;
        font-size: 12px;
        border: 0px;
        border-radius: 8px;
        pointer-events: none;
    }

</style>

