<script>
  import { TabContent, TabPane } from 'sveltestrap';
  // const TEST_DATA = require('../json/test.json');
  import { onMount, onDestroy, afterUpdate, createEventDispatcher } from 'svelte';
  import { Cart } from '../stores/CartStore';
  import Plotly from 'plotly.js';
  // import { combination } from '../stores/HeatmapClick';
  import Switch from '../ui/Switch.svelte';
  // let switchBoolean=false;
  let onlyData = undefined;
  let dataLabels;
  export let propsData;
  export let repeatLabels;
  export let scaleMax;
  export let TYPE;
  // let TYPE='all';
  const dispatch = createEventDispatcher();
  // const unsubscribe = Cart.subscribe(async store => {
  //   const { repeats, data } = store;
  //   repeatNames = repeats.map(d => d.name);
  //   dataNames = TEST_DATA['all'].map(d => d.id);
  //   onlyData = extractRequiredDataPoints(repeatNames);
  // });

  onMount(() => {
    dataLabels = propsData[TYPE].map(d => d.id);
    onlyData = extractRequiredDataPoints(propsData, repeatLabels, TYPE);
    console.log(propsData);
    if (onlyData !== undefined) {
      $Cart.scale = Math.max(...[].concat(...onlyData));
      drawHeatMap(onlyData, repeatLabels, dataLabels, $Cart.scale);
    }
  })

  afterUpdate(() => {
      if (onlyData !== undefined) {
        drawHeatMap(onlyData, repeatLabels, dataLabels, scaleMax);
      }
  });

  // onDestroy(unsubscribe);

  function drawHeatMap(z, repeatLabels, dataLabels, scale_max) {
    let myPlot = document.getElementById('myDiv');
    const z_filtered = z.map(array => {
      let new_array = array.map(n => n || 0);
      return new_array
    });
    const zMax = Math.max(...[].concat(...z_filtered));

    const data = [
      {
        z: z,
        x: repeatLabels,
        y: dataLabels,
        type: 'heatmap',
        // colorscale: colorscaleValue,
        showscale: true,
        // zauto: zMax < scale_max ? false : true,
        // zmax: zMax < scale_max ? scaleMax : zMax,
        zauto: false,
        zmax: scaleMax,
        zmin: 0
      }
    ];
    // console.log(z_filtered, scale_max);

    Plotly.newPlot('myDiv', data,
            {
              modebar: {
                // vertical modebar button layout
                orientation: 'v',
                // for demonstration purposes
                // bgcolor: 'salmon',
                // color: 'white',
                // activecolor: '#9ED3CD',
                // margin: {t:40}
              },
              responsive: true,
              margin: { l: 100, b: 50, r: 120, t: 20}},
            {displayModeBar: true, displaylogo: false});

    myPlot.on('plotly_click', function(data){
      var pts = {};
      for(var i=0; i < data.points.length; i++){
          pts.x = data.points[i].x;
          pts.y = data.points[i].y;
      }
      dispatch('heatmap-click', { data: pts.y, repeat: pts.x }); // TODO: a store should be informed about this click so the view can changed
    });
  }

  function extractRequiredDataPoints(DATA, repeats, TYPE) {
    console.log(DATA)
    const toReturn = DATA[TYPE].map(row => {
      let tmp = [];
      repeats.forEach(element => {
        tmp.push(row[element]);
      });
      return tmp;
    });

    if (toReturn[0].length === 0) {
      return undefined;
    } else {
      return toReturn;
    }
  }
</script>

<!--<style>-->
<!--  #myDiv {-->
<!--    margin: 2rem;-->
<!--    padding-left: 2rem;-->
<!--  }-->
<!--</style>-->

<div>
  <div id="myDiv"></div>
  <!-- <Switch bind:checked={switchBoolean}></Switch> -->
</div>

