<script>
  import {onMount, afterUpdate, createEventDispatcher} from "svelte";
  import * as d3 from 'd3';
  import uuid from "uuid";
  import { createSession } from './createSession';
  // import { zoom, select } from "d3";

  const screenWidth = 1000;
  const screenHeight = 500;
  let node, bindHandleZoom;
  let tooltip;
  export let chr;
  // export let dataset;
  // export let data;
  export let datalist;
  let filteredData;
  export let cutoff;
  export let specy;
  export let datarange;
  export let genomeselectmode;
  export let repeat;


  import CHROMOSOMES_LENGTH_HG38 from '../../json/chromosomes_length.json'
  import CHROMOSOMES_LENGTH_MM10 from '../../json/mm10_chromosome_length.json'
  import {getFiltered} from "../data-view/data-helper";
  import {Cart} from "../../stores/CartStore";
  import annotations from "../../json/SRR562646.json";

  let chrLength;
  let width;
  let UUID;
  let sessionFile;
  // let chrLength = CHROMOSOMES_LENGTH_HG38[chr];
  // let width = CHROMOSOMES_LENGTH_HG38[chr];
  let cartData;
  let cartRepeats;
  let cartGenomelist;
  const unsubscribe = Cart.subscribe(async store => {
      const { data, repeats, genomelist } = store;
      cartData = data;
      cartRepeats = repeats;
      cartGenomelist = genomelist
  })

  if (specy == "mm10"){
      chrLength = CHROMOSOMES_LENGTH_MM10[chr];
      width = CHROMOSOMES_LENGTH_MM10[chr];
  } else {
      chrLength = CHROMOSOMES_LENGTH_HG38[chr];
      width = CHROMOSOMES_LENGTH_HG38[chr];
  }
  let height = 40;

  const dispatch = createEventDispatcher();

  const xScale = d3.scaleLinear()
            .domain([0, 249250621])
            .range([0, screenWidth / 2]);

  let data2color = {}
  const colorList = {1: "red", 2: "blue", 3: "green", 4: "yellow", 5: "purple"};
  $: data = datalist;
  // console.log($Cart.genomelist);

  onMount(() => {
      unsubscribe;
      UUID = uuid.v4();

    // filteredData = filterAboveCutoff(data);
      d3.select(node)
          .selectAll("rect.bar")
          .data([chrLength])
          .enter()
          .append("rect")
          .attr("class", "bar")
      // .style("fill", "rgba(0,149,255, 1)")

      d3.select(node)
          .selectAll("rect.bar")
          .data([chrLength])
          .attr("x", 50)
          .attr("width", d => xScale(d) + 10)
          .attr("height", 22)
          .style("fill", "rgba(0,149,255, .4)")
          .on("click", function(d) {
              // console.log(data, filteredData);
              handleGenomeClick(filteredData);
          })
     createChromosomeBody(data);
  });

  afterUpdate(() => {
      datarange = datarange;
      filteredData = filterAboveCutoff(data);
      createChromosomeBody(filteredData);
  });

  let dataset = new Set();
  async function handleSessionDownload(d) {
      const url_submit="https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/";
      let sessioInput = cartGenomelist.filter(x => x.key == d.chr);
      sessioInput[0].values = sessioInput[0].values.filter(x => (x.start == d.start));
      const dataInfo = cartData.filter(x => x.id == sessioInput[0].values[0].data);

      sessioInput[0].values[0].data = dataInfo[0];
      console.log($Cart);

      sessionFile = createSession(sessioInput, 1, repeat, UUID);
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

      return 0

      // console.log(`https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${UUID}`)
      // fileDownload(sessionFile, `${UUID}_region_sets.json`);
  }

  function getColor(dataName){
      dataset.add(dataName);
      let dlist = Array.from(dataset);
      let dataIndex = dlist.findIndex(e => e == dataName);
      return colorList[dataIndex+1]
  }

  function filterAboveCutoff(data) {
      // console.log(data);
      return data.filter(d => d.RPKM > cutoff)
  }

  function createChromosomeBody(data) {
      d3.select(node).selectAll(".chrBand").remove(); // flush clean

      const colorScale = d3.scaleLinear()
          .domain(datarange)
          .range(["white", "yellow"])

      function colorFunction(color) {
          let theRange = (datarange[1] < 500) ? datarange : [datarange[0], 500];
          return d3.scaleLinear()
                    .domain(theRange)
                    .range(["white", color])
      }

      let div = d3.select(tooltip)
          .style("opacity", 0)
          .attr("class", "tooltip")
          // .style("background-color", "lightsteelblue")
          .style("border", "solid")
          .style("width", "180px")
          .style("align", "left")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "3px")
          .style("background-color", "#ccc")

      d3.select(node)
          .append('g')
          .selectAll('chrBands')
          .remove();


        d3.select(node)
            .append('g')
            .selectAll('chrBands')
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                // console.log(data);
                return xScale(d.start) + 55;
            })
            .attr("y", -4)
            .attr("height", 25)
            .attr("width", 1)
            .attr('class', 'chrBand')
            // .style("fill", "#FCBC34")
            .style("fill", function (d, i) {
                if (d.RPKM > 0) {
                    return colorFunction(getColor(d.data))(d.RPKM)
                    // return colorScale(d.RPKM)
                    // return "#ff0000"
                } else {
                    return "#3232FF"
                }
            })
            .on("mouseover", function(d) {
                // console.log( d3.event.pageX + "px", d3.event.pageY + "px")
                d3.select(this)
                    .attr("width", 5)
                    .attr("height", 35);
                d3.select(this)
                    .style("cursor", "pointer");

                div.transition()
                    .duration(100)
                    .style("opacity", 0.8);

                // div.html("Position : <strong>" + d.start + "</strong><br/>" + "Score : <strong>" + d.RPKM.toFixed(2)) + "</strong>"
                div.html(`<p><span class="font-bold">File:</span> ${d.data}<br/>
                             <span class="font-bold">Position:</span> ${d.start}<br/>
                             <span class="font-bold">Length:</span> ${d.end - d.start}<br/>
                             <span class="font-bold">Score:</span> ${d.RPKM.toFixed(2)}</p>`)
                    .style("left", (d3.event.pageX - 250) + "px")
                    .style("top", (d3.event.pageY - 70) + "px");
                })
            .on("mouseout", function(d) {
                d3.select(this)
                    .attr("width", 1)
                    .attr("height", 25)
                    .style("cursor", "default");
                div.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on("click", function(d){console.log('!');});
            // .on("click", function(d){handleSessionDownload(d)});
  }

  function handleGenomeClick(input) {
      input["chromosome"] = chr;
      dispatch('genome-click', input);
  }

  // function handlePosClick(input) {
  //     console.log(input);
  //     dispatch('genome-click', input);
  // }

</script>

<div>
    <svg bind:this={node} width={width * 4 /Math.pow(10, 6)} height="40">
        <g bind:this={bindHandleZoom}>
            <defs>
                <linearGradient id="MyGradient">
                    <stop offset="5%" stopColor="#99fddd"/>
                    <stop offset="95%" stopColor="#FCBC34"/>
                </linearGradient>
            </defs>
            <text x="10" y="15">{chr}</text>
        </g>
    </svg>
</div>

<div bind:this={tooltip} class="tooltip"></div>

<style>
/*.logo-wrapper svg {*/
/*  fill: green;*/
/*  !* background-color: blueviolet; *!*/
/*} */

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