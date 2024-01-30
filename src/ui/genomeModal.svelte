<script>
    import {onMount} from "svelte";
    import {Cart} from '../stores/CartStore';
    import VirtualList from 'svelte-tiny-virtual-list';
    import IconButton from '@smui/icon-button';
    import {fetchConsensusDatabyZarr} from "../components/consensus/utils";
    import Typeahead from "svelte-typeahead";
    import { Jumper } from 'svelte-loading-spinners';
    import Button, { Label, Icon } from '@smui/button';
    import {getZarrLoci} from "../components/genome-view/helper-flat";

    export let repeat = 'MER41B';
    export let specy = 'GRCh38';

    let cartData;
    let cartRepeats;
    let status = "hidden";
    let duplicate = false;

    function compareSpecies(specyA, specyB){
        let hg38 = ['hg38', 'GRCh38']
        if(specyA === specyB){
            return true
        } else if(hg38.includes(specyA) && hg38.includes(specyB)){
            return true
        } else {
            return false
        }
    }

    const unsubscribe = Cart.subscribe(async store => {
        const { data, repeats } = store;
        cartData = data;
        cartData = cartData.filter(x => compareSpecies(x.Organism, specy))
        // cartData = cartData.filter(x => x.Organism == specy)
        cartRepeats = repeats;
    });

    async function readFileData(dataName, repeatName){
        status = "loading";
        const dataFile = $Cart.data.filter(file => file.id === dataName);
        let dataToRender = await getZarrLoci(repeatName, dataFile);
        let valuesList = $Cart.genomelist;
        let dataSet = new Set();
        valuesList.forEach(v => {
            v.values.forEach(d => dataSet.add(d.data))
        })
        dataToRender.forEach(chr => {
            let chrIndex = valuesList.findIndex(i => i.key == chr.key);
            if (!dataSet.has(dataName)){
                duplicate = false;
                chr.values.forEach(d => d["data"] = dataName);
                if (chrIndex == -1){
                    valuesList.push({
                        key: chr.key,
                        values: [chr.values]
                        // values: {dataName:chr.values}
                    });
                } else {
                    // console.log(chr.values);
                    valuesList[chrIndex].values.push(...chr.values)
                    // console.log(valuesList[chrIndex].values);
                    // valuesList[chrIndex].values[dataName] = chr.values
                }
            } else {
                duplicate = true;
            }

        });
        valuesList.sort((a, b) => parseInt(a.key.replace('chr', '')) - parseInt(b.key.replace('chr', '')))
        // console.log(valuesList)
        Cart.updateGenomeView(valuesList);
        // let res = await fetchConsensusDatabyZarr(dataFile, repeatName);
        // const signal_value = res[0].all.map(x => x.score);
        // // console.log(signal_value, genomeCopyDense.map(Number))
        // res.forEach(d =>{
        //     d["y_range"] = parseInt(1.1 * Math.max(...[].concat(...signal_value)));
        // })
        // Cart.updateConsensusTrack([...new Set([...$Cart.consensuslist, ...res])]);
        status = "hidden";
        // Cart.updateConsensusTrack(res);
    }

    onMount(()=>{
        // console.log($Cart.genomelist)
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
                itemSize={60}>

            <div slot="item" let:index let:style {style} class="row">
                <span class="text-base">
<!--                    <IconButton class="material-icons border"-->
<!--                                on:click={() => readFileData(cartData[index].id, repeat)}-->
<!--                    >-->
<!--                    add</IconButton>-->
                    <div class="mb-2 inline-block pr-4">
                        <Button
                                on:click={() => readFileData(cartData[index].id, repeat)}
                                variant="unelevated"
                                class="button-shaped-round"
                        >
                          <Icon class="material-icons">add</Icon>
                          <Label>Add Genome Copy</Label>
                        </Button>
                    </div>
                    <span class="inline-block">
<!--                                <p class="font-bold">File: {cartData[index].id}</p>-->
                        <!--                                <span class="text-xs">biosample-target</span>-->
                            <p class="font-bold">{cartData[index].Assay} in {cartData[index].Biosample}</p>
                            <span class="text-xs">Target: {cartData[index].Target}, ID: {cartData[index].id}</span>
                    </span>
                </span>

            </div>
        </VirtualList>
        <hr />
        {#if duplicate}
            <p>This File is already selected!</p>
        {/if}
        {#if status=="loading" && !duplicate}
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
