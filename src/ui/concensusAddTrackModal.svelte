<script>
    import {Cart} from '../stores/CartStore';
    import VirtualList from 'svelte-tiny-virtual-list';
    import {fetchConsensusDatabyZarr} from "../components/consensus/utils";
    import Typeahead from "svelte-typeahead";
    import { Jumper } from 'svelte-loading-spinners';
    import Button, { Label, Icon } from '@smui/button';

    export let repeat;
    export let hg38GenomeCopydensity;

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

        Cart.updateConsensusTrack([...new Set([...$Cart.consensuslist, ...res])]);
        status = "hidden";
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
        <VirtualList
                height={200}
                width=100%
                itemCount={cartData.length}
                itemSize={50}>

            <div slot="item" let:index let:style {style} class="row">
                <span>
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
        font-weight: 500;
        background: #fff;
    }
</style>
