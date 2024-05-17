<script>
  import {Router, Route, link, navigate} from "svelte-routing";
  import {Cart} from "/src/stores/CartStore";
  import Footer from "./ui/footer.svelte"
  import Myapp from "./myapp"
  import Input from "./ui/Layout/InputLayout.svelte"
  import Visual from "./ui/Layout/VisualLayout.svelte"
  import {Graphic} from '@smui/list';

  let cartData;
  let cartRepeats
  const unsubscribe = Cart.subscribe(async store => {
    const { data, repeats } = store;
    cartData = data;
    cartRepeats = repeats;
  })

  function altertNum(){
    let rna_data = cartData.filter((el) => (el.Assay.includes("CAGE") || el.Assay.includes("RNA")));
    let dna_data = cartData.filter((el) => !(el.Assay.includes("CAGE") || el.Assay.includes("RNA")));
    if((dna_data.length < 2 && rna_data.length < 2) || (cartRepeats < 2)){
      var result = alert("Please select at least two data and two repeats!");
      navigate("/input/data");
      console.log("Performing function for OK.");
    } else {
      navigate("/visual/heatmap");
    }
  }

  export let url = "";
</script>

<nav class="flex items-center justify-between flex-wrap bg-sky-600 p-2">
  <div class="flex items-center flex-shrink-0 text-white mr-6">
    <img class="fill-current h-10 w-12 mr-2" width="54" height="54" viewBox="0 0 54 54" src="/images/rb_logo.svg">
    <span class="font-semibold text-2xl tracking-tight">Repeat Browser</span>
    {#if $Cart.biosample === 'Mouse'}
      <Graphic class="material-icons pl-2" aria-hidden="true"> pest_control_rodent </Graphic>
    {:else}
      <Graphic class="material-icons pl-2" aria-hidden="true"> accessibility_new </Graphic>
    {/if}
  </div>
  <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
    <div class="text-base lg:flex-grow">
      <a href="/" use:link class="hover:no-underline block mt-4 lg:inline-block lg:mt-0 hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium text-white mr-4">
        <i class="fa fa-fw fa-home"></i>
        Homepage
      </a>
      <a href="/input/data" use:link class="block mt-4 lg:inline-block lg:mt-0 hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium text-white mr-4">
        <i class="fa fa-fw fa-inbox"></i>
        Input Data: {$Cart.data.length} Files and {$Cart.repeats.length} Repeats
      </a>
      <!--            <a href="#" class="hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Data Visualization</a>-->
      <a on:click={altertNum} use:link class="block mt-4 lg:inline-block lg:mt-0 hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium text-white mr-4">
        <i class="fa fa-fw fa-chart-line"></i>
        Data Visualization
      </a>
    </div>



    <div class="flex items-center flex-shrink-0 text-white">
      <a href="https://rb-doc.readthedocs.io/en/latest/" class="inline-block text-sm px-4 py-2 leading-none border rounded text-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">
        <i class="fa fa-fw fa-book"></i>
        Document
      </a>
      <a href="https://medicine.wustl.edu/"><img src="/images/School_of_Medicine_2linehrz_pos(RGB)1000-01.png" alt="" width="90" height="90" class="pl-6 pr-1"></a>
      <a href="https://wang.wustl.edu/"><img src="/images/wanglab.png" alt="" width="100" height="100"></a>
    </div>
  </div>
</nav>

<Router url="{url}">
  <Route path="input/*input" component="{Input}" />
  <Route path="visual/*visual" component="{Visual}" />

  <Route path="/" component="{Myapp}" />
</Router>
<Footer />