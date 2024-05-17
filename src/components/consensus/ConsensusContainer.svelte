<script>
  import {onMount} from "svelte";
  import {fetchConsensusDatabyZarr} from "./utils";
  import PlotlyAreaChart from "../../examples/PlotlyAreaChart.svelte";
  import AddTrack from "../../ui/addTrack.svelte";
  import Modal from '../../ui/Modal_1_3.svelte';
  import RangeRuler from  "../../examples/rangeRuler.svelte";
  import LinearProgress from "../../ui/LinearProgress.svelte";
  import {Cart, consensusModal} from '../../stores/CartStore';
  import PlotlyTrack from "../../examples/PlotlyTrack.svelte";
  import ElementScreenshot from '../../examples/ElementScreenshot.svelte';

  let loaded = false;
  let maxValue;
  let theError = undefined;
  let y_range;

  let y_genomecopy_range;
  let trackIndex = 0;
  export let combination;

  let repeatName;
  let genomeCopyDense;

  let selectedRange;

  function handleRangeUpdate(event) {
    selectedRange = event.detail.selectedRange;
    // Now `selectedRange` will reflect the updated x-axis range
    // You can use this updated `selectedRange` as needed within this component
  }

  function getRange(event) {
    selectedRange = event.detail.range;
    return event.detail.range
  }

  async function fetchJsonData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null; // Return null or appropriate error handling
    }
  }

  let hg38GenomeCopydensity;
  let mm10GenomeCopydensity;

  onMount(async () => {
    hg38GenomeCopydensity = await fetchJsonData("https://wangftp.wustl.edu/~jshen/rb_GenomeCopyDense/hg38GenomeCopyDensity.json");
    mm10GenomeCopydensity = await fetchJsonData("https://wangftp.wustl.edu/~jshen/rb_GenomeCopyDense/mm10GenomeCopyDensity.json");

    const {data, repeat} = combination;
    repeatName = repeat;
    const dataFile = $Cart.data.filter(file => file.id === data);
    if(typeof mm10GenomeCopydensity[repeat] === 'undefined'){
      genomeCopyDense = hg38GenomeCopydensity[repeat];
    } else {
      genomeCopyDense = mm10GenomeCopydensity[repeat];
    }
    try {
      let res = await fetchConsensusDatabyZarr(dataFile, repeat, genomeCopyDense.length);
      Cart.updateConsensusTrack(res);

      maxValue = parseInt(Math.max(...res.map(x => x.maxValue)) * 1.1);
      y_genomecopy_range = parseInt(1.1 * Math.max(...[].concat(...genomeCopyDense.map(Number))));
      loaded = true;

    } catch (error) {
      console.log(error);
      theError = error.message;
      loaded = false;
    }
  });

  $: yRange = parseInt(1.1 * Math.max(...$Cart.consensuslist.map(x => x.y_range)));
  $: console.log(yRange);

</script>



{#if loaded}
  <h5 class="flex items-center p-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    Consensus View: {repeatName}
    <ElementScreenshot elementID="consensusView"/>
  </h5>
  <div class="flex flex-wrap">

      <div class="w-full px-4">
        <div class="flex justify-center w-full">
          <div class="block p-6 rounded-lg shadow-lg bg-white max-w-sm w-full px-4">
            <div class="border border-black">
              <div class="border border-black" id="consensusView">
                <div class="flex flex-col justify-center items-center">
                  <RangeRuler on:range={getRange} inputRange={genomeCopyDense.length}
                               inputData={genomeCopyDense.map(Number)} repeatName={repeatName}/>
                </div>
                <PlotlyTrack on:rangesupdate={handleRangeUpdate} consensusData={[genomeCopyDense.map(Number), genomeCopyDense.map(Number)]} data={"Genome Coverage"}
                             repeat={""} yrange={y_genomecopy_range} selectrange={selectedRange} index=0 />
                {#key $Cart.consensuslist.length}
                  {#each $Cart.consensuslist as consensusData, index}
                    {#if consensusData.fileName.includes("RNA-seq") || consensusData.fileName.includes("Cage")}
                      <PlotlyAreaChart on:rangeupdate={handleRangeUpdate} consensusData={[consensusData.all_plus, consensusData.unique_plus]} data={consensusData.fileId} name={consensusData.fileName + "(+ strand)"}
                                       repeat={combination.repeat} yrange={maxValue} selectrange={selectedRange} index={index}+1 />
                      <PlotlyAreaChart on:rangeupdate={handleRangeUpdate} consensusData={[consensusData.all_minus, consensusData.unique_minus]} data={consensusData.fileId} name={consensusData.fileName + "(- strand)"}
                                       repeat={combination.repeat} yrange={maxValue} selectrange={selectedRange} index={index}+2 />
                    {:else}
                      <PlotlyAreaChart on:rangeupdate={handleRangeUpdate} consensusData={[consensusData.all, consensusData.unique]} data={consensusData.fileId} name={consensusData.fileName}
                                       repeat={combination.repeat} yrange={maxValue} selectrange={selectedRange} index={index}+1 />
                    {/if}
                  {/each}
                {/key}
              </div>
              <Modal show={$consensusModal}>
                <AddTrack repeat={combination.repeat} hg38CopyDense={hg38GenomeCopydensity}/>
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

      </div>
    </div>
  </div>
{:else if theError !== undefined}
  Sorry, this repeat doesn't have the consensus view.
{:else}
  <LinearProgress />
{/if}

