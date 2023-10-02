import introJS from "intro.js"
import { link, navigate } from "svelte-routing";
// import Tour from "./bootstrap-tour-standalone.min"
// import Tour from "./bootstrap-tour"


export function bootstrapTour(){
    const tour = new Tour({
        steps: [
            {
                title: "Welcome",
                backdrop: false,
                content: "Welcome to the tour guidance!",
                onNext: function(tour){
                    navigate('input/data')
                }
            },
            {
                element: "#default-data-table",
                title: "Step 1 Input Data",
                placement: "bottom",
                content: "For input data, users have three options. <BR/>" +
                    "1) Select default data. <BR/>" +
                    "2) Upload their own data. <BR/>" +
                    "3) Upload a session json file. <BR/>" +
                    "You may choose one of these steps. "
            },
            {
                element: "#default-data-table",
                title: "Step 1-1 Select default data",
                placement: "top",
                content: "Select the default data by clicking the numbers in the blue cells.",
                backdrop: false,
                onNext: function(tour){
                    navigate('upload')
                }
            },
            {
                element: "#file-upload",
                title: "Step 1-2 & 1-3 Upload",
                placement: "bottom",
                content: "Besides of selecting default data, you can choose upload here.",
            },
            {
                element: "#zarr-upload",
                title: "Step 1-2 Upload your own data.",
                backdrop: false,
                placement: "top",
                content: "Besides of selecting default data, you can choose uploading the zarr file here.",
            },
            {
                element: "#session-upload",
                title: "Step 1-3 Upload the session json file.",
                backdrop: false,
                placement: "bottom",
                content: "Or you can choose uploading the session json here.",
                onNext: function(tour){
                    navigate('repeats')
                }
            },
            {
                element: "#repeats-sunburst",
                title: "Step 2 Select the repeats.",
                placement: "bottom",
                content: "Select the Repeat Subfamilies in this page."
            },
            {
                element: "#repeats-sunburst",
                title: "Step 2 Repeat Sunburst Chart.",
                placement: "top",
                backdrop: false,
                content: "1) Click once to zoom in, <BR/>" +
                    "2) Click twice to select the repeats, <BR/>" +
                    "3) Click the blank middle to zoom out."
            },
            {
                element: "#repeats-search",
                title: "Step 2 Repeat Sunburst Chart.",
                placement: "bottom",
                backdrop: false,
                content: "Search the subfamilies you need and click to select.",
                onNext: function(tour){
                    navigate('../visual/heatmap')
                }
            },
            {
                element: "#repeats-search",
                title: "Step 3 Visualization.",
                placement: "bottom",
                content: "In this step, you will have three visualized plots (Heatmap, Consensus View, Genome View.)."
            },
            {
                element: "#heatmap-card",
                title: "Step 3-1 Heatmap.",
                placement: "top",
                backdrop: false,
                content: "The heatmap implies the enrichment of each data in each repeat subfamilies. <BR/>" +
                    "Click the cell on the heatmap to go to the consensus view.",
                onNext: function(tour){
                    navigate('consensus')
                }
            },
            {
                element: "#consensus-drawer-bar",
                title: "Step 3-2 Consensus View.",
                placement: "bottom",
                backdrop: false,
                content: "The consensus view implies the enrichment of each data in each repeat subfamilies on reads wild.",
                onNext: function(tour){
                    navigate('genome')
                }
            },
            {
                element: "#genome-drawer-bar",
                title: "Step 3-3 Genome View.",
                placement: "bottom",
                backdrop: false,
                content: "The genome view implies the distribution of repeats copy on the genome."
            }
        ],
        debug: true,
        orphan: true,
        backdrop: true,
        storage: false
    });
    tour.init();
    tour.restart();
}

export function repeatsTour(){
    const tour = new Tour({
        steps: [
            {
                element: "#repeats-sunburst",
                title: "Repeat Sunburst Chart.",
                placement: "top",
                content: "1) Click once to zoom in, <BR/>" +
                    "2) Click twice to select the repeats, <BR/>" +
                    "3) Click the blank middle to zoom out."
            },
            {
                element: "#repeats-search",
                title: "Repeat Search.",
                placement: "bottom",
                content: "Search the subfamilies you need and click to select."
            },
            {
                element: "#repeats-list",
                title: "Repeat List.",
                placement: "top",
                content: "The list of your selected repeats."
            }
        ],
        debug: true,
        orphan: true,
        storage: false
    });
    tour.init();
    tour.restart();
}

export function heatmapTour(){
    const tour = new Tour({
        steps: [
            {
                element: "#heatmap-assay-type",
                title: "Data Assay Type(DNA or Cage).",
                placement: "bottom",
                content: "Since data with different assay type are displayed in different heatmap, " +
                    "please select the assay type you need."
            },
            {
                element: "#heatmap-switch",
                title: "Read Alignment Type.",
                placement: "bottom",
                content: "Click the button to switch the alignment type between Unique and All."
            },
            {
                element: "#heatmap-bar",
                title: "Heatmap Scale Bar.",
                placement: "bottom",
                content: "Change the threshold of the scale bar, " +
                    "you can enter any number in the input box or scroll the slider."
            }
        ],
        debug: true,
        orphan: true,
        storage: false
    });
    tour.init();
    tour.restart();
}

export function uploadTour(){
    const tour = new Tour({
        steps: [
            {
                element: "#zarr-upload",
                title: "Upload the zarr file address here.",
                placement: "top",
                content: "You can upload the zarr file link here, only http address is accepted."
            },
            {
                element: "#session-upload",
                title: "Upload the session file here.",
                placement: "bottom",
                content: "You can recover your session by uploading session file here. <br>" +
                    "Session json file records the files and repeats name, " +
                    "which can be downloaded at /input/display page."
            },
        ],
        debug: true,
        orphan: true,
        storage: false
    });
    tour.init();
    tour.restart();
}

export function dataTour(){
    const tour = new Tour({
        steps: [
            {
                element: "#data-file-virtualist",
                title: "Current files display.",
                placement: "bottom",
                content: "This virtualist displays the current files."
            },
            {
                element: "#default-data-table",
                title: "Data table",
                placement: "top",
                content: "Click the blue button, on which there's a number, " +
                    "and then click the status button to select the data."
            },
        ],
        debug: true,
        orphan: true,
        storage: false
    });
    tour.init();
    tour.restart();
}

export function startTour(){
    introJS().setOptions({
        steps: [
            {
                element: document.querySelector('#img1'),
                intro: 'This step focuses on an image'
            },
            {
                element: document.querySelector('#dataGuidence'),
                intro: 'Change Pages'
            },
            {
                title: 'Farewell!',
                element: document.querySelector('#img2'),
                intro: 'And this is our final step!'
            }]
    }).start();
}

export function startTour2(){
    introJS().setOptions({
        steps: [
            {
                element: document.querySelector('#img1'),
                intro: 'Hello world!'
            },
            {
                title: 'Farewell!',
                element: document.querySelector('#img2'),
                intro: 'And this is our final step!'
            },
            {
                element: document.querySelector('#dataGuidence'),
                intro: 'Change Pages'
            },]
    }).start();
}
