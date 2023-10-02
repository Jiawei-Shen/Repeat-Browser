<script lang="ts">
    import Drawer, {
        AppContent,
        Content,
        Header,
        Title,
        Subtitle,
        Scrim,
    } from '@smui/drawer';
    import THeader from "../ui/header.svelte"
    import Footer from "../ui/footer.svelte"
    import Fab from '@smui/fab';
    import Button, { Label, Icon } from '@smui/button';
    import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
    import { Router, Route, Link, navigate } from "svelte-routing";
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import PlotlyHeatmapContainer from "../examples/PlotlyHeatmapContainer.svelte";
    import ConsensusContainer from "../components/consensus/ConsensusContainer.svelte";
    import GenomeViewContainer from "../components/genome-view/GenomeViewContainer.svelte";
    import {Cart} from "../stores/CartStore";
    import CartComponent from "../components/Cart.svelte";
    import defaultData from '../json/default_cart_data.json';
    import Zoom_Sunburst from "../examples/Zoom_Sunburst.svelte";
    import DataTab from "../examples/DataTab.svelte";
    import Menu, {MenuComponentDev} from '@smui/menu';
    import Modal from '../ui/Modal.svelte';
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
    let drawernames = ['Files Selection', 'Data View', 'Repeats Selection', 'Heatmap', 'Consensus View', 'Genome View']
    let active = drawernames[0];
    let mode = 'files';

    let cartData, cartRepeats;
    const unsubscribe = Cart.subscribe(async store => {
        const { data, repeats } = store;
        cartData = data;
        cartRepeats = repeats;
    });

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
        open = false;
    }

    export let location;

    $: if(tab_active == tabs[0]) {active = 'Files Selection';}
    $: if(tab_active == tabs[1]) {active = 'Heatmap';}
</script>


<THeader />
<!--top tab bar-->
<div>
    <TabBar {tabs} let:tab bind:active={tab_active}>
        <Tab {tab}>
            <Icon class="material-icons">{tab.icon}</Icon>
            <Label>
                {#if tab === tabs[0]}
                    {cartData.length} Files and {cartRepeats.length} Repeats
                {:else}
                    {tab.label}
                {/if}
            </Label>
        </Tab>
    </TabBar>
</div>
<hr>

{#if tab_active == tabs[0]}
    <div class="drawer-container">
    <!-- Don't include fixed={false} if this is a page wide drawer.
          It adds a style for absolute positioning. -->

    <Drawer class="h-screen">
        <Content>
            <List>
                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Data View')}
                        activated={active === 'Data View'}
                >
                    <Graphic class="material-icons" aria-hidden="true">folder_open</Graphic>
                    <Text>{cartData.length} Files and {cartRepeats.length} Repeats</Text>
                </Item>

                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Files Selection')}
                        activated={active === 'Files Selection'}
                >
                    <Graphic class="material-icons" aria-hidden="true">toc</Graphic>
                    <Text>Files Selection</Text>
                </Item>

                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Repeats Selection')}
                        activated={active === 'Repeats Selection'}
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
            <!--            <Button on:click={() => (open = !open)}-->
            <!--                    variant="unelevated"-->
            <!--                    class="button-shaped-round"-->
            <!--                    style="position: fixed; left: 2rem; bottom: 3rem; z-index: 2"-->
            <!--            >-->
            <!--                <Icon class="material-icons">menu</Icon>-->
            <!--                <Label>Menu</Label>-->
            <!--            </Button>-->

            <br />
            {#if active === "Files Selection"}
                <DataTab {mode}/>
            {:else if active === "Repeats Selection"}
                <Zoom_Sunburst/>
            {:else if active === "Data View" }
                <CartComponent />
            {/if}

        </main>
    </AppContent>

</div>
{/if}
{#if tab_active == tabs[1]}
    <div class="drawer-container">
        <!-- Don't include fixed={false} if this is a page wide drawer.
              It adds a style for absolute positioning. -->

        <Drawer style="height: 100vh;">
            <Content>
                <List>
                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('Heatmap')}
                            activated={active === 'Heatmap'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">table_chart</Graphic>
                        <Text>Heatmap</Text>
                    </Item>

                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('Consensus View')}
                            activated={active === 'Consensus View'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">show_chart</Graphic>
                        <Text>Consensus View</Text>
                    </Item>

                    <Item
                            href="javascript:void(0)"
                            on:click={() => setActive('Genome View')}
                            activated={active === 'Genome View'}
                    >
                        <Graphic class="material-icons" aria-hidden="true">biotech</Graphic>
                        <Text>Genome View</Text>
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
                {#if active === "Heatmap"}
                    <div style="margin-top: 10vh">
                        <PlotlyHeatmapContainer on:heatmap-click={handleHeatmapClick} />
                    </div>
                {:else if active === "Consensus View"}
                    {#if typeof combination !== "undefined"}
                        <ConsensusContainer {combination} />
                        <Button style="display: inline; margin-right: 76%;" on:click={() => {active = "Heatmap"}} touch variant="unelevated">
                            <Icon class="material-icons">arrow_back</Icon>
                            <Label>Heatmap</Label>
                        </Button>

                        <Button style="display: inline;" on:click={() => {active = "Genome View"}} touch variant="unelevated">
                            <Label>Genome View</Label>
                            <Icon class="material-icons">arrow_forward</Icon>
                        </Button>
                    {:else }
                        <p> Click the Heatmap cell first to select data! <p>
                    {/if}
                {:else if active === "Genome View"}
                    {#if typeof combination !== "undefined"}
                        <Modal>
                            <GenomeViewContainer {combination} style="margin-bottom: 5%"/>
                            <Button style="display: inline; margin-right: 70%;" on:click={() => {active = "Heatmap"}} touch variant="unelevated">
                                <Icon class="material-icons">arrow_back</Icon>
                                <Label>Heatmap</Label>
                            </Button>

                            <Button style="display: inline" on:click={() => {active = "Consensus View"}} touch variant="unelevated">
                                <Label>Consensus View</Label>
                                <Icon class="material-icons">arrow_forward</Icon>
                            </Button>
                        </Modal>
                    {:else }
                        <p> Click the Heatmap cell first to select data! <p>
                    {/if}
                {/if}

            </main>
        </AppContent>
    </div>
{/if}
<Footer />




<style>
    /* These classes are only needed because the
      drawer is in a container on the page. */
    .drawer-container {
        position: relative;
        display: flex;
        height: 200vh;
        max-width: 100%;
        /*border: 1px solid;*/
        /*var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));*/
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


    /*.drawer-container {*/
    /*    position: relative;*/
    /*    display: flex;*/
    /*    height: 350px;*/
    /*    max-width: 600px;*/
    /*    border: 1px solid*/
    /*    var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));*/
    /*    overflow: hidden;*/
    /*    z-index: 0;*/
    /*}*/

    /** :global(.app-content) {*/
    /*    flex: auto;*/
    /*    overflow: auto;*/
    /*    position: relative;*/
    /*    flex-grow: 1;*/
    /*}*/

    /*.main-content {*/
    /*    overflow: auto;*/
    /*    padding: 16px;*/
    /*    height: 100%;*/
    /*    box-sizing: border-box;*/
    /*}*/
</style>