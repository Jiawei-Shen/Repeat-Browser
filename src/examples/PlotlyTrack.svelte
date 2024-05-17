<script>
  import { onMount, afterUpdate, createEventDispatcher} from "svelte";
  import Plotly from "plotly.js";

  export let consensusData;
  export let data;
  export let repeat;
  export let yrange;
  export let selectrange;
  export let index;

  const dispatch = createEventDispatcher();
  let userSelectedColor = '#E1B0B0';

  onMount(() => {
    const all = consensusData[0];
    const unique = consensusData[1];
    const trace1 = {
        y: all.map((d, i) => d),
        x: all.map((d, i) => i),
        fill: "tonexty",
        fillcolor: userSelectedColor,
        type: "scatter",
        mode: "none",
        name: "All reads",
        line: {
            color: 'userSelectedColor'
        },
    };


    const layout = {
        modebar: {orientation: 'v'},
        margin: {r: 55, l:35, b: 30, t: 100},
        legend: {x: 0, y: 1},
        yaxis: {
            range: [0, yrange]
        },
        title: `${repeat} - ${data}`
    };

      let _data = [trace1]

      Plotly.newPlot("area-div" + index, _data, layout).then(chart => {
          chart.on('plotly_relayout', eventData => {
              const selectedRange = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
              dispatch('rangesupdate', { selectedRange });
          });
      });
  });

  afterUpdate(()=>{
          const all = consensusData[0];
          const unique = consensusData[1];
          const trace1 = {
              y: all.map((d, i) => d),
              x: all.map((d, i) => i),
              fill: "tonexty",
              fillcolor: userSelectedColor,
              type: "scatter",
              mode: "none",
              name: "All reads",
              line: {
                  color: userSelectedColor
              },
          };

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
                      fixedrange: true,
                      range: [0, yrange]
                  },
                  hovermode: 'x unified',
                  title: false
          };
          let _data = [trace1];

      Plotly.newPlot("area-div" + index, _data, layout).then(chart => {
          chart.on('plotly_relayout', eventData => {
              const selectedRange = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
              dispatch('rangesupdate', { selectedRange });
          });
      });
  });
</script>

<div style="display: flex; align-items: center; margin-bottom: 20px;">
    <label for="colorPicker" style="margin-right: 10px;">Choose plot color:</label>
    <input id="colorPicker" type="color" bind:value={userSelectedColor}>
</div>

<div style="display: flex; align-items: flex-start; padding: 5px;" class="border-b border-gray-400">
    <div style="flex: 1; padding-right: 5px; max-width: 65px; font-family:Helvetica Neue, Arial, sans-serif;
    font-size: 12px; font-weight: bold;">
        {data}:
    </div>
    <div id={"area-div" + index} style="flex: 1; text-align: right;"></div>
</div>



