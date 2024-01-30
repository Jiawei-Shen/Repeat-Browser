<script lang="ts">
    import Drawer, {
        AppContent,
        Content,
        Scrim,
    } from '@smui/drawer';;
    import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
    import { Router, Route, link, navigate } from "svelte-routing";
    import {Cart} from "../../stores/CartStore";
    import CartComponent from "../../components/Cart.svelte";
    import Zoom_Sunburst from "../../examples/Zoom_Sunburst.svelte";
    import DataTab from "../../examples/DataTab.svelte";
    import FileUpload from "../../examples/FileUpload.svelte";
    import {MenuComponentDev} from '@smui/menu';
    import {onDestroy, onMount} from "svelte";

    let typemenu: MenuComponentDev;
    let heatmapmenu: MenuComponentDev;
    let menu: MenuComponentDev;
    let selected_type = 'Files';
    let heatmap_type = 'ALL';

    let open = true;

    let combination = undefined;
    let active = 'Files Selection';
    let mode = 'files';

    let cartData, cartRepeats;
    const unsubscribe = Cart.subscribe(async store => {
        const { data, repeats } = store;
        cartData = data;
        cartRepeats = repeats;
    });

    // Function with OK action
    function functionWithOK() {
        var result = window.confirm("All the data will be reset! Please save a session file first!\n Click cancel will jump to saving the session file. \n Click OK to continue.");
        if (result) {
            // OK action
            console.log("OK pressed. Performing function for OK.");
            // Call your function for OK action here
            if($Cart.biosample === 'Human'){
                Cart.setSpecies('Mouse');
                Cart.addRepeats([]);
                Cart.addDataItems([]);
                console.log($Cart.biosample, '--> ');
            } else {
                Cart.setSpecies('Human');
                Cart.addRepeats([]);
                Cart.addDataItems([]);
                console.log($Cart.biosample, '--> ');
            }

        } else {
            // Cancel action or do nothing
            navigate("/input/display");
        }
    }

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

    $: {
        if(tab_active == tabs[1]) {navigate('/visual');}
        // console.log(Cart.biosample);
    }
</script>

<div class="drawer-container">
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

<!--                    <Item-->
<!--                            href="javascript:void(0)"-->
<!--                            on:click="{() => navigate('/')}"-->
<!--                            activated={active === 'Homepage'}-->
<!--                    >-->
<!--                        <Graphic class="material-icons" aria-hidden="true">home</Graphic>-->
<!--                        <Text>Homepage</Text>-->
<!--                    </Item>-->

                    <Item
                            on:click="{() => functionWithOK()}"
                    >
                        {#if $Cart.biosample === 'Mouse'}
                            <Graphic class="material-icons" aria-hidden="true"> pest_control_rodent </Graphic>
                        {:else}
                            <Graphic class="material-icons" aria-hidden="true"> accessibility_new </Graphic>
                        {/if}
                        <Text> Species: {$Cart.biosample} </Text>
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