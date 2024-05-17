<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import VirtualList from 'svelte-tiny-virtual-list';
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import IconButton from '@smui/icon-button';

    import { Cart } from '../stores/CartStore';
    import REPEATS from '../json/hg38_subfamily.json';
    import mm10REPEATS from '../json/mm10_repeat.json'
    import {repeatsTour} from "../api/toursteps"
    import Typeahead from "svelte-typeahead";

    let bioType = ['Mouse', 'Human'];

    let value = 'Human';

    let events = [];

    let tooltipNodeRef;
    let uniqueRepeats;
    let nodeRef;

    let repeat_list = [];
    function treeTolist(Tree){
        let list = [];
        let temp_list = [...REPEATS.children];
        let temp_list2 = temp_list.map(x => [...x.children]);
        temp_list2.forEach(value_array => {
            value_array.forEach(value => {
                list.push(...value.children)
                }
            )
        } );
        return list
    }
    const REPEAT_list = treeTolist(REPEATS);
    const mm10REPEAT_list = treeTolist(mm10REPEATS);
    let searchTEList;
    if($Cart.biosample === 'Human'){
        searchTEList = REPEAT_list;
    } else {
        searchTEList = mm10REPEAT_list;
    }

    function handleSelected(input) {
        const selected_array = [...input.data.children];
        let filteredInput = input.data.children.filter(x => {
            const cartRepeatsName = $Cart.repeats.map(x => x.name);
            return !cartRepeatsName.includes(x.name);
        })
        Cart.addRepeats(Array.from(new Set([...$Cart.repeats.filter(r => {
            let repeat_name = r.name;
            let input_names = selected_array.map(e => e.name);

            return input_names.indexOf(repeat_name) === -1;
        }), ...filteredInput].map(JSON.stringify))).map(JSON.parse));

    }

    function handleChildSelected(input) {
        const cartRepeatsName = $Cart.repeats.map(x => x.name);
        if(!cartRepeatsName.includes(input.data.name)){
            Cart.addRepeats(Array.from(new Set([...$Cart.repeats, input.data].map(JSON.stringify))).map(JSON.parse));

        }
    }

    function recoverSelected(input) {
        const selected_array = [...input.data.children];

        Cart.addRepeats($Cart.repeats.filter(r => {
            let repeat_name = r.name;
            let input_names = selected_array.map(e => e.name);
            return input_names.indexOf(repeat_name) === -1;
        }));
    }

    function color_function(input){

    }

    function recoverChildSelected(input) {
        const selected_array = [input.data];

        Cart.addRepeats($Cart.repeats.filter(r => {
            let repeat_name = r.name;
            let input_names = input.data.name;
            return repeat_name != input_names;
        }));
    }

    function theColor(d){
        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
        const cartRepeatsName = $Cart.repeats.map(x => x.name);
        if (d.depth == 3 && cartRepeatsName.includes(d.data.name)) return "#780000";
        else return color(d.data.name);
    }

    function Sunburst(data, {format = d3.format(",d"), width = 932,} = {})
    {
        let partition = data => {
            const root = d3.hierarchy(data)
                .sum(d => d.size)
                .sort((a, b) => b.size - a.size);
            return d3.partition()
                .size([2 * Math.PI, root.height + 1])
                (root);
        }

        let radius = width / 6;

        let arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

        let color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

        const root = partition(data);

        root.each(d => d.current = d);

        const svg = d3.select(nodeRef)
            .attr("viewBox", [0, 0, width, width])
            .style("font", "10px sans-serif");

        svg.selectAll('*').remove();

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

        const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                const cartRepeatsName = $Cart.repeats.map(x => x.name);
                if (d.depth == 3 && cartRepeatsName.includes(d.data.name)) return "#780000";
                while (d.depth > 1) d = d.parent;
                // console.log(d);
                return color(d.data.name);
            })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => arc(d.current))
            .on("click", function (d) {
                d.noFill = d.noFill || false;

                const cartRepeatsName = $Cart.repeats.map(x => x.name);
                if (!cartRepeatsName.includes(d.data.name)) {
                    // console.log('hello1', d.data.name)
                    handleChildSelected(d);
                    this.style.fill = "#780000";
                } else {
                    // console.log('hello0', d)
                    recoverChildSelected(d);
                    this.style.fill = color(d.parent.parent.data.name);
                }

                d.noFill = !d.noFill;
            });

        let dblclick_timer = false;
        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", function (d) {
                // if double click timer is active, this click is the double click
                if ( dblclick_timer )
                {
                    clearTimeout(dblclick_timer)
                    dblclick_timer = false;
                    // double click code code comes here
                    if(d.depth == 2){
                        console.log(d, d.noFill);
                        d.noFill = typeof d.noFill !== 'undefined' ? d.noFill : false;
                        console.log(d, d.noFill);
                        if (!d.noFill) {
                            console.log("Double Click the family, but select!");
                            handleSelected(d);
                            path.attr("fill", d => {
                                    const cartRepeatsName = $Cart.repeats.map(x => x.name);
                                    if (d.depth == 3 && cartRepeatsName.includes(d.data.name)) return "#780000";
                                    while (d.depth > 1) d = d.parent;
                                    // console.log(d);
                                    return color(d.data.name);
                                })
                            this.style.fill = "#780000";
                        } else {
                            console.log("Double Click the family!");
                            recoverSelected(d);
                            path.attr("fill", d => {
                                const cartRepeatsName = $Cart.repeats.map(x => x.name);
                                if (d.depth == 3 && cartRepeatsName.includes(d.data.name)) return "#780000";
                                while (d.depth > 1) d = d.parent;
                                // console.log(d);
                                return color(d.data.name);
                            })
                            this.style.fill = color(d.parent.data.name);

                        }
                        d.noFill = !d.noFill;
                        console.log(d, d.noFill);
                    }

                    // console.log("double click fired")
                }
                // otherwise, what to do after single click (double click has timed out)
                else dblclick_timer = setTimeout( function(){
                    dblclick_timer = false
                    // single click code code comes here
                    // console.log("single click fired")
                    clicked(d)
                }, 300);
            })
            // .on("click", clicked);

        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

        const label = g.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);


        const parent = g.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

        function clicked(p) {
            parent.datum(p.parent || root);

            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            const t = g.transition().duration(750);

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function(d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

                .attrTween("d", d => () => arc(d.current));

            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }

        const dbclicked = d => {
            if(d.depth == 2){
                d.noFill = d.noFill || false;
                if (!d.noFill) {
                    handleSelected(d);
                    this.style.fill = "#780000";
                } else {
                    recoverSelected(d);
                    this.style.fill = color(d.ancestors().reverse()[1]?.index);
                }
                d.noFill = !d.noFill;
            }
        }

        function arcVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

        return svg.node();
    }

    let fileContent = '';
    let fileInput = '';
    let txtRepeatSubfam = [];
    let txtRepeatsList = [];

    function handleFileUpload(event) {
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                fileContent = reader.result;
                txtRepeatSubfam = fileContent.split('\t');
                txtRepeatsList = REPEAT_list.filter(r => {
                    return txtRepeatSubfam.includes(r.name)
                });
                Cart.addRepeats(Array.from(new Set([...$Cart.repeats, ...txtRepeatsList].map(JSON.stringify))).map(JSON.parse))
            };
            reader.readAsText(file);
        }

        fileInput.value = '';
    }

    let cartRepeats;
    const unsubscribe = Cart.subscribe(async store => {
        const { repeats } = store;
        cartRepeats = repeats;
        console.log(cartRepeats);
    });

    onMount(()=>{
        // console.log(Cart);
        if($Cart.biosample === 'Human'){
            let chart = Sunburst(REPEATS, {format: d3.format(",d"), width: 932});
        } else {
            let mm10chart = Sunburst(mm10REPEATS, {format: d3.format(",d"), width: 932});
        }
    })

    $: if($Cart.biosample === 'Human'){
       let chart = Sunburst(REPEATS, {format: d3.format(",d"), width: 932});
    } else {
       let chart = Sunburst(mm10REPEATS, {format: d3.format(",d"), width: 932});
    }

</script>

<style>
    .row {
        padding: 0 20px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;
        line-height: 50px;
        font-weight: 500;
        background: #fff;
    }

    :global([data-svelte-typeahead]) {
        margin: 1rem;
    }
</style>


<div class="flex">
    <div class="flex-auto flex-col justify-center w-full px-4 ml-2" id="repeats-search">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="py-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Repeats Search</h5>
        </div>
        <div class="block pt-4 rounded-b shadow-lg bg-white max-w-sm w-full px-4">
                <Typeahead
                        label="Repeats Search"
                        hideLabel
                        placeholder={`Search Repeats (e.g. "MER125")`}
                        data={searchTEList}
                        extract={(item) => item.name}
                        on:select={({ detail }) => {
                                Cart.addRepeats(Array.from(new Set([...$Cart.repeats, detail.original].map(JSON.stringify))).map(JSON.parse))
                            }}
                        on:clear={() => events = [...events, "clear"]}
                />
            <p class="px-4 text-sm text-gray-400"> You can click the repeat in the dropdown to add it. </p>
        </div>
    </div>

    <div class="flex-auto flex-col justify-center w-full px-4 ml-2" id="repeats-txt">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="py-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Upload Subfamilies txt File</h5>
        </div>
        <div class="block pt-4 rounded-b shadow-lg bg-white max-w-sm w-full px-4">
            <input bind:this={fileInput} class="px-4 py-2" type="file" accept=".txt" on:change={handleFileUpload}>
            <p class="px-4 text-sm text-gray-400">
                You can upload a .txt file that contains a list of Repeat Subfamily names separated by a tab character ('\t').
<!--                The Repeat Browser will then input these Repeat Subfamilies (please be cautious about the specified species!).-->
                e.g: LTR12\tMER12
            </p>

            {#if fileContent}
                <div class="border-gray-500">
                    <h2>File Content:</h2>
                    <pre>{fileContent}</pre>
                </div>
            {/if}
        </div>
    </div>
</div>


<LayoutGrid>
    <Cell span={4}>
        <div>
            <div class="flex flex-col justify-center w-full" id="repeats-list">
                <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
                    <h5 class="text-gray-900 text-xl leading-tight font-medium py-2 inline">Selected Repeats: {cartRepeats.length}</h5>
                </div>
                <div class="max-w-sm rounded-b block shadow-lg">
                    <div class="block p-2 rounded-b shadow-lg bg-white max-w-sm w-full h-full px-4">
                    <VirtualList
                            height={300}
                            width="auto"
                            itemCount={cartRepeats.length}
                            itemSize={50}>
                        <div slot="item" let:index let:style {style} class="row">
                            <span>
                                <IconButton class="material-icons"
                                            on:click={() =>
                                            Cart.addRepeats($Cart.repeats.filter(d => d.name !== cartRepeats[cartRepeats.length - 1 - index].name))}>
                                cancel</IconButton>
                                {cartRepeats[cartRepeats.length - 1 - index].name} ({cartRepeats[cartRepeats.length - 1 - index].family} >> {cartRepeats[cartRepeats.length - 1 - index].class})
                            </span>
                            <!--            <Text>{cartRepeats[cartRepeats.length - 1 - index].name}</Text>-->
                        </div>
                    </VirtualList>

                </div>
                    <hr />
                    <div class="px-6 py-4">
                        <h5 class="text-gray-900 text-xl font-medium mb-2">Repeats Selection</h5>
                        <ul class="list-disc px-4 text-gray-700 text-sm mb-4">
                            In this page, you can select the subfamilies of the repeats you interested in. <br>
                            <li>The table presented above displays the selected repeats in the format: subfamily (family >> class). </li>
                            <li>For this sunburst chart, the inner ring represents "Class" hierarchy and the outer ring represents
                                "Family" hierarchy. </li>
                            <li>Click the outer ring once, the "Subfamily" hierarchy will appear. </li>
                            <li>Click twice to select the repeats.</li>
                        </ul>
                        <p class="text-gray-700 text-base mb-4">

                        </p>
                        <a on:click={repeatsTour} class="inline-flex items-center cursor-pointer px-2 py-2 text-sm font-medium text-center text-white bg-lightBlue-600 rounded-lg hover:bg-lightBlue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <i class="fa fa-fw fa-book pr-6 pl-2"></i>
                            Detailed Tour
                            <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </Cell>

    <Cell span={8}>
        <div class="flex flex-col justify-center w-full" id="repeats-sunburst">
            <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
                <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">Repeats Selection: {$Cart.biosample}
<!--                    <div style="justify-content: flex-start; display: inline-block; margin-left: 1rem">-->
<!--                        <div>-->
<!--                            <Select bind:value={$Cart.biosample} label="Select Menu">-->
<!--                                {#each bioType as type}-->
<!--                                    <Option value={type}>{type}</Option>-->
<!--                                {/each}-->
<!--                            </Select>-->
<!--                        </div>-->
<!--                    </div>-->
                </h5>

            </div>
            <div class="block p-6 rounded-b shadow-lg bg-white max-w-sm w-full px-4">
                <div class="pb-2">
                    <svg bind:this="{nodeRef}" width=90% height=90%>    </svg>
                </div>

            </div>
        </div>
    </Cell>


</LayoutGrid>

