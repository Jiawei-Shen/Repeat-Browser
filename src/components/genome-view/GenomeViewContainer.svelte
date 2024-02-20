<script>
  import {afterUpdate, beforeUpdate, onDestroy, onMount} from "svelte";
  import Chromosome, {cutoff, data, datarange} from "./Chromosome.svelte";
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';
  import { Jumper } from 'svelte-loading-spinners';
  import Fab from '@smui/fab';
  import { Svg } from '@smui/common';
  import Modal from '../../ui/Modal_1_3.svelte';
  import AddGenomeCopy from "../../ui/addGenomeCopy.svelte";
  import AddTESubfamily from "../../ui/AddTESubfamily.svelte";
  import Button, { Group, GroupItem, Label, Icon } from '@smui/button';
  import Menu from '@smui/menu';
  import List, { Item, Separator} from '@smui/list';
  import uuid from "uuid";
  import LinearProgress from "../../ui/LinearProgress.svelte";
  import { Cart, genomeModal, TEModal} from "../../stores/CartStore";
  import { createSession } from './createSession';
  import debug_data from "../../json/subfam_stat_debug.json";
  import { filterDataAboveCutoff } from "./helper";
  import { fetchRPKMTabixChrAll, getZarrLoci } from "./helper-flat";
  import fileDownload from 'js-file-download';
  import { getContext } from 'svelte';
  import DataAxis from "./DataAxis.svelte";
  import multiTEDataAxis from "./multiTEDataAxis.svelte";
  import Chip, { Set as Sets, TrailingAction, Text } from '@smui/chips';
  import annotations from "../../json/SRR562646.json";
  import chromosomes from "../../json/chromosomes.json";
  import * as d3 from "d3";
  import ElementScreenshot from '../../examples/ElementScreenshot.svelte';

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
  let TEChips = new Set();
  let keyedTE = []

  let ideogram_checked=false;

  // let data;
  let cutoff_value=0;
  let genomeSelectMode=false;
  let dataRange;

  function wait(milliseconds) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }

  let chromoValue = 'chr1';
  let clicked = 0;
  let menu;

  function handleSliderValue(value) {
    sliderValue = value.detail;
  }

  function handleDownload() {
    const UUID = uuid.v4();
    let selectedData = filterDataAboveCutoff(data, sliderValue);

    //   fileDownload(sessionFile, `${UUID}_region_sets.json`);
  }

  function specyToAssembly(inputSpecy) {
    let returnAssembly;
    // let organism;
    if ((inputSpecy === 'hg38') || (inputSpecy === 'GRCh38')){
      // organism = 'human'
      returnAssembly = 'GRCh38'
    } else if((inputSpecy === 'hg19') || (inputSpecy === 'GRCh37')){
      returnAssembly = 'GRCh37'
      // organism = 'human'
    } else if((inputSpecy === 'mm10') || (inputSpecy === 'mm9')){
      // organism = 'mouse'
      returnAssembly = inputSpecy
    }
    return returnAssembly
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

  function colorFunction(color, range) {
    return d3.scaleLinear()
            .domain(range)
            .range(["white", color])
  }

  function generateThresholdsAndReds(numbers, numColors) {
    // Sort the numbers in ascending order
    const sortedNumbers = numbers.sort((a, b) => a - b);

    // Initialize an array to store thresholds and colors
    const thresholds = [];
    const colors = [];

    // Calculate the step size based on the number of colors
    const stepSize = Math.ceil(sortedNumbers.length / numColors);

    // Generate thresholds and assign colors based on percentiles
    for (let i = 1; i < numColors; i++) {
      const index = i * stepSize - 1;
      thresholds.push(sortedNumbers[index]);

      // Calculate color based on the percentage of the threshold
      const percentage = (i / numColors) * 100;
      const color = `rgb(255, ${255 - (percentage * 2.55)}, 0)`;
      colors.push(color);
    }

    const d3Color = colorFunction("red", [thresholds[0], thresholds[thresholds.length - 1]]);
    const colorThresholds = thresholds.map(x => d3Color(x));

    // Add the last color (red)
    colors.push('rgb(255, 0, 0)');

    return { thresholds, colorThresholds };
  }

  function zipArrays(array1, array2) {
    // Ensure both arrays have the same length
    if (array1.length !== array2.length) {
      throw new Error("Arrays must have the same length for zipping.");
    }

    // Zip the arrays together
    const zippedArray = array1.map((element, index) => [element, array2[index]]);

    return zippedArray;
  }

  function ideoFormat(multiTEList, cutoffValue){
    const numberOfTEs = Object.keys(multiTEList).length;
    let ideo_keys = ["name", "start", "length"];
    let ideo_annots = []
    ideo_keys.push(...Object.keys(multiTEList))

    chromosomes.forEach(chr => {
      // let ideo_annots_chrom = []
      let TEIndex = 0;
      let ideoChromValue;
      let ideo_annots_chrom = [];
      for (const key in multiTEList) {

        if (multiTEList.hasOwnProperty(key)) {
          const TEValues = Array(numberOfTEs).fill(0);
          const value = multiTEList[key];
          // console.log(multiTEList);
          // Each value is a TE chromosome list, containing a list of genome copies in a chromosome.
          const listChrom = value.filter(v => v.key === chr);
          if (listChrom.length > 0){
            listChrom[0].values.forEach(copy => {
              if (copy.RPKM > cutoffValue){
                let ideo_value = [key, parseInt(copy.start), copy.end - copy.start];
                TEValues[TEIndex] = copy.RPKM;
                ideo_value.push(...TEValues);
                ideo_annots_chrom.push(ideo_value);
              }
            })
            TEIndex = TEIndex + 1;
          }
        }
        ideoChromValue = {"chr": chr.replace('chr', ''), "annots": ideo_annots_chrom}
        // console.log(ideoChromValue);
      }
      ideo_annots.push(ideoChromValue);
    })

    const ideoAnnotaion = {'keys': ideo_keys, "annots":ideo_annots}

    const threshColorNum = 10;
    let ideo_heatmap = [];
    for (let i = 0; i < numberOfTEs; i++) {
      let heatmap_value = {"key": Object.keys(multiTEList)[i]}
      const annot_TE_value = ideo_annots.map(annot => annot['annots'].map(v => v[i+3])).flat()
      const {thresholds, colorThresholds} = generateThresholdsAndReds(annot_TE_value, threshColorNum);
      // thresholds.push('+');
      heatmap_value["thresholds"] = zipArrays(thresholds, colorThresholds);
      console.log(colorThresholds);
      ideo_heatmap.push(heatmap_value);
    }

    let annotationTracks=[];
    Object.keys(multiTEList).forEach(k => {
      annotationTracks.push({id: k, displayName: k})
    })

    // ideo_heatmap["thresholds"] is an array of arrays [value(float), color(RGB(,,))].
    let ideoLegend = [];
    Object.keys(multiTEList).forEach(k => {
      const ideoThresh = ideo_heatmap.filter(d => d.key === k)[0]['thresholds'];
      console.log(ideo_heatmap.filter(d => d.key === k));
      ideoLegend.push({
        name: k,
        rows: [
                {color: ideoThresh[0][1], name: ideoThresh[0][0]},
                {color: ideoThresh[ideoThresh.length - 1][1], name: ideoThresh[ideoThresh.length - 1][0]}]})
    })

    // sessionFile = createSession($Cart.genomelist, 10, repeat, UUID);
    return {ideoAnnotaion, ideo_heatmap, annotationTracks, ideoLegend}
  }

  onMount(async () => {
    UUID = uuid.v4();
    const { data, repeat } = combination;
    const dataFile = $Cart.data.filter(file => file.id === data);
    specy = dataFile[0].Organism;

    try {
      // dataToRender = await fetchRPKMTabixChrAll(data, repeat, URL);
      dataToRender = await getZarrLoci(repeat, dataFile);
      if (dataToRender.some(obj => obj.values.length >= 1000)) {
        alert('Data Limit Exceeded! We will only retain the top 1000 genome copies per chromosome.');
      }
      console.log(dataToRender);
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
      let initialList = {};
      initialList[repeat] = result
      Cart.updateMultiTEGenomeList(initialList);

      dataRange = findRange($Cart.genomelist);
      let testdatarange = findDataRange($Cart.genomelist, data);

      $Cart.genomelist.forEach(v => {
        // console.log(v);
        v.values.forEach(d =>
        {
          let resultData = $Cart.data.filter(x => x.id == d.data)[0]
          dataChips.add(`${resultData.Assay} in ${resultData.Biosample}, Target: ${resultData.Target}. (${resultData.id})`)
        })
      })
      keyed = [];
      dataChips.forEach(d => keyed=[...keyed, {k: keyed.length + 1, v: d}])

      let TESubfamilies = Object.keys($Cart.multiTEGenomeList);
      TESubfamilies.forEach(v => {
        let resultData = $Cart.repeats.filter(x => x.name == v)[0];
        TEChips.add(`${v} >> ${resultData.family} >> ${resultData.class}`)
      })
      keyedTE = [];
      TEChips.forEach(d => keyedTE=[...keyedTE, {k: keyedTE.length + 1, v: d}]);
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

    dataChips = new Set()

    $Cart.genomelist.forEach(v => {
      // console.log(v);
      v.values.forEach(d =>
      {
        let resultData = $Cart.data.filter(x => x.id == d.data)[0];
        dataChips.add(`${resultData.Assay} in ${resultData.Biosample}, Target: ${resultData.Target}. (${resultData.id})`)
      })
    })
    keyed = [];
    dataChips.forEach(d => keyed=[...keyed, {k: keyed.length + 1, v: d}]);

    let TESubfamilies = Object.keys($Cart.multiTEGenomeList);
    TEChips = new Set()

    TESubfamilies.forEach(v => {
      let resultData = $Cart.repeats.filter(x => x.name == v)[0];
      // TEChips.add(`${v} >> ${resultData.family}, Target: ${resultData.class}`)
      TEChips.add(`${v} >> ${resultData.family} >> ${resultData.class}`)
    })
    keyedTE = [];
    TEChips.forEach(d => keyedTE=[...keyedTE, {k: keyedTE.length + 1, v: d}]);

    dataRange = findRange($Cart.genomelist)

    const {ideoAnnotaion, ideo_heatmap, annotationTracks, ideoLegend}  = ideoFormat($Cart.multiTEGenomeList, cutoff_value)
    console.log(cutoff_value, ideoAnnotaion);
    // console.log(ideo_format);

    // var annotationTracks = [
    //   {id: 'expressionLevelTrack', displayName: 'Expression level'},
    //   {id: 'geneTypeTrack', displayName: 'Gene type'},
    // ];

    var legend = [
      // {
      //     name: 'Expression level',
      //     rows: [
      //         {color: '#88F', name: 'Low'},
      //         {color: '#CCC', name: 'Medium'},
      //         {color: '#F33', name: 'High'}
      //     ]
      // },
      // {
      //     name: 'Gene type',
      //     rows: [
      //         {color: '#00F', name: 'mRNA'},
      //         {color: '#0AF', name: 'misc_RNA'},
      //         {color: '#AAA', name: 'miRNA'},
      //         {color: '#FA0', name: 'tRNA'},
      //         {color: '#F00', name: 'lncRNA'}
      //     ]
      // }
    ]

    // var heatmaps = [
    //   {
    //     key: 'LTR13',
    //     thresholds: [
    //       ['2', '#88F'],
    //       ['4', '#CCC'],
    //       ['+', '#F33']]
    //   },
    //   {
    //     key: 'MER11C',
    //     thresholds: [
    //       ['0', '#00F'],
    //       ['1', '#0AF'],
    //       ['2', '#AAA'],
    //       ['3', '#FA0'],
    //       ['4', '#F00']
    //     ]
    //   }
    // ]

    var config = {};
    if ((specy === 'hg38') || (specy === 'GRCh38')){
      config = {
        container: '#genometracks',
        organism: 'human',
        assembly: 'GRCh38',
        chrHeight: 600,
        // annotationsPath: '/SRR562646.json',
        // annotations: annotations,
        annotations: ideoAnnotaion,
        annotationsLayout: 'heatmap',
        legend: ideoLegend,
        heatmaps: ideo_heatmap,
        annotationTracks: annotationTracks,
        // onDidRotate: ()=>{alert('hello!')}
        rotatable: false // Support for rotatable heatmaps is planned
      };

    } else if((specy === 'hg19') || (specy === 'GRCh37')){
      config = {
        container: '#genometracks',
        organism: 'human',
        assembly: 'GRCh37',
        chrHeight: 600,
        // annotationsPath: '/SRR562646.json',
        // annotations: annotations,
        annotations: ideoAnnotaion,
        annotationsLayout: 'heatmap',
        legend: ideoLegend,
        heatmaps: ideo_heatmap,
        annotationTracks: annotationTracks,
        // onDidRotate: ()=>{alert('hello!')}
        rotatable: false // Support for rotatable heatmaps is planned
      };
    } else if((specy === 'mm10') || (specy === 'mm9')){
      config = {
        container: '#genometracks',
        organism: 'mouse',
        // assembly: 'GRCh38',
        chrHeight: 600,
        // annotationsPath: '/SRR562646.json',
        // annotations: annotations,
        annotations: ideoAnnotaion,
        annotationsLayout: 'heatmap',
        legend: ideoLegend,
        heatmaps: ideo_heatmap,
        annotationTracks: annotationTracks,
        // onDidRotate: ()=>{alert('hello!')}
        rotatable: false // Support for rotatable heatmaps is planned
      };
    }

    // var config = {
    //   container: '#genometracks',
    //   organism: 'human',
    //   assembly: 'GRCh38',
    //   chrHeight: 600,
    //   // annotationsPath: '/SRR562646.json',
    //   // annotations: annotations,
    //   annotations: ideoAnnotaion,
    //   annotationsLayout: 'heatmap',
    //   legend: legend,
    //   heatmaps: ideo_heatmap,
    //   annotationTracks: annotationTracks,
    //   // onDidRotate: ()=>{alert('hello!')}
    //   rotatable: false // Support for rotatable heatmaps is planned
    // };

    var ideogram = new Ideogram(config);
  })

  const { open } = getContext('simple-modal');

  const showModal = (event) => {
    const assembly = specyToAssembly(specy);
    open(DataAxis, {data: event.detail, repeat: combination.repeat, specy: assembly});
  };

  const showModalMultiTE = (chr) => {
    let multiTEData=[];
    let mappedmultiTEData = [];
    const assembly = specyToAssembly(specy);
    console.log(specy);
    for (const key in $Cart.multiTEGenomeList) {
      if ($Cart.multiTEGenomeList.hasOwnProperty(key)) {
        const value = $Cart.multiTEGenomeList[key];
        const valueChromo = value.filter(v => v.key === chr)
        if (valueChromo.length > 0){
          const filteredValue = valueChromo[0].values.filter(v => v.RPKM > cutoff_value);
          const mappedValue = filteredValue.map(v => {
            v['TE'] = key;
            return v
          })
          multiTEData.push(...mappedValue)
        }
      }
    }
    console.log(multiTEData);
    open(multiTEDataAxis, {data: multiTEData, repeat: combination.repeat, specy: assembly, selectedChromosome: chr});
  };

  async function removeFile(fileName) {
    let newGenomeList = $Cart.genomelist;
    // Split the string based on parentheses
    const parts = fileName.split(/[()]/);

    // Extract the value inside parentheses
    const ID = parts[1].trim();
    newGenomeList.forEach(chr => {
      chr.values = chr.values.filter(d => ID != d.data)
    })
    // newGenomeList.forEach(chr => {
    //   chr.values = chr.values.filter(d => Assay != d.Assay)
    // })
    await wait(500);
    Cart.updateGenomeView(newGenomeList);
  }

  async function removeTE(TEname) {
    let TEKey =  TEname.split(" >> ")[0];
    let filteredDictionary = {};
    let originalDictionary = $Cart.multiTEGenomeList;
    // filteredDictionary = originalDictionary.filter(d => d.key != TEKey);
    // Cart.updateMultiTEGenomeList(filteredDictionary);

    console.log($Cart.multiTEGenomeList);
    Object.keys(originalDictionary).forEach((key) => {
      if (key != TEKey) {
        filteredDictionary[key] = originalDictionary[key];
      }
    });
    console.log(filteredDictionary);
    await wait(500);
    Cart.updateMultiTEGenomeList(filteredDictionary);

  }

  // $: ideo_format = ideoFormat($Cart.multiTEGenomeList)

</script>

<div>
  {#if loaded}
    <h5 class="flex items-center p-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
      Genome View({specy}): {combination.repeat}
      {#if ideogram_checked}
        <ElementScreenshot elementID="genometracks"/>
      {:else}
        <ElementScreenshot elementID="genomeViewData"/>
      {/if}
    </h5>

    <div class="flex flex-wrap w-full">
      <div class="w-full lg:w-8/12 px-4">
        {#if ideogram_checked}
          <div id="genometracks"></div>
        {:else}
          <div class="flex justify-center w-full" id="genomeViewData">
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
        {/if}
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
          <hr />
          <span>Simple Version or With Ideogram</span>
          <FormField>
            <Switch bind:checked={ideogram_checked} icons={false} />
            <span slot="label">With ideogram.</span>
          </FormField>

          <hr/>
          {#if !ideogram_checked}
          <span>Add the Data</span>
          <Modal show={$genomeModal}>
            <AddGenomeCopy repeat={combination.repeat} specy={specy}/>
          </Modal>

          <div>
            <span>Data Cart:</span>
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
          {:else }
            <span>Add the TE subfamily</span>
            <Modal show={$TEModal}>
              <AddTESubfamily data={combination.data} specy={specy}/>
            </Modal>
            <span>TE Subfamily Cart:</span>
            <Sets chips={keyedTE} let:chip key={(chip) => chip.k} input>
              <Chip {chip}>
                <Text>{chip.v}</Text>
                {#if keyedTE.length > 1}
                  <TrailingAction icon$class="material-icons"
                                  on:click={() => removeTE(chip.v)}>
                    cancel
                  </TrailingAction>
                {/if}
              </Chip>
            </Sets>
          {/if}
          <hr/>
          {#if ideogram_checked}
            <Group variant="raised">
            <Button on:click={() => clicked++} variant="raised">
              <Label>Go to the detailed view.</Label>
            </Button>
            <div use:GroupItem>
              <Button
                      on:click={() => menu.setOpen(true)}
                      variant="raised"
                      style="padding: 0; min-width: 36px;"
              >
                <Icon class="material-icons" style="margin: 0;">arrow_drop_down</Icon>
              </Button>
              <Menu bind:this={menu} anchorCorner="TOP_LEFT">
                <List>
                  {#each chromosomes as chr}
                    <Item on:SMUI:action={() => showModalMultiTE(chr)}>
                      <Text>{chr}</Text>
                    </Item>
                  {/each}
                </List>
              </Menu>
            </div>
          </Group>
          {/if}

<!--          <p>Click the red genome on the genome bar to jump to the WashU Epigenome Browser.</p>-->
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