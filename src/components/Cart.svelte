<script lang="ts">
  import List, {
    Group,
    Item,
    Graphic,
    Meta,
    Label,
    Separator,
    Subheader,
    Text,
    PrimaryText,
    SecondaryText
  } from "@smui/list";
  import { Cart } from "../stores/CartStore.js";
  import Button from '@smui/button';
  import Fab, { Label, Icon } from '@smui/fab';
  import {onDestroy, onMount} from "svelte";
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import VirtualList from 'svelte-tiny-virtual-list';
  import IconButton from '@smui/icon-button';
  import Menu, {MenuComponentDev} from '@smui/menu';
  import fileDownload from 'js-file-download';
  import { v4 as uuidv4 } from 'uuid';

  let selectionIndex = null;
  let selectionTwoLine = "Stephen Hawking";
  let cartData;
  let cartRepeats;
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
    console.log(sessionFile);
    fileDownload(sessionFile, `${UUID}_data_repeats.json`);
  }

  function creaseSessionJson(data, repeats){
    // console.log(JSON.stringify(data));
    // const stringData = data.map(d => JSON.stringify(d));
    // const stringData = data.map(d => JSON.stringify(d));
  }

  const unsubscribe = Cart.subscribe(async store => {
    const { data, repeats } = store;
    cartData = data;
    cartRepeats = repeats;
    sessionFile = `{"data": ${JSON.stringify(data)}, "repeats": ${JSON.stringify(repeats)}}`;
    console.log(sessionFile);
    creaseSessionJson(data, repeats);
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

<!--<div class="main-body">-->
<!--  <List-->
<!--    class="demo-list"-->
<!--    twoLine-->
<!--    avatarList-->
<!--    singleSelection-->
<!--    bind:selectedIndex={selectionIndex}>-->
<!--      <div class="mdc-typography&#45;&#45;headline3">Data</div>-->
<!--    {#each cartData as item}-->
<!--      <Item-->
<!--        on:SMUI:action={() => selectionTwoLine = item._id, Cart.addDataItems($Cart.data.filter(d => d._id !== item._id))}-->
<!--        selected={selectionTwoLine === item._id}>-->
<!--        <Graphic-->
<!--          style="background-image:-->
<!--          url(https://via.placeholder.com/40x40.png?text={item._id});" />-->
<!--        <Text>-->
<!--          <PrimaryText>{item.Tissue}</PrimaryText>-->
<!--          <SecondaryText>{item.Assay}</SecondaryText>-->
<!--        </Text>-->
<!--        <Meta class="material-icons">cancel</Meta>-->
<!--      </Item>-->
<!--    {/each}-->
<!--  </List>-->

<!--  <List class="demo-list">-->
<!--    <div class="mdc-typography&#45;&#45;headline3">Repeats</div>-->

<!--    {#each cartRepeats as item}-->
<!--      <Item>-->
<!--        <Text>{item.name}</Text>-->
<!--      </Item>-->
<!--    {/each}-->
<!--  </List>-->
<!--</div>-->


<div style="min-width: 100px;">
    <Button on:click={() => menu.setOpen(true)}>
      <Label>Mode Selection (Current: {mode})</Label>
    </Button>
    <Menu bind:this={menu}>
      <List>
        <Item on:click={ModeChangeFiles}>
          <Text>Files</Text>
        </Item>
        <Item on:click={ModeChangeExperiments}>
          <Text>Experiments</Text>
        </Item>
      </List>
    </Menu>
</div>


<div class="flex flex-wrap">
    <div class="flex flex-col justify-center px-4" style="width: 70%">
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
    </div>

    <div class="flex flex-col justify-center px-4" style="width: 30%">
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

