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
    import BasePairRuler from "/src/examples/basepairRuler.svelte"
    // import { Tour, TourTip, run, TourItem} from 'svelte-tour';
    import {onMount} from "svelte";

    import introJS from "intro.js"
    import {startTour, bootstrapTour} from "../api/toursteps";
    // import { Body, classList, style } from "svelte-body";
    export let browse;
    // onMount(()=>{})
</script>

<!--<BasePairRuler />-->
<!--<Tour TourTip={TourTip} />-->

<!--<TourItem message="This is a button I want to include in the tour.">-->
<!--    <button>Click here</button>-->
<!--</TourItem>-->



<!--<section class="header relative items-center flex h-screen max-h-860-px">-->
<!--    <div class="container mb-24 mx-auto items-center flex flex-wrap">-->
<!--        <div class="w-full md:w-6/12 lg:w-6/12 xl:w-6/12 px-4">-->
<!--            <div class="pt-16 sm:pt-0">-->
<!--                <h2 class="font-semibold text-4xl text-blueGray-600">-->
<!--                    WashU Repeat Browser - <br>An useful tool to analyse repeats.-->
<!--                </h2>-->
<!--                <p class="mt-4 text-lg leading-relaxed text-blueGray-500">-->
<!--                    WashU Repeat Browser is Free and Open Source. you can access it from the-->
<!--                    <a-->
<!--                            href="https://github.com/Jiawei-Shen/rptbrs"-->
<!--                            class="text-blueGray-600"-->
<!--                            target="_blank"-->
<!--                    >-->
<!--                        Github repo.-->
<!--                    </a>-->
<!--                    It features three different data plots and it comes with ENCODE (The Encyclopedia of DNA Elements).-->
<!--                </p>-->
<!--                <div class="mt-12">-->
<!--                    <a-->
<!--                            use:link-->
<!--                            href="input/data"-->
<!--                            class="no-underline get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-red-400 active:bg-red-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"-->
<!--                    >-->
<!--                       Start Browsing!-->
<!--                    </a>-->

<!--                    <a-->
<!--                            on:click={bootstrapTour}-->
<!--                            class="no-underline github-star cursor-pointer ml-1 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-700 active:bg-blueGray-600 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"-->
<!--                    >-->
<!--                        Start the Guide Tour!-->
<!--                    </a>-->

<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--    <div class="w-full md:w-11/24 mr-auto px-4 pt-24 md:pt-0">-->
<!--        <img-->
<!--                alt="..."-->
<!--                class="max-w-full rounded-lg shadow-xl"-->
<!--                style="-->
<!--            transform: scale(1.3) perspective(1040px) rotateY(-11deg)-->
<!--              rotateX(2deg) rotate(2deg);-->
<!--          "-->
<!--                src="/images/washu_mainpage.png"-->
<!--        />-->
<!--    </div>-->
<!--&lt;!&ndash;    <img&ndash;&gt;-->
<!--&lt;!&ndash;            class="absolute top-0 b-auto right-0 sm:w-6/12 -mt-48 sm:mt-0 w-10/12 max-h-860-px"&ndash;&gt;-->
<!--&lt;!&ndash;            src="{patternVue}"&ndash;&gt;-->
<!--&lt;!&ndash;            alt="..."&ndash;&gt;-->
<!--&lt;!&ndash;    />&ndash;&gt;-->
<!--</section>-->

<section class="relative items-center flex h-75screen max-h-860-px">
    <div class="container mx-auto px-4 pb-6">
        <div class="items-center flex flex-wrap">
            <div class="w-full md:w-11/24 px-12 md:px-4">
                <div class="w-10/12 pt-16 sm:pt-0">
                    <h2 class="font-semibold text-4xl text-blueGray-600">
                        WashU Repeat Browser - <br>A useful tool to analyze repeats.
                    </h2>
                    <p class="mt-4 text-lg leading-relaxed text-blueGray-500">
                        WashU Repeat Browser is Free and Open Source. you can access it from the
                        <a
                                href="https://github.com/Jiawei-Shen/rptbrs"
                                class="text-blueGray-600 underline"
                                target="_blank"
                        >
                            Github repo.
                        </a>
                        It features three data plots and comes with ENCODE (The Encyclopedia of DNA Elements).
                    </p>
                    <div class="mt-12">
                        <a
                                use:link
                                href="input/data"
                                class="no-underline get-started text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blue-400 active:bg-blue-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                        >
                            <i class="fa fa-fw fa-eye"></i>
                            Start Browsing!
                        </a>

                        <a
                                on:click={bootstrapTour}
                                class="no-underline github-star cursor-pointer ml-1 text-white font-bold px-4 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-700 active:bg-blueGray-600 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                        >
                            <i class="fa fa-fw fa-map"></i>
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
            transform: scale(1.2) perspective(1040px) rotateY(-11deg)
              rotateX(2deg) rotate(2deg);
          "
                        src="/images/washu_mainpage.png"
                />
            </div>
        </div>
    </div>
</section>




<!--<div style="text-align: center;margin-bottom: 2rem;margin-top: 2rem" id="img1">-->
<!--    <img src="./images/welcome.png" class="welcome-image">-->
<!--</div>-->

<!--<div style="text-align: center;margin-bottom: 2rem;margin-top: 2rem;margin-left: 30%;max-width: 40%">-->
<!--    <img on:click="{() => navigate('/browser')}" style="cursor: pointer" src="./images/start_browsing.png" class="welcome-image">-->
<!--</div>-->

<!--<div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">-->
<!--    <Fab-->
<!--            on:click={bootstrapTour}-->
<!--            target="_blank"-->
<!--            extended-->
<!--            style="width:40vh;height: 16vh;"-->
<!--    >-->
<!--        <Label style="font-size: 30px">Start Browsing!</Label>-->
<!--    </Fab>-->
<!--</div>-->

<!--&lt;!&ndash;<div style="text-align: center;margin-bottom: 2rem;margin-top: 2rem;margin-left: 30%;max-width: 40%">&ndash;&gt;-->
<!--&lt;!&ndash;    <img on:click={handleclick} style="cursor: pointer" src="./images/start_browsing.png" class="welcome-image">&ndash;&gt;-->
<!--&lt;!&ndash;</div>&ndash;&gt;-->

<!--<div style="text-align: center;margin-bottom: 2rem;margin-top: 2rem;" id="img2">-->
<!--    <img src="./images/washu_mainpage.png" class="mainpage-image">-->
<!--</div>-->

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
