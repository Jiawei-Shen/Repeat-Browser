<script>
    import { Dialog } from 'svelte-dialog';

    let inputValue = '';

    function showAlert() {
        alert(`You entered: ${inputValue}`);
        $dialog.close();
    }
</script>

<Dialog bind:this={$dialog}>
    <h3>Custom Modal with Input</h3>
    <label>
        Enter text:
        <input type="text" bind:value={inputValue} />
    </label>
    <button on:click={showAlert}>Show Alert</button>
</Dialog>
