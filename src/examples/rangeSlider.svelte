<script>
    import {onMount} from "svelte";
    import * as d3 from 'd3';
    import { createEventDispatcher } from 'svelte';

    export let inputRange;
    export let inputData;

    const dispatch = createEventDispatcher();

    function getRange(r) {
        dispatch('range', {
            range: r
        });
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

    let slider_snap = function(min, max, starting_min=min, starting_max=max, data=inputData) {

        var range = [min, max + 1];
        var starting_range = [starting_min, starting_max + 1];
        // console.log(nodeRef);

        const el = document.getElementById('nodeRef')
        console.log(parseFloat(window.getComputedStyle(el).width.replace("px", '')))
        console.log(window.getComputedStyle(el).height)


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

        // create svg and translated g
        var svg = d3.select(nodeRef)
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
        const dataMax = Math.max(...data)
        // const g = svg.append('g').attr('transform', `translate(0, 0)`)

        // draw background lines
        g.append('g').selectAll('line')
            // .data(d3.range(range[0], range[1]+1))
            .data(data)
            .enter()
            .append('line')
            .attr('x1', (d, i) => x(i)).attr('x2', (d, i) => x(i))
            .attr('y1', d => (1 - d/dataMax) * height).attr('y2', d => height)
            // .style('stroke', '#ccc')
            .style('stroke', 'steelblue')

        // labels
        var labelL = g.append('text')
            .attr('id', 'labelleft')
            .attr('x', 0)
            .attr('y', height + 5)
            .style('text-anchor', 'end')
            .style('dominant-baseline', 'hanging')
            .text(range[0])

        var labelR = g.append('text')
            .attr('id', 'labelright')
            .attr('x', 0)
            .attr('y', height + 5)
            .style('text-anchor', 'start')
            .style('dominant-baseline', 'hanging')
            .text(range[1])

        // define brush
        var brush = d3.brushX()
            .extent([[0,0], [width, height]])
            .on('brush', function() {
                var s = d3.event.selection;
                // update and move labels
                labelL.attr('x', s[0] + 5)
                    .text(Math.round(x.invert(s[0])))
                labelR.attr('x', s[1] - 15)
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
    onMount(()=>{
        console.log(inputData);
        console.log(d3.range(0, 100))
        let rangeSlider = slider_snap(0, inputRange);
    })
</script>

Ruler
<svg bind:this="{nodeRef}" id="nodeRef" class="w-full h-16 block border-b">   </svg>

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

