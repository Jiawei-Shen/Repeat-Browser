<script lang="ts">
    import Drawer, {
        AppContent,
        Content,
        Scrim,
    } from '@smui/drawer';
    import Button, { Label, Icon } from '@smui/button';
    import List, { Item, Text, Graphic, Separator } from '@smui/list';
    import { Router, Route, navigate } from "svelte-routing";
    import PlotlyHeatmapContainer from "../../examples/PlotlyHeatmapContainer.svelte";
    import ConsensusContainer from "../../components/consensus/ConsensusContainer.svelte";
    import GenomeViewContainer from "../../components/genome-view/GenomeViewContainer.svelte";
    import {Cart} from "../../stores/CartStore";
    import {MenuComponentDev} from '@smui/menu';
    import Modal from '../../ui/Modal.svelte';
    import {onDestroy, onMount} from "svelte";

    let typemenu: MenuComponentDev;
    let heatmapmenu: MenuComponentDev;
    let menu: MenuComponentDev;
    let selected_type = 'Files';

    let open = true;

    let combination = undefined;
    let drawernames = ['Files Selection', 'Data View', 'Repeats Selection', 'Heatmap', 'Consensus View', 'Genome View']
    let active = drawernames[3];
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
        unsubscribe;
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
    let tab_active = tabs[1];

    // Function with OK action
    function functionWithOK() {
        var result = window.confirm("Are you sure you want to change the species? \nAll the data will be reset, please save a session file first!\n Click cancel will jump to saving the session file. \n Click OK to continue.");
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
        open = false;
    }

    export let location;
    export let visual = "";

    $: if(tab_active == tabs[0]) {navigate('/input');}
    $: if(active === "Heatmap") { navigate('/visual/heatmap')}
    $: if(active === "Consensus View") { navigate('/visual/consensus')}
    $: if(active === "Genome View") { navigate('/visual/genome')}
</script>

<div class="drawer-container">
    <!-- Don't include fixed={false} if this is a page wide drawer.
          It adds a style for absolute positioning. -->

    <Drawer>
        <Content>
            <List>
                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Heatmap')}
                        activated={location.pathname === '/visual/heatmap'}
                >
                    <Graphic class="material-icons" aria-hidden="true">table_chart</Graphic>
                    <Text>Heatmap</Text>
                </Item>

                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Consensus View')}
                        activated={location.pathname === '/visual/consensus'}

                >
                    <Graphic class="material-icons" aria-hidden="true">show_chart</Graphic>
                    <Text id="consensus-drawer-bar">Consensus View</Text>
                </Item>

                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Genome View')}
                        activated={location.pathname === '/visual/genome'}

                >
                    <Graphic class="material-icons" aria-hidden="true">biotech</Graphic>
                    <Text id="genome-drawer-bar">Genome View</Text>
                </Item>

                <Separator />

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
            <Router url="visual">
                <Route path="heatmap">
                    <PlotlyHeatmapContainer on:heatmap-click={handleHeatmapClick}
                                            on:tileClick={handleHeatmapClick}/>
                </Route>
                <Route path="consensus">
                    {#if typeof combination !== "undefined"}
                        <ConsensusContainer {combination} />
                        <hr />
                        <div class="flow-root">
                            <Button class="float-left" on:click={() => {active = "Heatmap"}} touch variant="unelevated">
                                <Icon class="material-icons">arrow_back</Icon>
                                <Label>Heatmap</Label>
                            </Button>

                            <Button class="float-right" on:click={() => {active = "Genome View"}} touch variant="unelevated">
                                <Label>Genome View</Label>
                                <Icon class="material-icons">arrow_forward</Icon>
                            </Button>
                        </div>
                    {:else }
                        <p> Click the Heatmap cell first to select data! <p>
                    {/if}
                </Route>
                <Route path="genome">
                    {#if typeof combination !== "undefined"}
                        <Modal>
                            <GenomeViewContainer {combination} style="margin-bottom: 5%"/>
                            <div class="flow-root">
                                <Button class="float-left" on:click={() => {active = "Heatmap"}} touch variant="unelevated">
                                    <Icon class="material-icons">arrow_back</Icon>
                                    <Label>Heatmap</Label>
                                </Button>

                                <Button class="float-right" on:click={() => {active = "Consensus View"}} touch variant="unelevated">
                                    <Label>Consensus View</Label>
                                    <Icon class="material-icons">arrow_forward</Icon>
                                </Button>
                            </div>
                        </Modal>
                    {:else }
                        <p> Click the Heatmap cell first to select data! <p>
                    {/if}
                </Route>
            </Router>
        </main>
    </AppContent>
</div>


<style>
    /* These classes are only needed because the
      drawer is in a container on the page. */
    .drawer-container {
        position: relative;
        margin-top: 2px;
        display: flex;
        height: 85vh;
        border: 1px solid;
        border-color: rgba(189, 195, 199, 0.8);
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
    }

</style>