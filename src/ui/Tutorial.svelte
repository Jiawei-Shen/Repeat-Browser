<script lang="ts">
    import Drawer, {
        AppContent,
        Content,
        Header,
        Title,
        Subtitle,
        Scrim,
    } from '@smui/drawer';
    import Fab from '@smui/fab';
    import Button, { Label, Icon } from '@smui/button';
    import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
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
    import { H6 } from '@smui/common/elements';
    import {onDestroy, onMount} from "svelte";
    import BrowseData from './tutorial_browse/browse_data.svelte'

    let typemenu: MenuComponentDev;
    let heatmapmenu: MenuComponentDev;
    let menu: MenuComponentDev;
    let selected_type = 'Files';
    let heatmap_type = 'ALL';

    let open = true;
    // let active = 'Inbox';

    let combination = undefined;
    let active = 'Browse Data';
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

    // onMount(() => {
    //     Cart.addDataItems(defaultData.data);
    //     Cart.addRepeats(defaultData.repeats);
    // })

    function setActive(value: string) {
        active = value;
        open = false;
    }
</script>


<div class="drawer-container">
    <!-- Don't include fixed={false} if this is a page wide drawer.
          It adds a style for absolute positioning. -->

    <Drawer variant="modal" fixed={false} bind:open>
        <Header>
            <Title>Tutorial</Title>
            <Subtitle>WashU Repeat Browser Tutorial</Subtitle>
        </Header>
        <Content>
            <List>
                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Create Data')}
                        activated={active === 'Create Data'}
                >
                    <Graphic class="material-icons" aria-hidden="true">folder_open</Graphic>
                    <Text>How to create data</Text>
                </Item>

                <Separator />

                <Item
                        href="javascript:void(0)"
                        on:click={() => setActive('Browse Data')}
                        activated={active === 'Browse Data'}
                >
                    <Graphic class="material-icons" aria-hidden="true">toc</Graphic>
                    <Text>How to browse</Text>
                </Item>
            </List>
        </Content>
    </Drawer>

    <!-- Don't include fixed={false} if this is a page wide drawer.
          It adds a style for absolute positioning. -->
    <Scrim fixed={false} />
    <AppContent class="app-content">
        <main class="main-content">

            <Button on:click={() => (open = !open)}
                    variant="unelevated"
                    class="button-shaped-round"
                    style="position: fixed; left: 2rem; bottom: 3rem; z-index: 2"
            >
                <Icon class="material-icons">menu</Icon>
                <Label>Menu</Label>
            </Button>

            <br />
            {#if active === "Create Data"}

            {:else if active === "Browse Data"}
                <BrowseData />
            {/if}

        </main>
    </AppContent>
</div>






<style>
    /* These classes are only needed because the
      drawer is in a container on the page. */
    .drawer-container {
        position: relative;
        display: flex;
        min-height: 400px;
        max-width: 100%;
        /*border: 1px solid*/
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
        box-sizing: border-box;
    }

    .menu-abs{
        position:fixed;
        left:5rem;
        bottom:5rem;
    }
</style>