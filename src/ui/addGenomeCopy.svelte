<script>
    import {getContext} from "svelte";
    import genomeModal from "./genomeModal.svelte";

    export let repeat;
    export let specy;

    const { open } = getContext('simple-modal');

    const showPopup = () => {
        open(genomeModal, { repeat: repeat, specy: specy});
    };
</script>


<div class="flex justify-center items-center pt-2">
    <button on:click={showPopup}
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
        <i class="fa fa-fw fa-plus pr-6 pl-2"></i>
        Add Genome Data
    </button>
</div>