<script lang="ts">
    import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
    import IconButton, { Icon } from '@smui/icon-button';

    import Card, {
        Content,
        PrimaryAction,
        Media,
        MediaContent,
    } from '@smui/card';

    let general_panel1Open = true;
    let general_panel2Open = false;
    let general_panel3Open = false;
    let general_panel4Open = false;

    let heatmap_panel1Open = false;
    let heatmap_panel2Open = false;
    let heatmap_panel3Open = false;
    let heatmap_panel4Open = false;

    let consensus_panel1Open = false;
    let consensus_panel2Open = false;
    let consensus_panel3Open = false;
    let consensus_panel4Open = false;

    let genome_panel1Open = false;
    let genome_panel2Open = false;
    let genome_panel3Open = false;
    let genome_panel4Open = false;

    let data_panel1Open = false;
    let data_panel2Open = false;
    let data_panel3Open = false;
    let data_panel4Open = false;
    let data_panel5Open = false;
    let data_panel6Open = false;
</script>

<div style="margin-left: 10%; margin-right: 10%">

    <h2>
        General Guidance
    </h2>
    <div class="accordion-container">
        <Accordion>
            <Panel bind:open={general_panel1Open}>
                <Header>
                    Where to start
                    <IconButton slot="icon" toggle pressed={general_panel1Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="start-1" aspectRatio="16x9">
                                <MediaContent>
                                    <h2
                                            class="mdc-typography--headline6"
                                            style="color: #fff; position: absolute; bottom: 16px; left: 16px; margin: 0;"
                                    >
                                        Assay Types
                                    </h2>
                                </MediaContent>
                            </Media>
                            <Content style="color: #888;">You can click the "start browsing" button in the main page.
                                Or you can just click the "Browse" Tab in the tab-bar.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={general_panel2Open}>
                <Header>
                    How to Use it
                    <IconButton slot="icon" toggle pressed={general_panel2Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="general-2" aspectRatio="16x9">
                                <MediaContent>
                                    <h2
                                            class="mdc-typography--headline6"
                                            style="color: #fff; position: absolute; bottom: 16px; left: 16px; margin: 0;"
                                    >
                                        Assay Types
                                    </h2>
                                </MediaContent>
                            </Media>
                            <Content style="color: #888;">Select Data => Go to Heatmap => Click Heatmap Cell => Consensus View & Genome View  </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={general_panel3Open}>
                <Header>
                    Drawer Menu
                    <IconButton slot="icon" toggle pressed={general_panel3Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="general-2" aspectRatio="16x9">
                                <MediaContent>
                                    <h2
                                            class="mdc-typography--headline6"
                                            style="color: #fff; position: absolute; bottom: 16px; left: 16px; margin: 0;"
                                    >
                                        Assay Types
                                    </h2>
                                </MediaContent>
                            </Media>
                            <Content style="color: #888;">You can click the "menu" button to see display the drawer menu.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>

        </Accordion>
    </div>
    <br>
    <hr/>
    <br>

    <h2>
        Browse Heatmap
    </h2>
    <div class="accordion-container">
        <Accordion>
            <Panel bind:open={heatmap_panel1Open}>
                <Header>
                    Assay Types
                    <IconButton slot="icon" toggle pressed={heatmap_panel1Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="heatmap-1" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">Select the Assay Types here. The default section is DNA type where Chip-seq and DNA-seq will be displayed in.
                                And the another option is RNA type.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={heatmap_panel2Open}>
                <Header>
                    Alignment Types
                    <IconButton slot="icon" toggle pressed={heatmap_panel2Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="heatmap-1" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">Choose the type of alignments. "UNI" means the RPKM of reads uniquely mapped to the genome region,
                                while "ALL" represents the RPKM of reads uniquely mapped and multi mapped. </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={heatmap_panel3Open}>
                <Header>
                    Scale Bar
                    <IconButton slot="icon" toggle pressed={heatmap_panel3Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="heatmap-3" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;"> Drag the slider or type the number in the box.
                                The value of scale bar is the maximum value of the heatmap bar.  </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
        </Accordion>
    </div>
    <br>
    <hr/>
    <br>

    <h2>
        Browse Consensus View
    </h2>
    <div class="accordion-container">
        <Accordion>
            <Panel bind:open={consensus_panel1Open}>
                <Header>
                    Where to Start
                    <IconButton slot="icon" toggle pressed={consensus_panel1Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="consensus-4" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">Click one heatmap cell, then it will automatically jump to the consensus view.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={consensus_panel2Open}>
                <Header>
                    Consensus View
                    <IconButton slot="icon" toggle pressed={consensus_panel2Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="consensus-1" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">The plot displays the selected data volume on the selected subfamily consensus region.
                                The consensus region is aligned by rmsk.txt file produced by RepeatMasker.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={consensus_panel3Open}>
                <Header>
                    Different Assays
                    <IconButton slot="icon" toggle pressed={consensus_panel3Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="consensus-2" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">The Chip-seq has both signal and control view. The DNA-seq only has one view. The RNA don't have
                                unique reads.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={consensus_panel4Open}>
                <Header>
                    All and Unique
<!--                    <span slot="description">Description of panel 4.</span>-->
                    <IconButton slot="icon" toggle pressed={consensus_panel4Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="consensus-3" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">The "unique reads" represents the reads uniquely mapped to the consensus region.
                                The "all reads" represents the reads mapped to multi consensus region.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
        </Accordion>
    </div>
    <br>
    <hr/>
    <br>

    <h2>
        Browse Genome View
    </h2>
    <div class="accordion-container">
        <Accordion>
            <Panel bind:open={genome_panel2Open}>
                <Header>
                    The Genome View
                    <IconButton slot="icon" toggle pressed={genome_panel2Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="genome-1" aspectRatio="16x9">
                            <Content style="color: #888;">The red lines is the loci of the repeats of the selected subfamily on the chromosomes.</Content>
                            </Media>
                        </Card>
                    </div>
                </Content>
            </Panel>

            <Panel bind:open={genome_panel3Open}>
                <Header>
                    The Genome Plot
                    <IconButton slot="icon" toggle pressed={genome_panel3Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="genome-2" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;">Click the blue area in the chromosomes, then it will display a detailed plot view which can be zoom in/out.</Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
        </Accordion>
    </div>
    <br>
    <hr/>
    <br>

    <h2>
        Data Selection
    </h2>
    <div class="accordion-container">
        <Accordion>
            <Panel bind:open={data_panel1Open}>
                <Header>
                    Overview
                    <IconButton slot="icon" toggle pressed={data_panel1Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="heatmap_assay" aspectRatio="16x9">
                                <MediaContent>
                                    <h2
                                            class="mdc-typography--headline6"
                                            style="color: #fff; position: absolute; bottom: 16px; left: 16px; margin: 0;"
                                    >
                                        Assay Types
                                    </h2>
                                </MediaContent>
                            </Media>
                            <Content style="color: #888;"> Our browser provides some default data for you to browse.
                                Also you can upload your own processed data and display it with out browser. </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={data_panel2Open}>
                <Header>
                    Remove Data or Repeats(Subfamilies)
                    <IconButton slot="icon" toggle pressed={data_panel2Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="data-3" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;"> You can always remove the data or repeat in the file site. </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={data_panel3Open}>
                <Header>
                    Repeats Selection
                    <IconButton slot="icon" toggle pressed={data_panel3Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>This figure has two hierarchy: Class => Family => Subfamily. Click once to enter a higher hierarchy,
                    double click to select the data (unable to select a whole class).</Content>
            </Panel>
            <Panel bind:open={data_panel4Open}>
                <Header>
                    Default Data Selection
                    <IconButton slot="icon" toggle pressed={data_panel4Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="data-1" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;"> 1. Click the number in the cell to open the table.
                                2. And click the status cell to select or remove the data. </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>
            <Panel bind:open={data_panel5Open}>
                <Header>
                    Data Upload
                    <IconButton slot="icon" toggle pressed={data_panel5Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="data-2" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;"> First, use our pipeline to generate a .zarr data. Then, input the .zarr data URL into the browser.
                                For the users who store the data locally, the npm package "http-server" might be of help to generate an html URL. </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>

            <Panel bind:open={data_panel6Open}>
                <Header>
                    Data Resume
                    <IconButton slot="icon" toggle pressed={data_panel5Open}>
                        <Icon class="material-icons" on>expand_less</Icon>
                        <Icon class="material-icons">expand_more</Icon>
                    </IconButton>
                </Header>
                <Content>
                    <div class="card-container">
                        <Card>
                            <Media class="data-4" aspectRatio="16x9">
                            </Media>
                            <Content style="color: #888;"> First, click the DOWNLOAD SESSION JSON FILE in the file site and download the json file. Then, upload the json file,
                                you will get the same data view. </Content>
                        </Card>
                    </div>
                </Content>
            </Panel>

        </Accordion>
    </div>

</div>

<style>
    * :global(.start-1) {
        background-image: url(/tutorial_img/start-1.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.general-2) {
        background-image: url(/tutorial_img/general-2.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.general-2) {
        background-image: url(/tutorial_img/general-3.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.heatmap-1) {
        background-image: url(/tutorial_img/heatmap-1.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.heatmap-2) {
        background-image: url(/tutorial_img/heatmap-2.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.heatmap-3) {
        background-image: url(/tutorial_img/heatmap-3.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.consensus-1) {
        background-image: url(/tutorial_img/consensus-1.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.consensus-2) {
        background-image: url(/tutorial_img/consensus-2.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.consensus-3) {
        background-image: url(/tutorial_img/consensus-3.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.consensus-4) {
        background-image: url(/tutorial_img/consensus-4.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.genome-1) {
        background-image: url(/tutorial_img/genome-1.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.genome-2) {
        background-image: url(/tutorial_img/genome-2.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.data-1) {
        background-image: url(/tutorial_img/data-1.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.data-2) {
        background-image: url(/tutorial_img/data-2.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.data-3) {
        background-image: url(/tutorial_img/data-3.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.data-4) {
        background-image: url(/tutorial_img/data-4.png);
        max-width: 50%;
        margin-left: 25%;
    }

    * :global(.card-media-square) {
        background-image: url(https://place-hold.it/320x320?text=square&fontsize=23);
    }
</style>
