<script lang="ts">
    import Select, { Option } from '@smui/select';
    import defaultData from '../../json/rpbr_data/hg38_histone_data.json';
    import Icon from '@smui/select/icon';
    import Button, { Label } from '@smui/button';

    let clicked = 0;

    let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];

    let assayTypes = ['ATAC-seq', 'TF CHIP-seq', 'Histone CHIP-seq', 'CAGE-seq', 'DNase-seq']
    let biosampleTypes = []
    let species = ['Homo sapiens', 'Mus musculus']

    let value = '';
    let assayValue = '';
    let specyValue = '';
    let valueHelperText = '';
    let valueLeadingIcon = '';
    let valueInvalid = '';

    function showDataTable(data=defaultData['data']){
        const filteredData = defaultData['data'].filter(function(item) {
            return item.Target == "H3K4me1";
        });
        console.log(filteredData);
    }

    showDataTable()
</script>

<div>
    <div class="inline-grid">
        <Select variant="filled" bind:value={assayValue} label="Assay">
            <Option value="" />
            {#each assayTypes as assay}
                <Option value={assay}>{assay}</Option>
            {/each}
        </Select>

        <pre class="status">Selected: {assayValue}</pre>
    </div>

    <div class="inline-grid">
        <Select variant="filled" bind:value={specyValue} label="Specy">
            <Option value="" />
            {#each species as specy}
                <Option value={specy}>{specy}</Option>
            {/each}
        </Select>

        <pre class="status">Selected: {specyValue}</pre>
    </div>

    <div class="inline-grid">
        <Button
                on:click={() => showDataTable()}
                variant="unelevated"
                class="button-shaped-round"
        >
            <Icon class="material-icons">search</Icon>
            <Label>Search</Label>
        </Button>
    </div>

</div>
