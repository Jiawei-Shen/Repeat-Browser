<script lang="ts">
  import { beforeUpdate, createEventDispatcher } from "svelte";
  import { PivotData } from "./Utilities";
  // import _data2 from "../../../src/json/rpbr_data/merged_data.json"
  import _data2 from "../../../src/json/rpbr_data/all_data_withoutFantom.json"
  import { spanSize } from "./helper";
  import { formatCellInfo, getFiltered } from './data-helper';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Card, { Content } from '@smui/card';
  // import LayoutGrid from '@smui/layout-grid';
  // import Tabulator from 'tabulator-tables';
  // import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Button, { Label } from '@smui/button';

  let clicked = 0;

  type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    website: string;
  };
  let items: User[] = [];

  if (typeof fetch !== 'undefined') {
    fetch(
            'https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json'
    )
            .then((response) => response.json())
            .then((json) => (items = json));
  }

  const processedDataList = [
    {
      id: 1,
      assay: "ATAC-seq",
      hg38: "337",
      mm10: "166"
    },
    {
      id: 2,
      assay: "DNase-seq",
      hg38: "2258",
      mm10: "1555"
    },
    {
      id: 3,
      assay: "TF CHIP-seq",
      hg38: "2357",
      mm10: "185"
    },
    {
      id: 4,
      assay: "Histone CHIP-seq",
      hg38: "70",
      mm10: "833"
    },
    {
      id: 5,
      assay: "CAGE",
      hg38: "139",
      mm10: "-"
    }
  ]

  const dispatch = createEventDispatcher();
  export let data;

  let pivotData = new PivotData(data);
  let colAttrs = pivotData.props.cols;
  let rowAttrs = pivotData.props.rows;
  let rowKeys = pivotData.getRowKeys();
  let colKeys = pivotData.getColKeys();

  beforeUpdate(() => {
    pivotData = new PivotData(data);
    colAttrs = pivotData.props.cols;
    rowAttrs = pivotData.props.rows;
    rowKeys = pivotData.getRowKeys();
    colKeys = pivotData.getColKeys();

    console.log(rowKeys)
  });

  function handleCellClick(input) {
      let filteredResults = getFiltered(data.data, input);
      dispatch('cell-click', filteredResults);
  }


  function handleCellClickNew(input) {
    const specy = input.specy;
    const assay = input.assay;
    const human_items = ['GRCh38', 'hg19', 'hg38'];
    const mouse_items = ['mm10']
    let organism_items;
    if (specy == 'human')
    {
      organism_items = human_items;
    }
    if (specy == 'mouse')
    {
      organism_items = mouse_items;
    }
    // let filteredResults = _data2.data.filter(item => {
    //   return item.Assay.toUpperCase() == assay.toUpperCase() && organism_items.includes(item.Organism)
    // });
    let filteredResults = _data2.filter(item => {
      return item.Assay.toUpperCase() == assay.toUpperCase() && organism_items.includes(item.Organism)
    });
    // console.log(filteredResults);
    dispatch('cell-click', filteredResults);
  }
</script>

<style>
  /* Reset some of the demo app styles that interfere. */
  :global(body),
  :global(html) {
    height: auto;
    width: auto;
    position: static;
  }
  :global(#smui-app) {
    display: block;
    height: auto;
    overflow: auto;
  }

  table.pvtTable {
    font-size: 15px;
    border: 1px solid #1C6EA4;
    background-color: #EEEEEE;
    width: 100%;
    text-align: center;
    border-collapse: collapse;
  }
  table.pvtTable td, table.pvtTable th {
    border: 1px solid #AAAAAA;
    padding: 3px 2px;
  }
  table.pvtTable tbody td {
    font-size: 16px;
  }
  table.pvtTable tr:nth-child(even) {
    background: #D0E4F5;
  }
  table.pvtTable thead {
    background: #1C6EA4;
    background: -moz-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
    background: -webkit-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
    background: linear-gradient(to bottom, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
    border-bottom: 2px solid #444444;
  }
  table.pvtTable thead th {
    font-size: 18px;
    font-weight: bold;
    color: #FFFFFF;
    border-left: 2px solid #D0E4F5;
  }
  table.pvtTable thead th:first-child {
    border-left: none;
  }
</style>

<DataTable stickyHeader table$aria-label="User list" style="width: 100%;">
  <Head>
    <Row>
      <Cell>Assay Types</Cell>
      <Cell>Homo sapiens</Cell>
      <Cell>Human Data</Cell>
      <Cell>Mus musculus</Cell>
      <Cell>Mouse Data</Cell>
    </Row>
  </Head>
  <Body>
  {#each processedDataList as item (item.id)}
    <Row>
      <Cell>{item.assay}</Cell>
      <Cell>{item.hg38}</Cell>
      <Cell>
        <button class="rounded-full text-sm bg-lightBlue-500 text-white border-none"
                on:click={() => handleCellClickNew({'assay': item.assay,'specy': 'human'})}>
          <i class="fa fa-fw fa-table pr-1 pl-2"></i>
          <span class="px-2">Show</span>
        </button>
      </Cell>
      <Cell>{item.mm10}</Cell>
      <Cell>
        <button class="rounded-full text-sm bg-lightBlue-500 text-white border-none"
                on:click={() => handleCellClickNew({'assay': item.assay,'specy': 'mouse'})}>
          <i class="fa fa-fw fa-table pr-1 pl-2"></i>
          <span class="px-2">Show</span>
        </button>
      </Cell>
    </Row>
  {/each}
  </Body>
</DataTable>



