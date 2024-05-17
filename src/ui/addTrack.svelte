<script>
    import {getContext} from "svelte";
    import ConsensusAddTrackModal from "./concensusAddTrackModal.svelte";

    export let repeat;
    export let hg38CopyDense;

    const { open } = getContext('simple-modal');

    const showPopup = () => {
        open(ConsensusAddTrackModal, { repeat: repeat, hg38GenomeCopydensity: hg38CopyDense});
    };
</script>


<div class="border-b flex justify-center items-center pt-2">
    <button on:click={showPopup}
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
        <i class="fa fa-fw fa-plus pr-6 pl-2"></i>
        Add Track
    </button>
</div>