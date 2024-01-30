<script>
  import {afterUpdate, beforeUpdate, onMount} from "svelte";
  import Chromosome, {cutoff, data} from "./Chromosome.svelte";
  import { Jumper } from 'svelte-loading-spinners';
  import SegmentedButton, {
    Segment,
    Icon,
  } from '@smui/segmented-button';
  import Fab from '@smui/fab';
  import { Svg } from '@smui/common';
  import Modal from '../../ui/Modal_1_3.svelte';
  import AddGenomeCopy from "../../ui/addGenomeCopy.svelte";
  import Slider from "../../ui/Slider.svelte";
  import Button, { Label } from '@smui/button';
  import uuid from "uuid";
  import LinearProgress from "../../ui/LinearProgress.svelte";
  import { Cart, genomeModal } from "../../stores/CartStore";
  import { createSession } from './createSession';
  import debug_data from "../../json/subfam_stat_debug.json";
  import { filterDataAboveCutoff } from "./helper";
  import { fetchRPKMTabixChrAll, getZarrLoci } from "./helper-flat";
  import fileDownload from 'js-file-download';
  import { getContext } from 'svelte';
  import DataAxis from "./DataAxis.svelte";
  import Chip, { Set as Sets, TrailingAction, Text } from '@smui/chips';

  //let { experiment, subfam } // comes from URL params
  const experiment = "ENCSR658AGP";
  const subfam = "LTR48B";
  let specy = "GRCh38";
  const DATAHUB_MONGO_API =
    "https://5dum6c4ytb.execute-api.us-east-1.amazonaws.com/dev/datahub";
  let dataToRender;
  let loaded = false;
  let error = undefined;
  let sliderValue = 0;
  export let combination;
  let sessionFile = undefined;
  let UUID;
  let jumpingtoBrowser = false;
  let dataChips = new Set();
  let keyed = []

  // let data;
  let cutoff_value=0;
  let genomeSelectMode=false;
  let dataRange;


  function handleSliderValue(value) {
    sliderValue = value.detail;
  }

  function handleDownload() {
    const UUID = uuid.v4();
    let selectedData = filterDataAboveCutoff(data, sliderValue);

    //   fileDownload(sessionFile, `${UUID}_region_sets.json`);
  }

  async function handleSessionDownload() {
    const url_submit="https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/";
    jumpingtoBrowser = true;
    let form = {
      "_id": `${UUID}`,
      "hub": {
        "content": JSON.parse(sessionFile)
      }
    }
    let jsonForm = JSON.stringify(form)
    await fetch(url_submit, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: jsonForm,
    }).then(()=>{
      jumpingtoBrowser = false;
      window.open(`http://epigenomegateway.wustl.edu/browser/?sessionFile=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${UUID}`, '_blank').focus()
    })
  }

  async function altertSelectGenome(){
    alert("Please click the interested genome and jump to the WashU Epigenome Browser.");
    genomeSelectMode = true;
  }

  function findRange(data) {
    let rangeList = data.map(x => {
      let xMax = Math.max(...x.values.map(d => d.RPKM));
      let xMin = Math.min(...x.values.map(d => d.RPKM));
      return [xMin, xMax]
    })
    let dataMax = Math.max(...rangeList.map(x => x[1]))
    let dataMin = Math.min(...rangeList.map(x => x[0]))
    return [dataMin, dataMax]
  }

  function findDataRange(dataList, dataName) {
    let data = dataList;
    data.forEach(chr => {
      chr.values.filter(x => x.data == dataName)
    })
    let rangeList = data.map(x => {
      let xMax = Math.max(...x.values.map(d => d.RPKM));
      let xMin = Math.min(...x.values.map(d => d.RPKM));
      return [xMin, xMax]
    })
    let dataMax = Math.max(...rangeList.map(x => x[1]))
    let dataMin = Math.min(...rangeList.map(x => x[0]))
    return [dataMin, dataMax]
  }

  onMount(async () => {
    UUID = uuid.v4();
    const { data, repeat } = combination;
    const dataFile = $Cart.data.filter(file => file.id === data);
    specy = dataFile[0].Organism;

    try {
      // dataToRender = await fetchRPKMTabixChrAll(data, repeat, URL);
      dataToRender = await getZarrLoci(repeat, dataFile);
      if(dataToRender == undefined){
        error = "This data is not included by our browser."
        return
      }
      let result = [];
      dataToRender.forEach(chr => {
        chr.values.forEach(d => d["data"] = data);
        result.push({
          key: chr.key,
          values: chr.values
        });
      });
      Cart.updateGenomeView(result);

      dataRange = findRange($Cart.genomelist);
      let testdatarange = findDataRange($Cart.genomelist, data);

      $Cart.genomelist.forEach(v => {
        // console.log(v);
        v.values.forEach(d =>
        {
          let resultData = $Cart.data.filter(x => x.id == d.data)[0]
          dataChips.add(`${resultData.Assay} in ${resultData.Biosample}, Target: ${resultData.Target}`)
        })
      })
      keyed = [];
      dataChips.forEach(d => keyed=[...keyed, {k: keyed.length + 1, v: d}])

      loaded = true;
      // sessionFile = createSession(result, 10, repeat, UUID);
    } catch (error) {
      console.log(error);
      error = error.message;
      loaded = false;
    }
  });


  afterUpdate(async () => {
    const { data, repeat } = combination;

    while(!loaded){
      let route = new Promise(res => {
        setTimeout(async () => {
          res()
        }, 300) /* <--- If this is enough greater than transition, it doesn't happen... */
      })
      await route;
    }

    $Cart.genomelist.forEach(v => {
      // console.log(v);
      v.values.forEach(d =>
      {
        let resultData = $Cart.data.filter(x => x.id == d.data)[0];
        dataChips.add(`${resultData.Assay} in ${resultData.Biosample}, Target: ${resultData.Target}`)
      })
    })
    keyed = [];
    dataChips.forEach(d => keyed=[...keyed, {k: keyed.length + 1, v: d}])

    dataRange = findRange($Cart.genomelist)
    // sessionFile = createSession($Cart.genomelist, 10, repeat, UUID);
  })

  const { open } = getContext('simple-modal');

  const showModal = (event) => {
    open(DataAxis, {data: event.detail});
  };

  function removeFile(fileName) {
      let newGenomeList = $Cart.genomelist;
      newGenomeList.forEach(chr => {
        chr.values = chr.values.filter(d => fileName != d.data)
      })
      Cart.updateGenomeView(newGenomeList);
  }

</script>

<div>
  {#if loaded}
    <h5 class="mb-2 p-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Genome View({specy}): {combination.repeat}</h5>
    <div class="flex flex-wrap w-full">
      <div class="w-full lg:w-8/12 px-4">
        <div class="flex justify-center w-full">
          <div class="block p-6 bg-gray-50 rounded-lg shadow-lg max-w-sm w-full px-4">
            <!--{#each dataToRender as item, i}-->
            <!--  <Chromosome on:genome-click={showModal} key={item.key} chr={item.key} data={item.values} cutoff={cutoff_value} datarange={dataRange}/>-->
            <!--{/each}-->
            {#each $Cart.genomelist as item, i}
              <Chromosome on:genome-click={showModal} key={item.key} chr={item.key} specy={specy}
                          datalist={item.values} cutoff={cutoff_value} datarange={dataRange}
                          genomeselectmode={genomeSelectMode} repeat={combination.repeat}/>
            {/each}
          </div>
        </div>
      </div>
      <div class="w-full mt-16 lg:w-4/12 px-4 absolute right-0 top-3rem">
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

          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Adjust threshold of the genome view:
          </label>
          <span> Cutoff Threshold: </span>
          <input class="w-16" type=number bind:value={cutoff_value} min=0 max={dataRange[1]}>
          <input class="w-1/3 pl-2" type=range bind:value={cutoff_value} min=0 max={dataRange[1]}>
          <!--        <a href="#" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white bg-lightBlue-600 rounded-lg hover:bg-lightBlue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">-->
          <!--          Read more-->
          <!--          <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>-->
          <!--        </a>-->
          <hr/>
          <div>
          <span>Cart:</span>
          <Sets chips={keyed} let:chip key={(chip) => chip.k} input>
            <Chip {chip}>
              <Text>{chip.v}</Text>
              {#if keyed.length > 1}
                <TrailingAction icon$class="material-icons"
                                on:click={() => removeFile(chip.v)}>
                  cancel
                </TrailingAction>
              {/if}
            </Chip>
          </Sets>
  </div>
          <hr/>

          <Modal show={$genomeModal}>
            <AddGenomeCopy repeat={combination.repeat} specy={specy}/>
          </Modal>

          <p>Click the red genome on the genome bar to jump to the WashU Epigenome Browser.</p>
        </div>
      </div>
    </div>

  {:else if error !== undefined}
    <p>{error}</p>
  {:else}
    <LinearProgress />
  {/if}
</div>


<style>
  :global(.tooltip) {
    position: absolute;
    text-align: center;
    display: flex;
    justify-content: start;
    align-content: center;
    pointer-events: none;
  }
</style>