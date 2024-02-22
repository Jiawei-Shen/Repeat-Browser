<script>
    import * as d3 from 'd3';
    import {onMount, afterUpdate} from 'svelte';
    import Plotly from "plotly.js";
    import { Cart, genomeModal } from "../../stores/CartStore";
    // import WigURLModal from './WigURLModal.svelte';
    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';
    import { createSession } from './createSession';
    import chromosomesLength from "../../json/chromosomes_length.json";
    import uuid from "uuid";
    import VirtualList from 'svelte-tiny-virtual-list';
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import {Text} from "@smui/list";
    // import {repeat} from "./Chromosome.svelte";
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';
    import ElementScreenshot from '../../examples/ElementScreenshot.svelte';

    let checkedLollipop = true;
    // let showWigURLModal = false;
    let openWigURLModal = false;
    let wigURL = "";

    export let data;
    export let repeat;
    export let specy;

    let selectedChromosome = data["chromosome"];
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

    const RPKMList = data.map(d => d.RPKM);
    const averageValue = RPKMList.reduce((sum, num) => sum + num, 0) / RPKMList.length;
    console.log(averageValue);
    // Calculate the average value of the array

    function calDotPixel(RPKM, meanPixel){
        return Math.log2(RPKM / averageValue + 1) * meanPixel
    }

    let dotData;
    function dotClick(data){
        openWigURLModal = true;
        dotData = data;
    }

    async function wigURLModalfunc(){
        UUID = uuid.v4();
        const data = dotData;
        // console.log(wigURL);
        var pts = '';
        for(var i=0; i < data.points.length; i++){
            pts = 'x = '+data.points[i].x +'\ny = '+
                data.points[i].y.toPrecision(4) + '\n\n';
        }
        let dataDetail = $Cart.data.filter(d => d.id == data.points[0].data.id).pop();

        let sessionInput = [{'key': data.points[0].data.chr, 'values':[{'RPKM': data.points[0].y,
                'chr': data.points[0].data.chr, 'data': dataDetail, 'end': data.points[0].text.split(' - ')[1],
                'start': data.points[0].text.split(' - ')[0]}]}]

        const genomeStart = data.points[0].text.split(' - ')[0];
        const genomeEnd = data.points[0].text.split(' - ')[1];
        const genomeChr = data.points[0].data.chr;

        // console.log(data.points[0], sessionInput);
        let assembly = specy;
        if ((assembly === 'hg38') || (assembly === 'GRCh38')){
            // organism = 'human'
            assembly = 'hg38'
        } else if((assembly === 'hg19') || (assembly === 'GRCh37')){
            assembly = 'hg19'
            // organism = 'human'
        } else if((assembly === 'mm10') || (assembly === 'mm9')){
            // organism = 'mouse'
            assembly = assembly
        }
        let sessionFile = createSession(sessionInput, 1, repeat, assembly, UUID, wigURL);
        // let sessionFile = createSession(sessionInput, 1, repeat, UUID);
        // alert("Jumping to the WashU Epigenome Browser!");

        // const form = new FormData();
        // form.append("_id", `${UUID}`);
        // form.append("hub", {"content": [1,2]});
        let form = {
            "_id": `${UUID}`,
            "hub": {
                "content": JSON.parse(sessionFile)
            }
        }
        console.log(form);
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
            window.open(`http://epigenomegateway.wustl.edu/browser/?genome=${assembly}&position=${genomeChr}:${genomeStart}-${genomeEnd}&hub=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${UUID}`, '_blank').focus()
        })
    }

    let axisStart;
    let axisEnd;
    let axisRange=[1, chromosomesLength[selectedChromosome]];

    onMount(() =>{
        let testData = [];
        let lollipopShape = [];
        data.forEach(d => {
            let traceIndex = testData.findIndex(x => x.id == d.data);
            let d_info = $Cart.data.filter(i => i.id == d.data)[0];
            let d_name;
            if(d_info.Target === 'unknown'){
                d_name = `${d_info.Biosample} (${d_info.Assay})`
            } else {
                d_name = `${d_info.Biosample} (${d_info.Target})`
            }
            if (traceIndex != -1){
                testData[traceIndex].x.push(parseInt(d.start));
                testData[traceIndex].y.push(d.RPKM);
                testData[traceIndex].text.push(`${d.start} - ${d.end}`);
                if(checkedLollipop){
                    testData[traceIndex].marker.size.push(calDotPixel(d.RPKM, 8));
                }
            } else {
                let trace = {
                    x: [parseInt(d.start)],
                    y: [d.RPKM],
                    mode: 'markers',
                    type: 'scatter',
                    name: d_name,
                    id: d.data,
                    chr: d.chr,
                    opacity: 0.6,
                    text: [`${d.start} - ${d.end}`]
                }
                if(checkedLollipop){
                    trace['marker'] = { size: [calDotPixel(d.RPKM, 8)], sizemin: 2 }
                } else {
                    trace['marker'] = { size: 8 }
                }
                testData.push(trace)
            }
            const lollipopValue = {
                x0: parseInt(d.start),
                x1: parseInt(d.start),
                y0: 0,
                y1: d.RPKM,
                line: {
                    color: 'grey',
                    width: 1
                },
                type: 'line',
                xref: 'x',
                yref: 'y'
            }
            lollipopShape.push(lollipopValue);
        })

        function writeSelectedRange() {
            console.log()
            var r = ideogram.selectedRegion;
            axisRange = [r.from, r.to];
            console.log(axisRange);
        }
        let ideoWidth = 500;
        if(checkedLollipop){
            ideoWidth = document.getElementById('multiDataLollipopChart').offsetWidth
        } else {
            ideoWidth = document.getElementById('dataScatter').offsetWidth
        }

        var ideo_config = {
            container: '.ideogram-container-data',
            organism: $Cart.biosample.toLowerCase(),
            assembly: specy,
            chromosome: selectedChromosome.replace('chr', ''),
            brush: `${selectedChromosome}:1-${testData[0].x[testData[0].x.length - 1]}`, // https://www.ncbi.nlm.nih.gov/dbvar/variants/nsv916356
            chrHeight: ideoWidth - 100,
            chrMargin: 0,
            // chrWidth: 6,
            // resolution: 550,
            orientation: 'horizontal',
            onBrushMove: writeSelectedRange,
            onLoad: writeSelectedRange
        };

        var ideogram = new Ideogram(ideo_config);
        const maxLength = ideogram.maxLength;
        console.log(ideogram, maxLength.bp);

        let lollipopPlot;
        let myPlot
        if(checkedLollipop){
            lollipopPlot = document.getElementById('multiDataLollipopChart');
        } else {
            myPlot = document.getElementById('dataScatter');
        }

        let layout = {
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            xaxis: {
                rangemode: 'tozero',
                title: {
                    text: 'Chromosome'
                },
                range: axisRange
            },
            yaxis: {
                rangemode: 'tozero',
                title: {
                    text: 'RPKM'
                }
                // range: [0, 8]
            },
            title:`Genome View on Chromosome ${selectedChromosome.replace('chr', '')}`
        };

        let lollipopLayout = {
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            shapes: lollipopShape,
            xaxis: {
                rangemode: 'tozero',
                title: {
                    text: 'Chromosome'
                },
                range: axisRange
                // range: [0, 6]
            },
            yaxis: {
                rangemode: 'tozero',
                title: {
                    text: 'RPKM'
                }

                // range: [0, 8]
            },
            title:`Genome View on Chromosome ${selectedChromosome.replace('chr', '')}`
        };
        if(checkedLollipop){
            Plotly.newPlot('multiDataLollipopChart', testData, lollipopLayout, {displaylogo: false});
            lollipopPlot.on('plotly_click', dotClick);
        } else {
            Plotly.newPlot('dataScatter', testData, layout, {displaylogo: false});
            myPlot.on('plotly_click', dotClick);
        }
    })

    afterUpdate(() =>{
        let layout = {};

        // function writeSelectedRange() {
        //     var r = ideogram.selectedRegion;
        //     console.log(r);
        //     axisRange = [r.from, r.to]
        //     // axisStart = r.from;
        //     // axisEnd = r.to;
        // }
        //
        // var ideo_config = {
        //     container: '.ideogram-container-data',
        //     organism: $Cart.biosample.toLowerCase(),
        //     assembly: specy,
        //     chromosome: selectedChromosome.replace('chr', ''),
        //     brush: `${selectedChromosome}:1-${chromosomesLength[selectedChromosome]}`, // https://www.ncbi.nlm.nih.gov/dbvar/variants/nsv916356
        //     // chrHeight: 900,
        //     // chrWidth: 10,
        //     // resolution: 550,
        //     orientation: 'horizontal',
        //     onBrushMove: writeSelectedRange,
        //     onLoad: writeSelectedRange
        // };
        //
        // var ideogram = new Ideogram(ideo_config);

        let testData = [];
        let lollipopShape = [];
        data.forEach(d => {
            let traceIndex = testData.findIndex(x => x.id == d.data);
            let d_info = $Cart.data.filter(i => i.id == d.data)[0];
            let d_name;
            if(d_info.Target === 'unknown'){
                d_name = `${d_info.Biosample} (${d_info.Assay})`
            } else {
                d_name = `${d_info.Biosample} (${d_info.Target})`
            }
            if (traceIndex != -1){
                testData[traceIndex].x.push(parseInt(d.start));
                testData[traceIndex].y.push(d.RPKM);
                testData[traceIndex].text.push(`${d.start} - ${d.end}`);
                if(checkedLollipop){
                    testData[traceIndex].marker.size.push(calDotPixel(d.RPKM, 8));
                }
            } else {
                let trace = {
                    x: [parseInt(d.start)],
                    y: [d.RPKM],
                    mode: 'markers',
                    type: 'scatter',
                    name: d_name,
                    id: d.data,
                    chr: d.chr,
                    opacity: 0.6,
                    text: [`${d.start} - ${d.end}`]
                }
                if(checkedLollipop){
                    trace['marker'] = { size: [calDotPixel(d.RPKM, 8)], sizemin: 2 }
                } else {
                    trace['marker'] = { size: 8 }
                }
                testData.push(trace)
            }
            const lollipopValue = {
                x0: parseInt(d.start),
                x1: parseInt(d.start),
                y0: 0,
                y1: d.RPKM,
                line: {
                    color: 'grey',
                    width: 1
                },
                type: 'line',
                xref: 'x',
                yref: 'y'
            }
            lollipopShape.push(lollipopValue);
        })
        console.log(testData, data);

        let lollipopPlot;
        let myPlot
        if(checkedLollipop){
            lollipopPlot = document.getElementById('multiDataLollipopChart');
        } else {
            myPlot = document.getElementById('dataScatter');
        }

        console.log(axisRange);
        layout = {
            margin: {b:25},
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            xaxis: {
                rangemode: 'tozero',
                range: axisRange
            },
            yaxis: {
                rangemode: 'tozero',
                title: {
                    text: 'RPKM'
                }
                // range: [0, 8]
            },
            title:`Genome View on Chromosome ${selectedChromosome.replace('chr', '')}`
        };

        let lollipopLayout = {
            margin: {b:25},
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            shapes: lollipopShape,
            xaxis: {
                rangemode: 'tozero',
                range: axisRange
            },
            yaxis: {
                rangemode: 'tozero',
                title: {
                    text: 'RPKM'
                }
                // range: [0, 8]
            },
            title:`Genome View on Chromosome ${selectedChromosome.replace('chr', '')}`
        };

        if(checkedLollipop){
            Plotly.newPlot('multiDataLollipopChart', testData, lollipopLayout, {displaylogo: false});
            lollipopPlot.on('plotly_click', dotClick);
        } else {
            Plotly.newPlot('dataScatter', testData, layout, {displaylogo: false});
            myPlot.on('plotly_click', dotClick);
        }
    })
</script>

<style>
    .container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center; /* Aligns items along the main axis (horizontally) */
    }

    .box {
        width: 100%; /* Sets the width of each box */
        justify-content: center;
        box-sizing: border-box; /* Includes padding and border in the width */
        /*border: 1px solid #000; !* For visualization purposes *!*/
        margin: 5px; /* Adds space between the boxes */
    }
</style>

<div class="flex items-center">
    <FormField>
<!--        <span slot="label">Simple Version(Scatter Plot)</span>-->
        <Switch bind:checked={checkedLollipop} icons={false} />
        <span slot="label">Lollipop Chart</span>
    </FormField>

    <ElementScreenshot elementID="plotData"/>
</div>

<div class="container" id="plotData">
    <div class="box">
        {#if checkedLollipop}
            <div id='multiDataLollipopChart'></div>
        {:else }
            <div id='dataScatter'></div>
        {/if}
    </div>

    <div class="ideogram-container-data box">
        <!-- The ideogram goes here. -->
    </div>

    <div>
        Selected region on human chromosome: {selectedChromosome}
        <span>{axisRange[0]}</span>-<span>{axisRange[1]}</span>
    </div>
</div>

<Dialog
        bind:open={openWigURLModal}
        aria-labelledby="simple-title"
        aria-describedby="simple-content"
>
    <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
    <Title id="simple-title">Dialog Title</Title>
    <Content id="simple-content">
        You can input your bigwig file URL (optional). <br >
        Click "OK" and navigate to the WashU Epigenome Browser.
        <div>
            <label for="website" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Wig File URL</label>
            <input type="url" id="website" bind:value={wigURL} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Optional" required />
        </div>
    </Content>
    <Actions>
        <Button on:click={wigURLModalfunc}>
            <Label>OK</Label>
        </Button>
        <Button on:click={()=>{openWigURLModal=false}}>
            <Label>Cancel</Label>
        </Button>
    </Actions>
</Dialog>