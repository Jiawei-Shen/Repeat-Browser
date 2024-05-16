<script lang="ts">
    // import Modal from '../ui/Modal.svelte';
    // import PivotTable from '../components/data-view/PivotTable.svelte';
    // import _data from "../json/main.json";
    // import defaultData from '../json/zarr_data_1027.json';
    // import CardStats from "../components/CardStats.svelte";
    // import IconButton from '@smui/icon-button';
    // import Button, { Label } from '@smui/button';
    // import Card, {
    //     Content,
    //     Actions,
    // } from '@smui/card';
    // import Button, { Label } from '@smui/button';
    // import Textfield from '@smui/textfield';
    // import Paper, { Title, Content } from '@smui/paper';
    // import HelperText from '@smui/textfield/helper-text';
    // import IconButton, { Icon } from '@smui/icon-button';
    // import LayoutGrid, { Cell } from '@smui/layout-grid';
    // import VirtualList from 'svelte-tiny-virtual-list';
    // import { navigate } from "svelte-routing";
    import {Cart} from "../stores/CartStore";
    import {onDestroy, onMount} from "svelte";
    import defaultData from "../json/default_cart_data.json";
    import {getZarrParameters} from '../api/inputdata';
    import {uploadTour} from "../api/toursteps"

    import type, { MenuComponentDev } from '@smui/menu';

    let menu: MenuComponentDev;
    let clicked = 'nothing yet';
    let upload_active = false;

    let cartData;
    let cartRepeats;

    let tmp_url='';
    let zarr_url;

    let files;

    let valueA=0;

    // $: if (files) {
    //     update_data();
    // }

    async function update_data(){
        const file = files[0]
        const json_content = await file.text().then(d => {
            console.log(JSON.parse(d));
            const {data, repeats, species} = JSON.parse(d);
            Cart.addDataItems(data);
            Cart.addRepeats(repeats);
            if(species){
                Cart.setSpecies(species);
            }
            alert(`The files and repeats Updated.`);
            files = null;
            // navigate('/input/display');
        });
    }

    const unsubscribe = Cart.subscribe(async store => {
        const { data, repeats } = store;
        cartData = data;
        cartRepeats = repeats;
    });

    function handleClick(data) {
        alert(`${data.id} (${data.Assay}) Uploaded.`)
    }

    async function setUn() {
        zarr_url = tmp_url;
        if(zarr_url.slice(-1)!="/"){
            zarr_url += "/"
        }
        const data_json = await getZarrParameters(zarr_url).then(data => {
            handleClick(data);
            Cart.addDataItems([...new Set([...$Cart.data, data])]);
        });
    }

    // let upload_files;
    // $: if (upload_files) {
    //     // Note that `files` is of type `FileList`, not an Array:
    //     // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    //     console.log(upload_files);
    //
    //     for (const file of upload_files) {
    //         console.log(`${file.name}: ${file.size} bytes`);
    //         console.log(`${file}`);
    //     }
    // }

    onMount(() => {
        unsubscribe();
    });

    let itemSize = 100;
</script>

<div class="flex flex-wrap">
    <div class="flex flex-col w-full lg:w-8/12 px-4">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="px-4 py-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Upload Session Json</h5>
        </div>
        <div class="justify-center max-w-sm p-6 bg-white border border-gray-200 rounded-b shadow-md dark:bg-gray-800 dark:border-gray-700" id="session-upload">
            <div class="px-4 flex items-center justify-center w-full">
                <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div class="flex flex-col items-center justify-center pt-6 pb-6">
                        {#if files}
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Selected File: <br /></span>{files[0].name}</p>
                        {:else}
                            <svg aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span></p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">The session json file. (The formatted json file.)</p>
                        {/if}
                    </div>
                    <input id="dropzone-file" type="file" class="hidden" bind:files/>
                </label>
            </div>
            <div class="px-4 pt-2 flex items-center justify-center">
                <button on:click={update_data} type="button" class="text-white bg-lightBlue-600 hover:bg-lightBlue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    Upload
                </button>
            </div>
        </div>
        <br />

        <div class="flex flex-col w-full">
            <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="px-4 py-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Zarr File URL (Current Species: {$Cart.biosample})</h5>
        </div>
        <div class="justify-center max-w-sm p-6 bg-white border border-gray-200 rounded-b shadow-md dark:bg-gray-800 dark:border-gray-700" id="zarr-upload">
                <div class="px-4">

<!--                <label for="helper-text" class="py-2 mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Zarr File URL</label>-->
                <div class="flex flex-wrap">
                    <input type="url" id="helper-text" aria-describedby="helper-text-explanation" class="w-10/12 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           bind:value={tmp_url} placeholder="http://*.zarr/">
                    <div class="lg:w-2/12 px-4 flex items-center justify-center">
                        <button on:click={setUn} type="button" class="text-white bg-lightBlue-600 hover:bg-lightBlue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                            Upload
                        </button>
                    </div>
                </div>
                <p id="helper-text-explanation" class="mt-2 text-sm text-gray-500 dark:text-gray-400">Please upload your processed zarr url.</p>

            </div>
            </div>
        </div>
        <br />

        <div class="flex flex-col w-full">
            <div class="justify-center max-w-sm p-2 bg-white border border-gray-200 rounded-b shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h5 class="px-4 py-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Don't have Zarr?
                </h5>
                <h5 class="px-4 py-2 text-xl tracking-tight text-gray-900 dark:text-white">Employing <a style="text-decoration: underline;color: blue;" href="https://github.com/Jiawei-Shen/Repeat-Browser_data_processing">our pipeline</a> to transform your BAM/FastQ files into Zarr!
                    <a href="https://github.com/Jiawei-Shen/Repeat-Browser_data_processing"><i class="fa fa-fw fa-github pr-6 pl-2 text-2xl"></i></a>
                </h5>
            </div>
        </div>

    </div>


    <div class="flex flex-col w-full lg:w-4/12 px-4">
        <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
            <h5 class="py-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Guidance</h5>
        </div>
        <div class="px-4 py-2 max-w-sm p-6 bg-white border border-gray-200 rounded-b shadow-md dark:bg-gray-800 dark:border-gray-700">
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are some tips for you to operate the upload.</p>
            <ul class="list-disc px-4 text-sm">
                <li> To process the Zarr data, visit this <a style="text-decoration: underline;color: blue;" href="https://github.com/Jiawei-Shen/Repeat-Browser_data_processing">Github Repo</a> for details. </li>
                <li> Zarr file is actually a directory, upload the zarr directory in your server. </li>
                <li> For individuals with a local Zarr file, <a style="text-decoration: underline;color: blue;" href="https://www.npmjs.com/package/http-server">http-server</a> could provide an online version of your local files. </li>
                <li> The Session Json File is a json file that contains essential information of data and repeats,
                    which can be downloaded at <a style="text-decoration: underline;color: blue;" href="./display"> display page</a>. </li>
                <!-- ... -->
            </ul>
            <br>
            <a on:click={uploadTour} class="cursor-pointer inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white bg-lightBlue-600 rounded-lg hover:bg-lightBlue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <i class="fa fa-fw fa-book pr-6 pl-2"></i>
                Detailed Tour
                <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </a>
        </div>
    </div>
</div>



<style>
    IconButton{
        float: right;
    }


    /*:global(body), :global(html) {*/
    /*    height: 100%;*/
    /*    margin: 0;*/
    /*    background-color: rgb(249, 249, 249);*/
    /*}*/


    .actions label {
        padding: 10px 0;
        font-size: 18px;
        color: #999;
        font-family: -apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
    }
</style>
