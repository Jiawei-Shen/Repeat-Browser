<script lang="ts">
  import {afterUpdate, onMount} from 'svelte';
  import Tab, {Icon, Label} from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import { Router, Route, Link, navigate} from "svelte-routing"
  import type, {MenuComponentDev} from '@smui/menu';
  import defaultData from './json/zarr_data_0207.json';
  // import defaultData from './json/zarr_data_1027.json';
  import {getZarrParameters} from './api/inputdata';
  import DataTable from './examples/DataTab.svelte'
  import {TabContent, TabPane} from 'sveltestrap';

  import {Cart} from "./stores/CartStore";
  import DataTab from "./examples/DataTab.svelte";
  import Homepage from "./examples/Homepage.svelte";
  import { Router, Route, Link } from "svelte-navigator";
  // import ZoomableSunburst from "./examples/ZoomableSunburst.svelte";
  import Zoom_Sunburst from "./examples/Zoom_Sunburst.svelte";
  import Tutorial from "./ui/Tutorial.svelte";

  let dataInStore;
  let repeatsInStore;
  let mode = 'files';

  const unsubscribe = Cart.subscribe(store => {
    const {data, repeats} = store;
    dataInStore = data;
    repeatsInStore = repeats;
    // console.log(data);
  });

  const data_test = defaultData.data.map(async x => {
    const _ = await getZarrParameters(x.Zarr).then(d => d);
    return Promise.resolve(_)
  })

  afterUpdate(() => {
    if (localStorage.Cart && JSON.parse(localStorage.Cart).data.length > 0) {
      console.log(JSON.parse(localStorage.Cart))
      let {data, repeats} = JSON.parse(localStorage.Cart)
      Cart.addDataItems(data);
      Cart.addRepeats(repeats);
    } else {
      Cart.addDataItems(defaultData.data);
      Cart.addRepeats(defaultData.repeats);
    }
  })

  let iconTabs = [
    {
      k: 0,
      icon: "home",
      label: "Homepage"
    },
    {
      k: 4,
      icon: "toc",
      label: "Repeat Browser"
    },
    {
      k: 7,
      icon: "library_books",
      label: "Tutorial"
    },
    {
      k: 8,
      icon: "help_outline",
      label: "FAQ"
    },
  ];

  let keyedTabsActive = iconTabs[0];
  let combination = undefined;
  let menu: MenuComponentDev;

  function handleHeatmapClick(event) {
    combination = event.detail;
    keyedTabsActive = iconTabs[2];
  }

  function startBrowse(event) {
    keyedTabsActive = iconTabs[2];
  }


  function ModeChangeExperiments(event) {
    if (mode != 'experiments') {
      mode = 'experiments'
      Cart.addDataItems([]);
    }
  }

  function ModeChangeFiles(event) {
    if (mode != 'files') {
      mode = 'files'
      Cart.addDataItems([]);
    }
  }

  $: if (keyedTabsActive==iconTabs[1]) {navigate('/visual');}

</script>

<style>
  .menu-cell {
    height: 50px;
    display: flex;
    background-color: #fff;
  }

  /*.demo-cell{*/
  /*  background-color: #fff;*/
  /*}*/

  Modal {
    width: 80%;
    margin-left: 40%;
  }

  section > div {
    margin-bottom: 40px;
  }

  .main-body {
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 1rem;
  }

  .browser-body{
    width: 98%;
    margin-left: 1%;
    margin-right: 1%;
    margin-top: 1rem;
  }

  .tab-bar {
    width: 100%;
  }

  .heatmap-hide {
    display: none;
  }

  .svg-box {
    width: 100%;
    height: 10%;
    position: relative;
  }

</style>

<!--<Header/>-->
<div id="container"></div>


<div>

  <div class="main-body">
    {#if keyedTabsActive.k === 0}
      <Homepage bind:browse={keyedTabsActive}/>
    {/if}
  </div>

<!--  <div class="browser-body">-->
<!--    {#if keyedTabsActive.k === 4}-->
<!--      <Browser />-->
<!--    {/if}-->
<!--  </div>-->

  <div class="browser-body">
    {#if keyedTabsActive.k === 7}
      <Tutorial />
    {/if}
  </div>



</div>