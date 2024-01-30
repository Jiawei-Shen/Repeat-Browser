<script>
  import {onMount, onDestroy, getContext, afterUpdate} from "svelte";
  import {fetchConsensusData, fetchConsensusDatabyZarr} from "./utils";
  import PlotlyAreaChart from "../../examples/PlotlyAreaChart.svelte";
  import ConsensusAddTrackModal from "../../ui/concensusAddTrackModal.svelte";
  import AddTrack from "../../ui/addTrack.svelte";
  import DataCenter from '../../DataCenter.svelte';
  import Modal from '../../ui/Modal_1_3.svelte';
  import PlotTrack from "../../examples/PlotlyTrack.svelte";
  import RangeSlider from "../../examples/rangeSlider.svelte";
  import RangeRuler from  "../../examples/rangeRuler.svelte";
  import LinearProgress from "../../ui/LinearProgress.svelte";
  import hg38GenomeCopydensity from "../../json/hg38GenomeCopyDensity.json"
  import mm10GenomeCopydensity from "../../json/mm10GenomeCopyDensity.json"
  import debug_data from "../../json/subfam_stat_debug.json";
  import {Cart, consensusModal} from '../../stores/CartStore';
  import PlotlyTrack from "../../examples/PlotlyTrack.svelte";

  let loaded = false;
  let maxValue;
  let theError = undefined;
  let y_range;
  let y_range_plus;
  let y_range_minus;
  let y_genomecopy_range;
  let trackIndex = 0;
  // let consensusData = undefined;
  let consensusData_list = [];
  export let combination;
  // console.log(combination);

  const SUBFAM = "LTR48B";
  let repeatName;
  let genomeCopyDense;

  let selectedRange;

  function getRange(event) {
    selectedRange = event.detail.range;
    return event.detail.range
  }

  onMount(async () => {
    const {data, repeat} = combination;
    repeatName = repeat;
    const dataFile = $Cart.data.filter(file => file.id === data);
    if(typeof mm10GenomeCopydensity[repeat] === 'undefined'){
      genomeCopyDense = hg38GenomeCopydensity[repeat];
    } else {
      genomeCopyDense = mm10GenomeCopydensity[repeat];
    }
    try {
      // const res = await fetchConsensusData(dataFile, repeat);
      // const debug_file = debug_data.files;
      // console.log(dataFile);

      console.log(dataFile, repeat, genomeCopyDense.length);
      let res = await fetchConsensusDatabyZarr(dataFile, repeat, genomeCopyDense.length);
      console.log(res);
      Cart.updateConsensusTrack(res);



      maxValue = parseInt(Math.max(...res.map(x => x.maxValue)) * 1.1);
      console.log(maxValue);
      y_genomecopy_range = parseInt(1.1 * Math.max(...[].concat(...genomeCopyDense.map(Number))));
      loaded = true;

      // if (res[0].fileName.includes('RNA-seq')){
      //   // const signal_value_plus = res[0].all_plus.map(x => x.score);
      //   // const signal_value_minus = res[0].all_minus.map(x => x.score);
      //   // console.log(signal_value, genomeCopyDense.map(Number))
      //   // res.forEach(d =>{
      //   //   d["y_range_plus"] = parseInt(1.1 * Math.max(...[].concat(...signal_value_plus)));
      //   //   d["y_range_minus"] = parseInt(1.1 * Math.max(...[].concat(...signal_value_minus)));
      //   // })
      //   // Cart.updateConsensusTrack(res);
      //   // y_range_plus = parseInt(1.1 * Math.max(...[].concat(...signal_value_plus)));
      //   // y_range_minus = parseInt(1.1 * Math.max(...[].concat(...signal_value_minus)));
      //   y_genomecopy_range = parseInt(1.1 * Math.max(...[].concat(...genomeCopyDense.map(Number))));
      //   loaded = true;
      // } else {
      //   // const signal_value = res[0].all.map(x => x.score);
      //   // // console.log(signal_value, genomeCopyDense.map(Number))
      //   // res.forEach(d =>{
      //   //   d["y_range"] = parseInt(1.1 * Math.max(...[].concat(...signal_value)));
      //   // })
      //   // Cart.updateConsensusTrack(res);
      //   // y_range = parseInt(1.1 * Math.max(...[].concat(...signal_value)));
      //   y_genomecopy_range = parseInt(1.1 * Math.max(...[].concat(...genomeCopyDense.map(Number))));
      //   loaded = true;
      // }
      // Cart.consensuslist = res;
      // const signal_value = Cart.consensuslist[0].all.map(x => x.score);
      // // console.log(signal_value, genomeCopyDense.map(Number))
      // Cart.consensuslist.forEach(d =>{
      //   d["y_range"] = parseInt(1.1 * Math.max(...[].concat(...signal_value)));
      // })
      // console.log(Cart.consensuslist)

    } catch (error) {
      console.log(error);
      theError = error.message;
      loaded = false;
    }
  });

  $: yRange = parseInt(1.1 * Math.max(...$Cart.consensuslist.map(x => x.y_range)));
  $: console.log(yRange);

  // afterUpdate(()=>{
  //   console.log(Cart.consensuslist);
  // })

</script>



{#if loaded}
  <h5 class="mb-2 p-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Consensus View: {repeatName}</h5>
  <div class="flex flex-wrap">

<!--      <div class="w-full lg:w-9/12 px-4">-->
      <div class="w-full px-4">
        <div class="flex justify-center w-full">
          <div class="block p-6 rounded-lg shadow-lg bg-white max-w-sm w-full px-4">
            <div class="border border-black">
              <div class="flex flex-col justify-center items-center">
                <RangeRuler on:range={getRange} inputRange={genomeCopyDense.length}
                             inputData={genomeCopyDense.map(Number)} repeatName={repeatName}/>
<!--                <RangeSlider on:range={getRange} inputRange={genomeCopyDense.length}-->
<!--                             inputData={genomeCopyDense.map(Number)}/>-->
              </div>
              <PlotlyTrack consensusData={[genomeCopyDense.map(Number), genomeCopyDense.map(Number)]} data={"Genome Coverage"}
                           repeat={""} yrange={y_genomecopy_range} selectrange={selectedRange} index=0 />
              {#key $Cart.consensuslist.length}
                {#each $Cart.consensuslist as consensusData, index}
                  {#if consensusData.fileName.includes("RNA-seq")}
                    <PlotlyAreaChart consensusData={[consensusData.all_plus, consensusData.unique_plus]} data={consensusData.fileId} name={consensusData.fileName + "(+ strand)"}
                                     repeat={combination.repeat} yrange={maxValue} selectrange={selectedRange} index={index}+1 />
                    <PlotlyAreaChart consensusData={[consensusData.all_minus, consensusData.unique_minus]} data={consensusData.fileId} name={consensusData.fileName + "(- strand)"}
                                     repeat={combination.repeat} yrange={maxValue} selectrange={selectedRange} index={index}+2 />
                  {:else}
                    <PlotlyAreaChart consensusData={[consensusData.all, consensusData.unique]} data={consensusData.fileId} name={consensusData.fileName}
                                     repeat={combination.repeat} yrange={maxValue} selectrange={selectedRange} index={index}+1 />
                  {/if}
<!--                    <PlotlyAreaChart consensusData={[consensusData.all, consensusData.unique]} data={consensusData.fileId} name={consensusData.fileName}-->
<!--                                 repeat={combination.repeat} yrange={yRange} selectrange={selectedRange} index={index}+1 />-->
<!--                  <PlotlyAreaChart consensusData={[consensusData.all, consensusData.unique]} data={consensusData.fileId} name={consensusData.fileName}-->
<!--                                   repeat={combination.repeat} yrange={consensusData.y_range} selectrange={selectedRange} index={index}+1 />-->
                {/each}
              {/key}

              <Modal show={$consensusModal}>
                <AddTrack repeat={combination.repeat}/>
              </Modal>

            </div>
          </div>
        </div>
      </div>

      <div class="w-full mt-16 px-4">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg w-full">
          <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">
            <i class="fa fa-fw fa-eye pr-6 pl-2"></i>
            Guidance
          </h5>
        </div>
      <div class="px-4 py-2 max-w-sm p-6 bg-white border border-gray-200 rounded-b shadow-md dark:bg-gray-800 dark:border-gray-700">
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
          The consensus view is the enrichment of the selected file on the consensus region of the selected subfamily.
        </p>
<!--        <a href="#" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white bg-lightBlue-600 rounded-lg hover:bg-lightBlue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">-->
<!--          Read more-->
<!--          <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>-->
<!--        </a>-->
      </div>
    </div>
  </div>
{:else if theError !== undefined}
<!--  <p>{theError}</p>-->
  Sorry, this repeat doesn't have the consensus view.
{:else}
  <LinearProgress />
{/if}

