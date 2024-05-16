<script>
  import TableRenderer from './TableRenderer.svelte';
  import { getContext } from 'svelte';
  import DataCenter from '../../DataCenter.svelte';
  let DATA;
  let dataFormatted;
  $: {
    dataFormatted = {
      // data: DATA,
      rows: ["Assay", "Biosample_type"],
      cols: ["Organism"],
      hiddenFromDragDrop: []
    }
  }
  const { open } = getContext('simple-modal');

  const showModal = (event) => {
    // console.log(event.detail);
    open(DataCenter, { DATA: event.detail });
  };
</script>

<div class="pvtOutput">
  <TableRenderer on:cell-click={showModal} data={dataFormatted}/>
</div>