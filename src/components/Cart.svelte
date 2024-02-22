<script lang="ts">
  import {Label} from "@smui/list";
  import { Cart } from "../stores/CartStore.js";
  import Fab, { Icon } from '@smui/fab';
  import {onDestroy, onMount} from "svelte";
  import VirtualList from 'svelte-tiny-virtual-list';
  import IconButton from '@smui/icon-button';
  import {MenuComponentDev} from '@smui/menu';
  import fileDownload from 'js-file-download';
  import { v4 as uuidv4 } from 'uuid';

  let selectionIndex = null;
  let selectionTwoLine = "Stephen Hawking";
  let cartData;
  let cartRepeats;
  let cartBiosample;
  let menu: MenuComponentDev;
  let mode = 'files';
  let sessionFile;
  let UUID;

  function ModeChangeExperiments(event){
    if(mode != 'experiments'){
      mode = 'experiments'
      Cart.addDataItems([]);
    }
  }

  function ModeChangeFiles(event){
    if(mode != 'files'){
      mode = 'files'
      Cart.addDataItems([]);
    }
  }

  function handleSessionDownload(){
    // console.log(sessionFile);
    // sessionFile = `{"species": ${JSON.stringify(cartSpecies)}, "data": ${JSON.stringify(cartData)}, "repeats": ${JSON.stringify(cartRepeats)}}`;
      sessionFile = `{"species": "${cartBiosample}", "data": ${JSON.stringify(cartData)}, "repeats": ${JSON.stringify(cartRepeats)}}`.replace('"', '\"');;
      fileDownload(sessionFile, `${UUID}_data_repeats.json`);
      console.log(sessionFile);
  }

  function creaseSessionJson(data, repeats){
    // console.log(JSON.stringify(data));
    // const stringData = data.map(d => JSON.stringify(d));
    // const stringData = data.map(d => JSON.stringify(d));
  }

  function showConfirmationRemoveData() {
      const result = window.confirm('Do you want to remove all data?');

      if (result) {
          Cart.addDataItems([]);
      }
  }

  function showConfirmationRemoveRepeats() {
      const result = window.confirm('Do you want to remove all repeats?');

      if (result) {
          Cart.addRepeats([]);
      }
  }


  const unsubscribe = Cart.subscribe(async store => {
    const { data, repeats, biosample } = store;
    cartData = data;
    cartRepeats = repeats;
    cartBiosample = biosample;
    sessionFile = `{"species": ${cartBiosample}, "data": ${JSON.stringify(cartData)}, "repeats": ${JSON.stringify(cartRepeats)}}`;
    // creaseSessionJson(data, repeats);
    console.log(`species: ${cartBiosample}, data: ${data}`);
  });

  onMount(async () => {
    UUID = uuidv4();
    console.log(UUID);
  })

  onDestroy(() => {
    unsubscribe();
  });
</script>

<style>
  .row {
    padding: 0 20px;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
    /*line-height: 50px;*/
    font-weight: 500;
    background: #fff;
  }

  .actions label {
    padding: 10px 0;
    font-size: 18px;
    color: #999;
    font-family: -apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
  }
</style>


<!--<div style="min-width: 100px;">-->
<!--    <Button on:click={() => menu.setOpen(true)}>-->
<!--      <Label>Mode Selection (Current: {mode})</Label>-->
<!--    </Button>-->
<!--    <Menu bind:this={menu}>-->
<!--      <List>-->
<!--        <Item on:click={ModeChangeFiles}>-->
<!--          <Text>Files</Text>-->
<!--        </Item>-->
<!--        <Item on:click={ModeChangeExperiments}>-->
<!--          <Text>Experiments</Text>-->
<!--        </Item>-->
<!--      </List>-->
<!--    </Menu>-->
<!--</div>-->


<div class="flex flex-wrap">
    <div class="flex flex-col justify-center px-4 my-4" style="width: 80%">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">Data: {cartData.length}</h5>
        </div>
        <div class="block rounded-b shadow-lg bg-white max-w-sm w-full px-4">
            <!--            <h5 class="text-gray-900 text-xl leading-tight font-medium mb-2">Repeats: {cartRepeats.length}</h5>-->
            <VirtualList
                    height={200}
                    width=100%
                    itemCount={cartData.length}
                    itemSize={50}>

                <div slot="item" let:index let:style {style} class="row">
                        <span>
                            <IconButton class="material-icons" style="display: inline-block"
                                        on:click={() => Cart.addDataItems($Cart.data.filter(
                                    d => d.id !== cartData[index].id))}>
                            cancel</IconButton>
                            <!--{cartData[index].id}-->
                            <span class="inline-block">
                                {#if (cartData[index].Target == 'unknown')}
                                    <p class="font-bold text-xs">{cartData[index].Biosample}({cartData[index].Assay})</p>
                                {:else }
                                    <p className="font-bold text-xs">{cartData[index].Biosample}({cartData[index].Target})</p>
                                {/if}
<!--                                <p class="font-bold">File: {cartData[index].id}</p>-->
                                <!--                                <span class="text-xs">biosample-target</span>-->
<!--                                <span class="font-bold">{cartData[index].Assay} in {cartData[index].Biosample}<br/></span>-->
                                <span class="text-xs">Target: {cartData[index].Target}, ID: {cartData[index].id}</span>
                            </span>
                        </span>
                </div>
            </VirtualList>
        </div>
        <a on:click={() => showConfirmationRemoveData()} class="inline-flex items-center cursor-pointer px-2 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
            <i class="fa fa-fw fa-close pr-6 pl-2"></i>
            <p> Remove all data </p>
        </a>
    </div>

    <div class="flex flex-col justify-center px-4 my-4" style="width: 80%">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">Repeats: {cartRepeats.length}</h5>
        </div>
        <div class="block rounded-b shadow-lg bg-white max-w-sm w-full px-4">
<!--            <h5 class="text-gray-900 text-xl leading-tight font-medium mb-2">Repeats: {cartRepeats.length}</h5>-->
            <VirtualList
                    height={200}
                    width=100%
                    itemCount={cartRepeats.length}
                    itemSize={50}>
                <div slot="item" let:index let:style {style} class="row">
            <span>
                <IconButton class="material-icons"
                            on:click={() =>
                            Cart.addRepeats($Cart.repeats.filter(d => d.name !== cartRepeats[cartRepeats.length - 1 - index].name))}>
                cancel</IconButton>
                Subfamilies: {cartRepeats[cartRepeats.length - 1 - index].name}
            </span>
                    <!--            <Text>{cartRepeats[cartRepeats.length - 1 - index].name}</Text>-->
                </div>
            </VirtualList>
        </div>
        <a on:click={() => showConfirmationRemoveRepeats()} class="inline-flex items-center cursor-pointer px-2 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <i class="fa fa-fw fa-close pr-6 pl-2"></i>
            <p> Remove all repeats </p>
        </a>
    </div>

</div>



<hr class="m-4" />
{#if sessionFile !== undefined}
    <div style="margin-left: 40%" class="margins">
        <Fab color="primary" on:click={handleSessionDownload} extended ripple={false}>
            <Icon class="material-icons">download</Icon>
            <Label>Download Session Json File</Label>
        </Fab>
    </div>
<!--  <div style="margin-left: 40%">-->
<!--    <Button on:click={handleSessionDownload} variant="raised"> Download Session Json File </Button>-->
<!--  </div>-->
{/if}

