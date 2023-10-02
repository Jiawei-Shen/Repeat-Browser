<script>
    import {afterUpdate, onMount} from "svelte";
    import * as d3 from 'd3';
    import { createEventDispatcher } from 'svelte';
    import Basepairs from "/src/json/rb_basepair.json"
    import mm10Basepairs from "/src/json/rb_basepair_mm10.json"

    export let inputRange;
    export let inputData;
    export let repeatName;

    let fastqInput;
    if(Basepairs[repeatName] != undefined){
        fastqInput = Basepairs[repeatName];
    } else if(mm10Basepairs[repeatName] != undefined){
        fastqInput = mm10Basepairs[repeatName];
    } else {
        fastqInput = new Array(inputRange).fill("N");
    }

    // let fastqInput = Array.from({length: 800}, () => Math.floor(Math.random() * 4));
    let selectedRange = [100, 160];
    let testRange = [0, inputRange];
    let windowWidth = 0;
    const dispatch = createEventDispatcher();

    function getRange(r) {
        dispatch('range', {
            range: r
        });
    }

    // function basepairColor(i) {
    //     switch (i){
    //         case 0: return "#3899C7"; //G
    //         case 1: return "#e05144"; //C
    //         case 2: return "#9239c7"; //T
    //         case 3: return "#89C738"; //A
    //         default: return "#858585"; //N
    //     }
    // }

    function basepairColor(i) {
        switch (i){
            case "G": return "#3899C7"; //G
            case "C": return "#e05144"; //C
            case "T": return "#9239c7"; //T
            case "A": return "#89C738"; //A
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
            left: 35,
            right: 70
        }
    })

    let nodeRef;
    let AnnoBar;
    let tooltip;

    let slider_snap = function(min, max, starting_min=min, starting_max=max, data=inputData) {

        var range = [min, max + 1];
        var starting_range = [starting_min, starting_max + 1];
        // console.log(nodeRef);

        const el = document.getElementById('nodeRef')
        // console.log(parseFloat(window.getComputedStyle(el).width.replace("px", '')))
        // console.log(window.getComputedStyle(el).height)


        // set width and height of svg
        // var w = layout.width
        var w = parseFloat(window.getComputedStyle(el).width.replace("px", ''))
        windowWidth = w;
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

        // create svg and translated g
        var svg = d3.select(nodeRef)
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
        const dataMax = Math.max(...data)
        // const g = svg.append('g').attr('transform', `translate(0, 0)`)

        // draw background lines
        // g.append('g').selectAll('line')
        //     // .data(d3.range(range[0], range[1]+1))
        //     .data(data)
        //     .enter()
        //     .append('line')
        //     .attr('x1', (d, i) => x(i)).attr('x2', (d, i) => x(i))
        //     .attr('y1', d => (1 - d/dataMax) * height).attr('y2', d => height)
        //     // .style('stroke', '#ccc')
        //     .style('stroke', 'steelblue')

        g.append('g').selectAll('line')
            .data(d3.range(range[0], range[1]+1, 10))
            .enter()
            .append('line')
            .attr('x1', d => x(d)).attr('x2', d => x(d))
            .attr('y1', height/4 * 3).attr('y2', height)
            .style('stroke', '#ccc')

        g.append('g').selectAll('line')
            .data(d3.range(range[0], range[1]+1, 50))
            .enter()
            .append('line')
            .attr('x1', d => x(d)).attr('x2', d => x(d))
            .attr('y1', height/3 * 2).attr('y2', height)
            .style('stroke', '#000000')

        // ticks
        let tickInterval = 50;
        if(range[1] > 1200) tickInterval = 100;
        if(range[1] > 3000) tickInterval = 300;
        if(range[1] > 5000) tickInterval = 500;
        var labels = g.append('g').selectAll('text')
            .data(d3.range(range[0], range[1]+1, tickInterval))
            .enter()
            .append('text')
            .attr('x', d => x(d)).attr('x2', d => x(d))
            .attr('y', height + 5)
            .style('text-anchor', 'middle')
            .style('dominant-baseline', 'hanging')
            .text(d => d)

        var labelL = g.append('text')
            .attr('id', 'labelleft')
            .attr('x', 0)
            .attr('y', height - 24)
            .style('text-anchor', 'end')
            .style('dominant-baseline', 'hanging')
            .style('fill', "#464646")
            .text(range[0])

        var labelR = g.append('text')
            .attr('id', 'labelright')
            .attr('x', 0)
            .attr('y', height - 24)
            .style('text-anchor', 'start')
            .style('dominant-baseline', 'hanging')
            .style('fill', "#464646")
            .text(range[1])

        // define brush
        var brush = d3.brushX()
            .extent([[0,0], [width, height]])
            .on('brush', function() {
                var s = d3.event.selection;
                // update and move labels
                labelL.attr('x', s[0] - 10)
                    .text(Math.round(x.invert(s[0])))
                labelR.attr('x', s[1] + 10)
                    .text(Math.round(x.invert(s[1])) - 1)
                // move brush handles
                handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - height / 4] + ")"; });
                // update view
                // if the view should only be updated after brushing is over,
                // move these two lines into the on('end') part below
                svg.node().value = s.map(d => Math.round(x.invert(d)));
                svg.node().dispatchEvent(new CustomEvent("input"));
            })
            .on('end', function() {
                if (!d3.event.sourceEvent) return;
                var d0 = d3.event.selection.map(x.invert);
                var d1 = d0.map(Math.round)
                // console.log(d1);
                dispatch('range', {
                    range: d1
                });
                testRange = d1;
                d3.select(this).transition().call(d3.event.target.move, d1.map(x))
            })

        // append brush to g
        var gBrush = g.append("g")
            .attr("class", "brush")
            .call(brush)

        // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
        var brushResizePath = function(d) {
            var e = +(d.type == "e"),
                x = e ? 1 : -1,
                y = height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
                "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
                "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }

        var handle = gBrush.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("fill", '#eee')
            .attr("cursor", "ew-resize")
            .attr("d", brushResizePath);

        // override default behaviour - clicking outside of the selected area
        // will select a small piece there rather than deselecting everything
        // https://bl.ocks.org/mbostock/6498000
        gBrush.selectAll(".overlay")
            .each(function(d) { d.type = "selection"; })
            .on("mousedown touchstart", brushcentered)
            .style('stroke', 'black')

        function brushcentered() {
            var dx = x(1) - x(0), // Use a fixed width when recentering.
                cx = d3.mouse(this)[0],
                x0 = cx - dx / 2,
                x1 = cx + dx / 2;
            d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }

        // select entire starting range
        gBrush.call(brush.move, starting_range.map(x))

        return svg.node()
    }

    let rulerAGCT = function(min, max, selectedRange=[0, inputRange]) {
        d3.select(nodeRef).selectAll(".agctRuler").remove();
        var range = selectedRange;
        // var range = [min, max + 1];
        // var starting_range = [starting_min, starting_max + 1];

        // console.log(nodeRef);

        const el = document.getElementById('nodeRef')
        // console.log(parseFloat(window.getComputedStyle(el).width.replace("px", '')))
        // console.log(window.getComputedStyle(el).height)


        // set width and height of svg
        if (windowWidth == 0){
            var w = layout.width;
        } else {
            var w = windowWidth;
        }
        // var w = layout.width
        // var w = parseFloat(window.getComputedStyle(el).width.replace("px", ''))
        var h = layout.height
        var margin = layout.margin

        // dimensions of slider bar
        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;
        const baseHeight = 1.5*height;

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
            .style("width", "165px")
            .style("position", "absolute")
            .style("border", "solid")
            .style("z-index", 10)
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
                .style("left", (d3.event.pageX - 350) + "px")
                .style("top", document.getElementById('AGCT base line').style.bottom)
        }
        var mouseleave = function(d) {
            Tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        const basepairHeight = 20;
        g.append('g').selectAll('agctRuler')
            .data(d3.range(selectedRange[0], selectedRange[1]))
            .enter()
            .append('rect')
            .attr("x", d => basePair(d))
            .attr("y", height - basepairHeight + baseHeight)
            .attr("height", basepairHeight)
            .attr("width", d => basePair(d+1) - basePair(d))
            .attr('class', 'agctRuler')
            .style("fill", d => basepairColor(fastqInput[d]))
            .style("opacity", 0.9)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        g.append('line')
            .attr("x1", 0)
            .attr("y1", height + baseHeight)
            .attr("x2", width)
            .attr("y2", height + baseHeight)
            .attr('class', 'agctRuler')
            .attr('id', 'AGCT base line')
            .attr("stroke", "black")
            .attr("stroke-width", "1px");

        g.append('g').selectAll('agctRuler')
            .data(d3.range(selectedRange[0], selectedRange[1]+1))
            .enter()
            .append('line')
            .attr('class', 'agctRuler')
            .attr('x1', d => basePair(d))
            .attr('x2', d => basePair(d))
            .attr('y1', baseHeight + height/5 * 4)
            .attr('y2', height + baseHeight)
            .style('stroke', '#343a40')

        g.append('g').selectAll('agctRuler')
            .data(d3.range(selectedRange[0], selectedRange[1]+1, 10))
            .enter()
            .append('line')
            .attr('class', 'agctRuler')
            .attr('x1', d => basePair(d))
            .attr('x2', d => basePair(d))
            .attr('y1', baseHeight + height/2)
            .attr('y2', height + + baseHeight)
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

        //Annotation Bar(GCTAN)
        const smallRectLeng = 16;
        g.append('g').selectAll('agctRuler')
            .data(["G", "C", "T", "A", "N"])
            .enter()
            .append('rect')
            .attr('class', 'agctRuler')
            .attr('id', 'Annotation Bar(GCTAN)')
            .attr("x", (d, i) => i * smallRectLeng)
            .attr("y", height + 5 + baseHeight)
            .attr("height", basepairHeight)
            .attr("width", smallRectLeng + "px")
            .style("fill", d => colorAGCT(d))
            .style("opacity", 0.9)

        g.append('g').selectAll('agctRuler')
            .data(["G", "C", "T", "A", "N"])
            .enter()
            .append('text')
            .attr('class', 'agctRuler')
            .attr("x", (d, i) => i * smallRectLeng + smallRectLeng/2)
            .attr("y", height + 10 + baseHeight)
            .style('text-anchor', 'middle')
            .style('dominant-baseline', 'hanging')
            .text(d => d)

        if(selectedRange[1] - selectedRange[0] < 90){
            var labelBasePair = g.append('g').selectAll('agctRuler')
                .data(d3.range(selectedRange[0], selectedRange[1]))
                .enter()
                .append('text')
                .attr('class', 'agctRuler')
                .attr('id', 'labelbasepair')
                .attr('x', d => (basePair(d) + basePair(d+1))/2)
                .attr('y', height - 15 + baseHeight)
                .style('text-anchor', 'middle')
                .style('dominant-baseline', 'hanging')
                .text(d => fastqInput[d])
        }

        return svg.node()
    }

    onMount(()=>{
        // console.log(inputData);
        // console.log(d3.range(0, 100))
        let rangeSlider = slider_snap(0, inputRange);
        let rangeAGCT = rulerAGCT(0, inputRange, selectedRange=testRange);
    })

    // afterUpdate(()=>{
    //     let rangeAGCT = rulerAGCT(0, inputRange, selectedRange=testRange, width=windowWidth);
    // })

    $: rulerAGCT(0, inputRange, selectedRange=testRange);
</script>

<p>Ruler</p>
<svg bind:this="{nodeRef}" id="nodeRef" class="w-full h-28 block border-b border-gray-400">   </svg>
<!--<svg bind:this="{nodeRef2}" id="nodeRef2" class="w-full h-16 block border-b border-gray-400">   </svg>-->
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

</style>

