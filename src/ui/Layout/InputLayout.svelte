<script lang="ts">
    import Drawer, {
        AppContent,
        Content,
        Header,
        Title,
        Subtitle,
        Scrim,
    } from '@smui/drawer';
    import THeader from "../../ui/header.svelte"
    import Footer from "../../ui/footer.svelte"
    import Fab from '@smui/fab';
    import Button, { Label, Icon } from '@smui/button';
    import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
    import { Router, Route, link, navigate } from "svelte-routing";
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import PlotlyHeatmapContainer from "../../examples/PlotlyHeatmapContainer.svelte";
    import ConsensusContainer from "../../components/consensus/ConsensusContainer.svelte";
    import GenomeViewContainer from "../../components/genome-view/GenomeViewContainer.svelte";
    import {Cart} from "../../stores/CartStore";
    import CartComponent from "../../components/Cart.svelte";
    import defaultData from '../../json/default_cart_data.json';
    import Zoom_Sunburst from "../../examples/Zoom_Sunburst.svelte";
    import DataTab from "../../examples/DataTab.svelte";
    import FileUpload from "../../examples/FileUpload.svelte";
    import Menu, {MenuComponentDev} from '@smui/menu';
    import Modal from '../../ui/Modal.svelte';
    import Tab, { Icon, Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import { H6 } from '@smui/common/elements';
    import {onDestroy, onMount} from "svelte";

    let typemenu: MenuComponentDev;
    let heatmapmenu: MenuComponentDev;
    let menu: MenuComponentDev;
    let selected_type = 'Files';
    let heatmap_type = 'ALL';

    let open = true;
    // let active = 'Inbox';

    let combination = undefined;
    // let drawernames = ['Files Selection', 'Data View', 'Repeats Selection', 'Heatmap', 'Consensus View', 'Genome View']
    let active = 'Files Selection';
    let mode = 'files';

    let cartData, cartRepeats;
    const unsubscribe = Cart.subscribe(async store => {
        const { data, repeats } = store;
        cartData = data;
        cartRepeats = repeats;
    });

    let savestore = false
    $: if(savestore && $Cart) {
        window.sessionStorage.setItem("store", JSON.stringify($Cart))
    }
    onMount(async ()=>{
        let ses = window.sessionStorage.getItem("store")
        if(ses){
            $Cart = JSON.parse(ses)
        }
        savestore = true
    })

    onDestroy(() => {
        unsubscribe();
    });

    let tabs = [
        {
            icon: 'input',
            label: 'Input',
        },
        {
            icon: 'query_stats',
            label: 'Visualization',
        },
    ];
    let tab_active = tabs[0];

    // onMount(() => {
    //     Cart.addDataItems(defaultData.data);
    //     Cart.addRepeats(defaultData.repeats);
    // })

    function handleHeatmapClick(event) {
        combination = event.detail;
        active = 'Consensus View';
    }

    function gotoGenomeView(event) {
        combination = event.detail;
        active = 'Consensus View';
    }

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

    function setActive(value: string) {
        active = value;
        if(value === "Files Selection") { navigate('/input/data')};
        if(value === "Repeats Selection") { navigate('/input/repeats')};
        if(value === "Data View") { navigate('/input/display')};
        if(value === "File Upload") { navigate('/input/upload')};
        // open = false;
    }

    export let location;
    export let input = "";

    $: if(tab_active == tabs[1]) {navigate('/visual');}
    // $: if(active === "Files Selection") { navigate('/input/data')}
    // $: if(active === "Repeats Selection") { navigate('/input/repeats')}
    // $: if(active === "Data View") { navigate('/input/display')}
    // $: if(active === "File Upload") { navigate('/input/upload')}
</script>

<!--top tab bar-->
<!--<div>-->
<!--    <TabBar {tabs} let:tab bind:active={tab_active}>-->
<!--        <Tab {tab}>-->
<!--            <Icon class="material-icons">{tab.icon}</Icon>-->
<!--            <Label>-->
<!--                {#if tab === tabs[0]}-->
<!--                    {cartData.length} Files and {cartRepeats.length} Repeats-->
<!--                {:else}-->
<!--                    {tab.label}-->
<!--                {/if}-->
<!--            </Label>-->
<!--        </Tab>-->
<!--    </TabBar>-->
<!--</div>-->


<!--<nav class="flex items-center justify-between flex-wrap bg-sky-600 p-2">-->
<!--    <div class="flex items-center flex-shrink-0 text-white mr-6">-->
<!--        <svg class="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z"/></svg>-->
<!--        <span class="font-semibold text-2xl tracking-tight">Repeat Browser</span>-->
<!--    </div>-->
<!--    <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">-->
<!--        <div class="text-base lg:flex-grow">-->
<!--&lt;!&ndash;            <a href="#" class="block mt-4 lg:inline-block lg:mt-0 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Input Data: {cartData.length} Files and {cartRepeats.length} Repeats</a>&ndash;&gt;-->
<!--            <a href="/" use:link class="hover:no-underline block mt-4 lg:inline-block lg:mt-0 hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium text-white mr-4">-->
<!--                <i class="fa fa-fw fa-home"></i>-->
<!--                Homepage-->
<!--            </a>-->
<!--            <a href="/input" use:link class="block mt-4 lg:inline-block lg:mt-0 hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium text-white mr-4">-->
<!--                <i class="fa fa-fw fa-inbox"></i>-->
<!--                Input Data: {cartData.length} Files and {cartRepeats.length} Repeats-->
<!--            </a>-->
<!--&lt;!&ndash;            <a href="#" class="hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Data Visualization</a>&ndash;&gt;-->
<!--            <a href="/visual" use:link class="block mt-4 lg:inline-block lg:mt-0 hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium text-white mr-4">-->
<!--                <i class="fa fa-fw fa-chart-line"></i>-->
<!--                Data Visualization-->
<!--            </a>-->

<!--        </div>-->
<!--        <div class="flex items-center flex-shrink-0 text-white">-->
<!--            <a href="#" class="inline-block text-sm px-4 py-2 leading-none border rounded text-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Document</a>-->
<!--            <a href="https://medicine.wustl.edu/"><img src="/images/School_of_Medicine_2linehrz_pos(RGB)1000-01.png" alt="" width="90" height="90" class="pl-6 pr-1"></a>-->
<!--            <a href="https://wang.wustl.edu/"><img src="/images/wanglab.png" alt="" width="100" height="100"></a>-->
<!--        </div>-->
<!--    </div>-->
<!--</nav>-->

<div class="drawer-container">
        <!-- Don't include fixed={false} if this is a page wide drawer.
              It adds a style for absolute positioning. -->
        <Drawer style="max-width: 18vw;">
            <Content>
                <List>
                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('Data View')}
                            activated={location.pathname === '/input/display'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">folder_open</Graphic>
                        <Text>{cartData.length} Files and {cartRepeats.length} Repeats</Text>
                    </Item>

                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('Files Selection')}
                            activated={location.pathname === '/input/data'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">toc</Graphic>
                        <Text>Files Selection</Text>
                    </Item>

                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('File Upload')}
                            activated={location.pathname === '/input/upload'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">upload</Graphic>
                        <Text>Upload</Text>
                    </Item>

                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('Repeats Selection')}
                            activated={location.pathname === '/input/repeats'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">pie_chart</Graphic>
                        <Text>Repeats Selection</Text>
                    </Item>

                    <Separator />

                    <Item
                            href="javascript:void(0)"
                            on:click="{() => navigate('/')}"
                            activated={active === 'Homepage'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">home</Graphic>
                        <Text>Homepage</Text>
                    </Item>
                </List>
            </Content>
        </Drawer>

        <!-- Don't include fixed={false} if this is a page wide drawer.
              It adds a style for absolute positioning. -->
        <Scrim fixed={false} />
        <AppContent class="app-content">
            <main class="main-content">
                <br />
                <Router url="input">
                    <Route path="data">
                        <DataTab {mode}/>
                    </Route>
                    <Route path="repeats" component="{Zoom_Sunburst}" />
                    <Route path="display" component="{CartComponent}" />
                    <Route path="upload" component="{FileUpload}" />
                </Router>
            </main>
        </AppContent>
</div>




<style>
    /* These classes are only needed because the
      drawer is in a container on the page. */
    .drawer-container {
        position: relative;
        display: flex;
        margin-top: 2px;
        height: 87vh;
        /*max-width: 30vh;*/
        /*max-width: 600px;*/
        border: 1px solid;
        border-color: rgba(189, 195, 199, 0.8);
            /*var(--mdc-theme-text-hint-on-background, rgba(239, 239, 240, 0.1));*/
        overflow: hidden;
        z-index: 0;
    }

    * :global(.app-content) {
        flex: auto;
        overflow: auto;
        position: relative;
        flex-grow: 1;
    }

    .main-content {
        overflow: auto;
        padding: 16px;
        height: 100%;
        /*box-sizing: border-box;*/
    }
</style>