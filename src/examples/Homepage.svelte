<script>
    import LayoutGrid, { Cell } from '@smui/layout-grid';
    import ImageList, {
        Item,
        ImageAspectContainer,
        Image,
        Supporting,
        Label,
    } from '@smui/image-list';
    // import { Router, Route, Link, navigate } from "svelte-navigator";
    import Fab from '@smui/fab';
    import Browser from "../ui/Browser.svelte"
    const patternVue = "/assets/img/pattern_svelte.png";
    import { link, navigate } from "svelte-routing";
    import annotations from "/src/json/SRR562646.json"
    import BasePairRuler from "/src/examples/basepairRuler.svelte"
    // import { Tour, TourTip, run, TourItem} from 'svelte-tour';
    import {onMount} from "svelte";

    import introJS from "intro.js"
    import {startTour, bootstrapTour} from "../api/toursteps";
    // import { Body, classList, style } from "svelte-body";
    export let browse;

    onMount(()=>{
    })
</script>


<section class="relative items-center flex h-75screen max-h-860-px">
    <div class="container mx-auto px-4 pb-6">
        <div class="items-center flex flex-wrap">
            <div class="w-full md:w-11/24 px-12 md:px-4">
                <div class="w-10/12 pt-16 sm:pt-0">
                    <h2 class="font-semibold text-4xl text-blueGray-600">
                        WashU Repeat Browser - <br>A useful tool to analyze repeats.
                    </h2>
                    <p class="mt-4 text-lg leading-relaxed text-blueGray-500">
                        WashU Repeat Browser is Free and Open Source. We provide a <a style="color: blue;text-decoration: underline;" href="https://github.com/Jiawei-Shen/Repeat-Browser">Github Repo</a> of this tool.
                        It features three data plots and comes with ENCODE (The Encyclopedia of DNA Elements).
                    </p>
                    <div class="mt-12">
                        <a
                                use:link
                                href="input/data"
                                class="no-underline get-started text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blue-400 active:bg-blue-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                        >
                            Start Browsing!
                        </a>

                        <a
                                on:click={bootstrapTour}
                                class="no-underline github-star cursor-pointer ml-1 text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-700 active:bg-blueGray-600 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                        >
                            Start Guide Tour!
                        </a>

                    </div>
                </div>
            </div>

            <div class="w-full right-0 md:w-6/12 mr-auto px-4 pt-24 md:pt-0">
                <img
                        alt="..."
                        class="max-w-full rounded-lg shadow-xl"
                        style="
            transform: scale(0.8) perspective(860px) rotateY(-11deg)
              rotateX(2deg) rotate(2deg);
          "
                        src="/images/Figure1_ver2.png"
                />
            </div>
        </div>
    </div>
</section>

<section class="relative items-center flex h-75screen max-h-860-px">
    <div class="container mx-auto px-4 pb-6">
        <div class="items-center flex flex-wrap">
            <div class="w-full md:w-11/24 px-12 md:px-4">
                <div class="w-10/12 pt-16 sm:pt-0">
                    <h2 class="font-semibold text-4xl text-blueGray-600">
                        Step 1: Select the Data <br>
                    </h2>
                    <h2 class="font-semibold text-xl text-blueGray-600">
                        Use online data or your own data
                    </h2>
                    <p class="mt-4 no-underline get-started text-white font-bold px-4 py-4 rounded outline-none mr-1 mb-1 bg-blue-400 uppercase text-sm shadow ease-linear">
                        Pick the online zarr data in this website.
                    </p>
                    <p class="mt-1 text-lg leading-relaxed text-blueGray-500">
                        The online data is the data processed by our pipeline, where the data is from the ENCODE,
                        Roadmap, and FANTOM dataset. <br>
                        Input Data >> Files Selection >> Click the Table!
                    </p>
                    <p class="mt-4 no-underline get-started text-white font-bold px-4 py-4 rounded outline-none mr-1 mb-1 bg-blue-400 uppercase text-sm shadow ease-linear">
                        Process your data using our pipeline
                    </p>
                    <p class="mt-1 text-lg leading-relaxed text-blueGray-500">
                        We provide a pipeline on the <a style="color: blue" href="https://github.com/Jiawei-Shen/Repeat-Browser">Github page</a>.
                        You can input your own fastq or bam files to produce the zarr file. <br>
                    </p>
                    <div class="mt-12">

                    </div>
                </div>
            </div>

            <div class="w-full right-0 md:w-6/12 mr-auto px-4 pt-24 md:pt-0">
                <img
                        alt="..."
                        class="max-w-full rounded-lg shadow-xl"
                        style="
            transform: scale(0.8) perspective(1040px) rotateY(-11deg)
              rotateX(2deg) rotate(2deg);
          "
                        src="/images/web_homepage2.png"
                />
            </div>
        </div>
    </div>
</section>

<section class="relative items-center flex h-75screen max-h-860-px">
    <div class="container mx-auto px-4 py-6">
        <div class="items-center flex flex-wrap">
            <div class="w-full md:w-11/24 px-12 md:px-4">
                <div class="w-10/12 pt-16 sm:pt-0">
                    <h2 class="font-semibold text-4xl text-blueGray-600">
                        Step 2: Visualize the Data <br>
                    </h2>
                    <h2 class="font-semibold text-xl text-blueGray-600">
                        Visualize the data in the step 1.
                    </h2>
                    <p class="mt-4 no-underline get-started text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blue-400 active:bg-blue-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150">
                       Heatmap
                    </p>
                    <p class="mt-1 text-lg leading-relaxed text-blueGray-500">
                        Display the enrichment of the data on different TE subfamilies.<br>
                    </p>
                    <p class="mt-4 no-underline get-started text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blue-400 active:bg-blue-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150">
                        Consensus View
                    </p>
                    <p class="mt-1 text-lg leading-relaxed text-blueGray-500">
                        A line chart displayed the distribution of data on the consensus regions. <br>
                    </p>
                    <p class="mt-4 no-underline get-started text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blue-400 active:bg-blue-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150">
                        Genome View
                    </p>
                    <p class="mt-1 text-lg leading-relaxed text-blueGray-500">
                        Displayed the distribution of data on the chromosomes. <br>
                    </p>
                </div>
            </div>

            <div class="w-full right-0 md:w-6/12 mr-auto px-4 pt-24 md:pt-0">
                <img
                        alt="..."
                        class="max-w-full rounded-lg shadow-xl"
                        style="
            transform: scale(1.2) perspective(1040px) rotateY(-11deg)
              rotateX(2deg) rotate(2deg);
          "
                        src="/images/web_homepage3.png"
                />
            </div>
        </div>
    </div>
</section>


<style>
    .mainpage-image{
        max-width: 100%;
        text-align: center;
        display: inline;
    }

    .welcome-image{
        max-width: 50%;
        text-align: center;
        display: inline;
    }

    body{
        font: 14px Arial; line-height: 19.6px; padding: 0 15px;
        min-height: 150vh;

        margin: 0;
        background-attachment: fixed;
        background-color: hsl(209, 36%, 86%);
        background-size: 100vw 100vh;
        background-image: radial-gradient(
                50% 50% at 50% 50%,
                rgba(255, 255, 255, 0.75) 0%,
                rgba(255, 255, 255, 0) 100%
        ),
        linear-gradient(180deg, rgb(202, 216, 228) 0%, hsl(209, 36%, 86%) 15%, hsl(224, 44%, 95%) 50%);
    }

</style>
