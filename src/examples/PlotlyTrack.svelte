<script>
  import { onMount, afterUpdate, } from "svelte";
  import Plotly from "plotly.js";
  import RangeSlider from "../examples/rangeSlider.svelte";

  export let consensusData;
  export let data;
  export let repeat;
  export let yrange;
  export let selectrange;
  export let index;

  onMount(() => {
    const all = consensusData[0];
    const unique = consensusData[1];
    const trace1 = {
        y: all.map((d, i) => d),
        x: all.map((d, i) => i),
        fill: "tonexty",
        fillcolor:'#E1B0B0',
        type: "scatter",
        mode: "none",
        name: "All reads",
        line: {
            color: '#E1B0B0'
        },
    };

    // const trace2 = {
    //   y: unique.map((d, i) => d.score),
    //   x: unique.map((d, i) => i),
    //   fill: "tozeroy",
    //   type: "scatter",
    //   mode: "none",
    //   name: 'Unique reads'
    // };

    const layout = {
        modebar: {orientation: 'v'},
        margin: {r: 55, l:35, b: 30, t: 100},
        legend: {x: 0, y: 1},
        // xaxis: {
        //     rangeslider: {}
        // },
        yaxis: {
            range: [0, yrange]
        },
        title: `${repeat} - ${data}`
    };

    // let _data = [trace1, trace2];
      let _data = [trace1]

    Plotly.newPlot("area-div" + index, _data, layout, {displayModeBar: true, displaylogo: false});
  });

  afterUpdate(()=>{
          // console.log(selectrange);
          // const [all, unique] = consensusData;
          const all = consensusData[0];
          const unique = consensusData[1];
          const trace1 = {
              y: all.map((d, i) => d),
              x: all.map((d, i) => i),
              fill: "tonexty",
              fillcolor:'#E1B0B0',
              type: "scatter",
              mode: "none",
              name: "All reads",
              line: {
                  color: '#E1B0B0'
              },
          };

          // const trace2 = {
          //         y: unique.map((d, i) => d.score),
          //         x: unique.map((d, i) => i),
          //         fill: "tozeroy",
          //         type: "scatter",
          //         mode: "none",
          //         name: 'Unique reads'
          // };

          // const layout = {
          //         modebar: {orientation: 'v'},
          //         margin: {r: 70, b: 30, t: 100},
          //         legend: {x: 0, y: 1},
          //         // xaxis: {
          //         //     rangeslider: {}
          //         // },
          //         xaxis:{
          //                 range: selectrange
          //         },
          //         yaxis: {
          //                 range: [0, yrange]
          //         },
          //         title: `${repeat} - ${data}`
          // };
          // let _data = [trace1, trace2];
          //
          // Plotly.newPlot("area-div" + index, _data, layout, {displayModeBar: true, displaylogo: false});

          const layout = {
                  // modebar: {orientation: 'v'},
                  height: 60,
                  // paper_bgcolor:"#A9A9A9",
                  margin: {r: 68, l:60, b: 4, t:5},
                  showlegend: false,
                  // xaxis: {
                  //     rangeslider: {}
                  // },
                  xaxis:{
                      // autorange: true,
                      showgrid: false,
                      zeroline: false,
                      showline: false,
                      autotick: true,
                      ticks: '',
                      showticklabels: false,
                      range: selectrange
                  },
                  yaxis: {
                      showline: true,
                      // showticklabels: false,
                      nticks: 2,
                      tickvals: [0, yrange],
                      linewidth: 2,
                      ticklen: 5,
                      tickwidth: 2,
                      // range: [0, yrange]
                      //     // showticklabels: false,
                      // showline:true,
                      // nticks: 2,
                      // tickvals: [0, yrange],
                      range: [0, yrange]
                  },
                  hovermode: 'x unified',
                  title: false
          };

          // let _data = [trace1, trace2];
          let _data = [trace1];

          Plotly.newPlot("area-div" + index, _data, layout, {displayModeBar: false, displaylogo: false});
  })
</script>

<!--<div id={"area-div"+index} class="relative border-b border-gray-400">-->
<!--    {data}:-->
<!--</div>-->

<div style="display: flex; align-items: flex-start; padding: 5px;" class="border-b border-gray-400">
    <div style="flex: 1; padding-right: 5px; max-width: 65px; font-family:Helvetica Neue, Arial, sans-serif;
    font-size: 12px; font-weight: bold;">
        {data}:
    </div>
    <div id={"area-div" + index} style="flex: 1; text-align: right;"></div>
</div>



