<script>
    import {getContext} from "svelte";
    import TESubfamilyModal from "./TESubfamilyModal.svelte";

    export let data;
    export let specy;

    const { open } = getContext('simple-modal');

    const showPopup = () => {
        open(TESubfamilyModal, { data: data, specy: specy});
    };
</script>


<div class="flex justify-center items-center pt-2">
    <button on:click={showPopup}
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
        <i class="fa fa-fw fa-plus pr-6 pl-2"></i>
        Add TE Subfamily
    </button>
</div>