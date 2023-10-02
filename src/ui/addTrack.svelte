<script>
    import Modal from './Modal.svelte';
    import {getContext} from "svelte";
    import ConsensusAddTrackModal from "./concensusAddTrackModal.svelte";

    export let repeat;

    const { open } = getContext('simple-modal');

    const showPopup = () => {
        open(ConsensusAddTrackModal, { repeat: repeat });
    };
</script>


<div class="border-b flex justify-center items-center pt-2">
    <button on:click={showPopup}
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
        <i class="fa fa-fw fa-plus pr-6 pl-2"></i>
        Add Track
    </button>
</div>