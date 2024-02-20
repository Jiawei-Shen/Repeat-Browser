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
    // import {repeat} from "./Chromosome.svelte";
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';
    import chromosomesLength from "../../json/chromosomes_length.json";
    import ElementScreenshot from '../../examples/ElementScreenshot.svelte';

    let checkedLollipop = true;

    export let data;
    export let repeat;
    export let specy;
    export let selectedChromosome;
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

    async function dotClick(data){
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
        let sessionFile = createSession(sessionInput, 1, repeat, assembly, UUID);
        // let sessionFile = createSession(sessionInput, 1, repeat, UUID);
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
            window.open(`http://epigenomegateway.wustl.edu/browser/?genome=${assembly}&position=${genomeChr}:${genomeStart}-${genomeEnd}&hub=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${UUID}`, '_blank').focus()
        })
    }

    let axisStart;
    let axisEnd;
    let axisRange=[1, chromosomesLength[selectedChromosome]];

    onMount(() =>{
        UUID = uuid.v4();

        let testData = [];
        let lollipopShape = [];
        data.forEach(d => {
            let traceIndex = testData.findIndex(x => x.TE == d.TE);
            // let d_info = $Cart.data.filter(i => i.id == d.TE)[0];
            // let d_name;
            // if(d_info.Target === 'unknown'){
            //     d_name = `${d_info.Biosample} (${d_info.Assay})`
            // } else {
            //     d_name = `${d_info.Biosample} (${d_info.Target})`
            // }
            if (traceIndex != -1){
                testData[traceIndex].x.push(parseInt(d.start));
                testData[traceIndex].y.push(d.RPKM);
                testData[traceIndex].text.push(`${d.start} - ${d.end}`);
                if(checkedLollipop){
                    testData[traceIndex].marker.size.push(calDotPixel(d.RPKM, 8));
                }

            } else {
                console.log(calDotPixel(d.RPKM, 12) );
                let trace = {
                    x: [parseInt(d.start)],
                    y: [d.RPKM],
                    mode: 'markers',
                    type: 'scatter',
                    name: d.TE,
                    id: d.data,
                    TE: d.TE,
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
            var r = ideogram.selectedRegion;
            axisRange = [r.from, r.to];
            console.log(axisRange);
        }
        let ideoWidth = 500;
        if(checkedLollipop){
            ideoWidth = document.getElementById('multiTELollipopChart').offsetWidth
        } else {
            ideoWidth = document.getElementById('multiTEScatter').offsetWidth
        }

        var ideo_config = {
            container: '.ideogram-container-data',
            organism: $Cart.biosample.toLowerCase(),
            assembly: specy,
            chromosome: selectedChromosome.replace('chr', ''),
            brush: `${selectedChromosome}:1-${chromosomesLength[selectedChromosome]}`, // https://www.ncbi.nlm.nih.gov/dbvar/variants/nsv916356
            chrHeight: ideoWidth - 100,
            chrMargin: 0,
            // chrWidth: 6,
            // resolution: 550,
            orientation: 'horizontal',
            onBrushMove: writeSelectedRange,
            onLoad: writeSelectedRange
        };

        var ideogram = new Ideogram(ideo_config);

        let lollipopPlot;
        let myPlot
        if(checkedLollipop){
            lollipopPlot = document.getElementById('multiTELollipopChart');
        } else {
            myPlot = document.getElementById('multiTEScatter');
        }

        let layout = {
            margin: {b:25},
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
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

        let lollipopLayout = {
            margin: {b:25},
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            shapes: lollipopShape,
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
            title:`Genome View on Chromosome ${selectedChromosome.replace('chr', '')}`
        };

        if(checkedLollipop){
            Plotly.newPlot('multiTELollipopChart', testData, lollipopLayout, {displaylogo: false});
            lollipopPlot.on('plotly_click', dotClick);
        } else {
            Plotly.newPlot('multiTEScatter', testData, layout, {displaylogo: false});
            myPlot.on('plotly_click', dotClick);
        }
    })

    afterUpdate(() =>{
        UUID = uuid.v4();

        let testData = [];
        let lollipopShape = [];
        data.forEach(d => {
            let traceIndex = testData.findIndex(x => x.TE == d.TE);
            // let d_info = $Cart.data.filter(i => i.id == d.TE)[0];
            // let d_name;
            // if(d_info.Target === 'unknown'){
            //     d_name = `${d_info.Biosample} (${d_info.Assay})`
            // } else {
            //     d_name = `${d_info.Biosample} (${d_info.Target})`
            // }
            if (traceIndex != -1){
                testData[traceIndex].x.push(parseInt(d.start));
                testData[traceIndex].y.push(d.RPKM);
                testData[traceIndex].text.push(`${d.start} - ${d.end}`);
                if(checkedLollipop){
                    testData[traceIndex].marker.size.push(calDotPixel(d.RPKM, 8));
                }

            } else {
                console.log(calDotPixel(d.RPKM, 12) );
                let trace = {
                    x: [parseInt(d.start)],
                    y: [d.RPKM],
                    mode: 'markers',
                    type: 'scatter',
                    name: d.TE,
                    id: d.data,
                    TE: d.TE,
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
            lollipopPlot = document.getElementById('multiTELollipopChart');
        } else {
            myPlot = document.getElementById('multiTEScatter');
        }

        let layout = {
            margin: {b:0},
            modebar: {orientation: 'v'},
            showlegend: true,
            legend: {x: 1, xanchor: 'right', y: 1},
            xaxis: {
                rangemode: 'tozero',
                range: axisRange,
                title: {
                    text: 'Chromosome'
                }
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

        let lollipopLayout = {
            margin: {b:0},
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
            Plotly.newPlot('multiTELollipopChart', testData, lollipopLayout, {displaylogo: false});
        } else {
            Plotly.newPlot('multiTEScatter', testData, layout, {displaylogo: false});
        }

        if(!checkedLollipop){
            myPlot.on('plotly_click', dotClick)
        } else {
            lollipopPlot.on('plotly_click', dotClick)
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
        <Switch bind:checked={checkedLollipop} icons={false} />
        <span slot="label">Lollipop Chart</span>
    </FormField>

    <ElementScreenshot elementID="plotTE"/>
</div>

<div class="container" id="plotTE">
    <div class="box">
        {#if checkedLollipop}
            <div id='multiTELollipopChart'></div>
        {:else }
            <div id='multiTEScatter'></div>
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
