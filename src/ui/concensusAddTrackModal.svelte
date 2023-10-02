<script>
    import {onMount} from "svelte";
    import {Cart} from '../stores/CartStore';
    import VirtualList from 'svelte-tiny-virtual-list';
    import IconButton from '@smui/icon-button';
    import {fetchConsensusDatabyZarr} from "../components/consensus/utils";
    import hg38GenomeCopydensity from "../json/hg38GenomeCopyDensity.json"
    import Typeahead from "svelte-typeahead";
    import { Jumper } from 'svelte-loading-spinners';
    import Button, { Label, Icon } from '@smui/button';

    export let repeat;
    let cartData;
    let cartRepeats;
    let maxValue;
    let status = "hidden";

    const unsubscribe = Cart.subscribe(async store => {
        const { data, repeats } = store;
        cartData = data;
        cartRepeats = repeats;
    });

    async function readFileData(dataName, repeatName){
        status = "loading";
        const dataFile = $Cart.data.filter(file => file.id === dataName);
        let genomeCopyDense = hg38GenomeCopydensity[repeat];
        let res = await fetchConsensusDatabyZarr(dataFile, repeatName, genomeCopyDense.length);

        // Using maxValue instead of signal_value.
        // const signal_value = res[0].all.map(x => x.score);
        // // console.log(signal_value, genomeCopyDense.map(Number))
        // res.forEach(d =>{
        //     d["y_range"] = parseInt(1.1 * Math.max(...[].concat(...signal_value)));
        // })
        Cart.updateConsensusTrack([...new Set([...$Cart.consensuslist, ...res])]);
        status = "hidden";
        // Cart.updateConsensusTrack(res);
    }

    onMount(()=>{
        // console.log(Cart.consensuslist)
        // Cart.updateConsensusTrack([...new Set([...$Cart.consensuslist, "data"])]);
    })
</script>

<div>
    <span class="text-xl">Selected Repeat: <p class="font-bold inline">{repeat}</p>.</span>
    <div class="block pt-4 rounded-b shadow-lg bg-white max-w-sm w-full px-4">
        <Typeahead
                label="Repeats Search"
                hideLabel
                placeholder={`Search Files`}
                data={cartData}
                extract={(item) => item.id}
                on:select={({ detail }) => {
                        console.log(detail);
                        readFileData(detail.selected, repeat);
                    }}
        />
        <p class="px-4 -mt-1 text-sm text-gray-400"> You can click the file name in the dropdown to add it. </p>
    </div>
    <hr />
    <div class="block rounded-t bg-white max-w-sm w-full px-4">
        <!--                <h5 class="text-gray-900 text-xl leading-tight font-medium">Selected Files: {cartData.length}</h5>-->
        <VirtualList
                height={200}
                width=100%
                itemCount={cartData.length}
                itemSize={50}>

            <div slot="item" let:index let:style {style} class="row">
                <span>
<!--                    <IconButton class="material-icons border"-->
<!--                                on:click={() => readFileData(cartData[index].id, repeat)}-->
<!--                    >-->
<!--                    add</IconButton>-->
                    <div class="py-1 inline-block pr-4">
                        <Button
                                on:click={() => readFileData(cartData[index].id, repeat)}
                                variant="unelevated"
                                class="button-shaped-round"
                        >
                          <Icon class="material-icons">add</Icon>
                          <Label>Add Track</Label>
                        </Button>
                    </div>
                    <span class="inline-block">
<!--                                <p class="font-bold">File: {cartData[index].id}</p>-->
                        <!--                                <span class="text-xs">biosample-target</span>-->
                            <span class="font-bold">{cartData[index].Assay} in {cartData[index].Biosample}<br/></span>
                            <span class="text-xs">Target: {cartData[index].Target}, ID: {cartData[index].id}</span>
                    </span>
                </span>

            </div>
        </VirtualList>
        <hr />
        {#if status=="loading"}
            <div class="inline">
                <h2>Adding the Repeat Tracks.</h2>
                <Jumper size="30" color="#4ea8de" unit="px" duration="1s" />
            </div>
        {/if}
    </div>
</div>

<style>
    .row {
        padding: 0 20px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;
        /*line-height: 50px;*/
        font-weight: 500;
        background: #fff;
    }
</style>
