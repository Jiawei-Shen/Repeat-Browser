<link rel="stylesheet" href="/lib/css/bootstrap.css">
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Cart } from '../stores/CartStore';
  import { getDataForHeatmapAll, getZarrForHeatmapAll, getBackendjson} from '../api/heatmap';
  import LinearProgress from '../ui/LinearProgress.svelte';
  import PlotlyHeatmap from './PlotlyHeatmap.svelte';
  import VirtualList from 'svelte-tiny-virtual-list';
  import IconButton from '@smui/icon-button';
  import { Jumper } from 'svelte-loading-spinners';
  import debug_data from "../json/subfam_stat_debug.json";
  import type { MenuComponentDev } from '@smui/menu';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
  import Button, { Label } from '@smui/button';
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';
  import {heatmapTour} from '../api/toursteps'
  // library for creating dropdown menu appear on click
  import { createPopper } from "@popperjs/core";
  import {make_clust} from "../api/clusterHeatmap"
  import ClusterHeatmap from "./clusterHeatmap.svelte"
  // import Clustergrammer from "clustergrammer"

  // core components

  let dropdownPopoverShow = false;

  let btnDropdownRef;
  let popoverDropdownRef;

  const toggleDropdown = () => {
    if (dropdownPopoverShow) {
      dropdownPopoverShow = false;
    } else {
      dropdownPopoverShow = true;
      createPopper(btnDropdownRef, popoverDropdownRef, {
        placement: "top",
      });
    }
  };

  let menu: MenuComponentDev;
  // let clicked = 'DNA';
  let checked = false;
  // let scale_max = 2;

  let dataPromise_dna, dataPromise_rna;
  let heatmapData_dna, heatmapData_rna;
  let repeatLabels;
  let loaded = [false, false];
  let heatmap_json;
  let heatmap_json_dna;
  let heatmap_json_rna;

  let cartData;
  let cartRepeats;
  const unsubscribe = Cart.subscribe(async store => {
    loaded = [false, false];
    const { data, repeats } = store;
    cartData = data;
    cartRepeats = repeats;
    // const { data, repeats } = localStorage.Cart;
    // console.log(data);
    // heatmap_json = await getBackendjson(data, 'subfamStat', repeats);
    // console.log(heatmap_json);

    repeatLabels = repeats.map(d => d.name);
    if (data.length > 0 && repeats.length > 0) {
      //dataPromise = getDataForHeatmapAll(data, 'subfamStat', repeats);
      // dataPromise = getZarrForHeatmapAll(debug_data.files, 'Zarr', repeats);
      let rna_data = data.filter((el) => el.Assay.includes("RNA"));
      let dna_data = data.filter((el) => !el.Assay.includes("RNA"));
      if (!(dna_data === undefined || dna_data.length == 0)){
        dataPromise_dna = getZarrForHeatmapAll(dna_data, 'Zarr', repeats);
        heatmapData_dna = await dataPromise_dna;
        // console.log(dna_data);
        heatmap_json_dna = await getBackendjson(dna_data, 'subfamStat', repeats);
        // console.log(heatmap_json_dna);
        loaded[0]=true;
        // console.log(loaded);
      }
      if (!(rna_data === undefined || rna_data.length == 0)){
        dataPromise_rna = getZarrForHeatmapAll(rna_data, 'Zarr', repeats);
        heatmapData_rna = await dataPromise_rna;
        heatmap_json_rna = await getBackendjson(rna_data, 'subfamStat', repeats);
        loaded[1]=true;
        // console.log(loaded);
      }

      if(loaded[0]){
          Cart.setAssayDNA();
      } else if(loaded[1]){
          Cart.setAssayRNA();
      }
    }

    // make_clust()
  });

  const network_data = '{"row_nodes": [{"name": "Gene: ENCFF075KDC", "ini": 16, "clust": 1, "rank": 15, "rankvar": 15, "cat-0": "Gene Type: 0", "cat_0_index": 0, "group": [11.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF076NFT", "ini": 15, "clust": 0, "rank": 14, "rankvar": 14, "cat-0": "Gene Type: 0", "cat_0_index": 1, "group": [12.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF082OFO", "ini": 14, "clust": 14, "rank": 11, "rankvar": 6, "cat-0": "Gene Type: 0", "cat_0_index": 2, "group": [13.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF399ZSM", "ini": 13, "clust": 15, "rank": 12, "rankvar": 7, "cat-0": "Gene Type: 0", "cat_0_index": 3, "group": [14.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF722JKG", "ini": 12, "clust": 13, "rank": 13, "rankvar": 5, "cat-0": "Gene Type: 0", "cat_0_index": 4, "group": [15.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF758SQE", "ini": 11, "clust": 12, "rank": 10, "rankvar": 9, "cat-0": "Gene Type: 0", "cat_0_index": 5, "group": [16.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: SRR3498330", "ini": 10, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Gene Type: 0", "cat_0_index": 6, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498335", "ini": 9, "clust": 5, "rank": 2, "rankvar": 2, "cat-0": "Gene Type: 0", "cat_0_index": 7, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498331", "ini": 8, "clust": 4, "rank": 6, "rankvar": 10, "cat-0": "Gene Type: 0", "cat_0_index": 8, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498336", "ini": 7, "clust": 8, "rank": 7, "rankvar": 11, "cat-0": "Gene Type: 0", "cat_0_index": 9, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498327", "ini": 6, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Gene Type: 0", "cat_0_index": 10, "group": [10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498332", "ini": 5, "clust": 10, "rank": 3, "rankvar": 3, "cat-0": "Gene Type: 0", "cat_0_index": 11, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498329", "ini": 4, "clust": 11, "rank": 5, "rankvar": 8, "cat-0": "Gene Type: 0", "cat_0_index": 12, "group": [8.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498334", "ini": 3, "clust": 7, "rank": 4, "rankvar": 4, "cat-0": "Gene Type: 0", "cat_0_index": 13, "group": [9.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498328", "ini": 2, "clust": 9, "rank": 8, "rankvar": 12, "cat-0": "Gene Type: 0", "cat_0_index": 14, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498333", "ini": 1, "clust": 6, "rank": 9, "rankvar": 13, "cat-0": "Gene Type: 0", "cat_0_index": 15, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}], "col_nodes": [{"name": "Cell Line: MER125", "ini": 8, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Category: DNA", "cat_0_index": 0, "cat-1": "Gender: DNA", "cat_1_index": 0, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER126", "ini": 7, "clust": 6, "rank": 4, "rankvar": 4, "cat-0": "Category: DNA", "cat_0_index": 1, "cat-1": "Gender: DNA", "cat_1_index": 1, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER130", "ini": 6, "clust": 7, "rank": 6, "rankvar": 6, "cat-0": "Category: DNA", "cat_0_index": 2, "cat-1": "Gender: DNA", "cat_1_index": 2, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER135", "ini": 5, "clust": 4, "rank": 3, "rankvar": 2, "cat-0": "Category: DNA", "cat_0_index": 3, "cat-1": "Gender: DNA", "cat_1_index": 3, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER136", "ini": 4, "clust": 1, "rank": 2, "rankvar": 3, "cat-0": "Category: DNA", "cat_0_index": 4, "cat-1": "Gender: DNA", "cat_1_index": 4, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: UCON8", "ini": 3, "clust": 5, "rank": 5, "rankvar": 5, "cat-0": "Category: DNA", "cat_0_index": 5, "cat-1": "Gender: DNA", "cat_1_index": 5, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: L1M2b", "ini": 2, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Category: L1", "cat_0_index": 7, "cat-1": "Gender: LINE", "cat_1_index": 6, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER41B", "ini": 1, "clust": 0, "rank": 7, "rankvar": 7, "cat-0": "Category: ERV1", "cat_0_index": 6, "cat-1": "Gender: LTR", "cat_1_index": 7, "group": [8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}], "links": [], "mat": [[1.186558516801854, 1.747826086956522, 1.8401639344262293, 1.3616187989556134, 0.9393511988716504, 1.5277008310249307, 0.8453815261044176, 29.1252446183953], [1.0776361529548089, 1.2420289855072464, 1.5683060109289615, 1.129242819843342, 1.5500705218617772, 1.2451523545706369, 0.9658634538152612, 14.354207436399214], [1.0326721120186697, 0.928733031674208, 1.0359922178988326, 1.0795454545454546, 0.9099337748344372, 0.9028815368196371, 0.90625, 1.1269592476489028], [1.02683780630105, 0.9004524886877828, 1.0671206225680934, 1.0863636363636364, 1.047682119205298, 0.9178228388473852, 0.7977941176470588, 1.213166144200627], [1.0692864529472597, 1.0091220068415052, 1.0950276243093922, 0.972093023255814, 1.1666666666666663, 1.0402010050251256, 1.0727272727272728, 0.909199522102748], [0.6587383660806618, 0.8722919042189282, 1.0718232044198894, 0.8213953488372093, 0.6154684095860565, 1.2412060301507537, 1.0987012987012987, 1.2138590203106332], [0.0006844834542942683, 0.009556442073416131, 0.0008842259569708877, 0.006495882193694624, 0.0007906682383733315, 0.0012209704860384244, 0.0, 0.15375659910147035], [0.0, 0.004675817419036783, 0.0011689543547591958, 0.0036543311521087477, 0.0, 0.0024538380670151715, 0.0, 0.1683652571038609], [0.0, 0.052686433050807606, 0.003915494478092804, 0.013648295037923494, 0.0, 0.006538395422709978, 0.0, 0.7117869793809455], [0.0, 0.003420388198668802, 0.0009302311000563688, 0.0, 0.0, 0.00013752076262689, 0.0, 1.2612274555377865], [0.0, 0.003983380143029239, 0.0011273717385931806, 0.010938343642185554, 0.0, 0.0036769662858731436, 0.0, 0.1328806470115387], [0.0, 0.0, 0.0002345609646239732, 0.003432755687056645, 0.0, 0.001487866000455025, 0.0, 0.19192175560580435], [0.0, 0.0056236093264024544, 0.0, 0.007784886300574925, 0.0, 0.0009436225818878696, 0.0, 0.5089193937040651], [0.0, 0.0, 0.0022735231608465123, 0.004001101615305539, 0.0020408303541155767, 0.0, 0.0, 0.22075483662906348], [0.0, 0.002758026751447379, 0.0016635716913492127, 0.011548762154820985, 0.0, 0.0019109746608319165, 0.0, 2.1694973267193567], [0.0, 0.06878108905225162, 0.0, 0.04063652963699768, 0.0, 0.002176616742159861, 0.0, 2.8484562810408733]], "cat_colors": {"row": {"cat-0": {"Gene Type: 0": "#393b79"}}, "col": {"cat-0": {"Category: DNA": "#ffbb78", "Category: ERV1": "#bcbd22", "Category: L1": "#ff9896"}, "cat-1": {"Gender: DNA": "#ff9896", "Gender: LINE": "#8c564b", "Gender: LTR": "#5254a3"}}}, "views": [{"N_row_sum": "all", "dist": "cos", "nodes": {"row_nodes": [{"name": "Gene: ENCFF075KDC", "ini": 16, "clust": 1, "rank": 15, "rankvar": 15, "cat-0": "Gene Type: 0", "cat_0_index": 0, "group": [11.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF076NFT", "ini": 15, "clust": 0, "rank": 14, "rankvar": 14, "cat-0": "Gene Type: 0", "cat_0_index": 1, "group": [12.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF082OFO", "ini": 14, "clust": 14, "rank": 11, "rankvar": 6, "cat-0": "Gene Type: 0", "cat_0_index": 2, "group": [13.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF399ZSM", "ini": 13, "clust": 15, "rank": 12, "rankvar": 7, "cat-0": "Gene Type: 0", "cat_0_index": 3, "group": [14.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF722JKG", "ini": 12, "clust": 13, "rank": 13, "rankvar": 5, "cat-0": "Gene Type: 0", "cat_0_index": 4, "group": [15.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF758SQE", "ini": 11, "clust": 12, "rank": 10, "rankvar": 9, "cat-0": "Gene Type: 0", "cat_0_index": 5, "group": [16.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: SRR3498330", "ini": 10, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Gene Type: 0", "cat_0_index": 6, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498335", "ini": 9, "clust": 5, "rank": 2, "rankvar": 2, "cat-0": "Gene Type: 0", "cat_0_index": 7, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498331", "ini": 8, "clust": 4, "rank": 6, "rankvar": 10, "cat-0": "Gene Type: 0", "cat_0_index": 8, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498336", "ini": 7, "clust": 8, "rank": 7, "rankvar": 11, "cat-0": "Gene Type: 0", "cat_0_index": 9, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498327", "ini": 6, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Gene Type: 0", "cat_0_index": 10, "group": [10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498332", "ini": 5, "clust": 10, "rank": 3, "rankvar": 3, "cat-0": "Gene Type: 0", "cat_0_index": 11, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498329", "ini": 4, "clust": 11, "rank": 5, "rankvar": 8, "cat-0": "Gene Type: 0", "cat_0_index": 12, "group": [8.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498334", "ini": 3, "clust": 7, "rank": 4, "rankvar": 4, "cat-0": "Gene Type: 0", "cat_0_index": 13, "group": [9.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498328", "ini": 2, "clust": 9, "rank": 8, "rankvar": 12, "cat-0": "Gene Type: 0", "cat_0_index": 14, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498333", "ini": 1, "clust": 6, "rank": 9, "rankvar": 13, "cat-0": "Gene Type: 0", "cat_0_index": 15, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}], "col_nodes": [{"name": "Cell Line: MER125", "ini": 8, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Category: DNA", "cat_0_index": 0, "cat-1": "Gender: DNA", "cat_1_index": 0, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER126", "ini": 7, "clust": 6, "rank": 4, "rankvar": 4, "cat-0": "Category: DNA", "cat_0_index": 1, "cat-1": "Gender: DNA", "cat_1_index": 1, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER130", "ini": 6, "clust": 7, "rank": 6, "rankvar": 6, "cat-0": "Category: DNA", "cat_0_index": 2, "cat-1": "Gender: DNA", "cat_1_index": 2, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER135", "ini": 5, "clust": 4, "rank": 3, "rankvar": 2, "cat-0": "Category: DNA", "cat_0_index": 3, "cat-1": "Gender: DNA", "cat_1_index": 3, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER136", "ini": 4, "clust": 1, "rank": 2, "rankvar": 3, "cat-0": "Category: DNA", "cat_0_index": 4, "cat-1": "Gender: DNA", "cat_1_index": 4, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: UCON8", "ini": 3, "clust": 5, "rank": 5, "rankvar": 5, "cat-0": "Category: DNA", "cat_0_index": 5, "cat-1": "Gender: DNA", "cat_1_index": 5, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: L1M2b", "ini": 2, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Category: L1", "cat_0_index": 7, "cat-1": "Gender: LINE", "cat_1_index": 6, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER41B", "ini": 1, "clust": 0, "rank": 7, "rankvar": 7, "cat-0": "Category: ERV1", "cat_0_index": 6, "cat-1": "Gender: LTR", "cat_1_index": 7, "group": [8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}]}}, {"N_row_sum": 10, "dist": "cos", "nodes": {"row_nodes": [{"name": "Gene: ENCFF075KDC", "ini": 10, "clust": 4, "rank": 9, "rankvar": 9, "cat-0": "Gene Type: 0", "cat_0_index": 0, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF076NFT", "ini": 9, "clust": 5, "rank": 8, "rankvar": 8, "cat-0": "Gene Type: 0", "cat_0_index": 1, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF722JKG", "ini": 8, "clust": 7, "rank": 7, "rankvar": 0, "cat-0": "Gene Type: 0", "cat_0_index": 2, "group": [9.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF399ZSM", "ini": 7, "clust": 8, "rank": 6, "rankvar": 2, "cat-0": "Gene Type: 0", "cat_0_index": 3, "group": [7.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF082OFO", "ini": 6, "clust": 9, "rank": 5, "rankvar": 1, "cat-0": "Gene Type: 0", "cat_0_index": 4, "group": [8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF758SQE", "ini": 5, "clust": 6, "rank": 4, "rankvar": 3, "cat-0": "Gene Type: 0", "cat_0_index": 5, "group": [10.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498333", "ini": 4, "clust": 1, "rank": 3, "rankvar": 7, "cat-0": "Gene Type: 0", "cat_0_index": 6, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498328", "ini": 3, "clust": 2, "rank": 2, "rankvar": 6, "cat-0": "Gene Type: 0", "cat_0_index": 7, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498336", "ini": 2, "clust": 3, "rank": 1, "rankvar": 5, "cat-0": "Gene Type: 0", "cat_0_index": 8, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498331", "ini": 1, "clust": 0, "rank": 0, "rankvar": 4, "cat-0": "Gene Type: 0", "cat_0_index": 9, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}], "col_nodes": [{"name": "Cell Line: MER125", "ini": 8, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Category: DNA", "cat_0_index": 0, "cat-1": "Gender: DNA", "cat_1_index": 0, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER126", "ini": 7, "clust": 6, "rank": 4, "rankvar": 4, "cat-0": "Category: DNA", "cat_0_index": 1, "cat-1": "Gender: DNA", "cat_1_index": 1, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER130", "ini": 6, "clust": 7, "rank": 6, "rankvar": 6, "cat-0": "Category: DNA", "cat_0_index": 2, "cat-1": "Gender: DNA", "cat_1_index": 2, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER135", "ini": 5, "clust": 4, "rank": 3, "rankvar": 2, "cat-0": "Category: DNA", "cat_0_index": 3, "cat-1": "Gender: DNA", "cat_1_index": 3, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER136", "ini": 4, "clust": 1, "rank": 2, "rankvar": 3, "cat-0": "Category: DNA", "cat_0_index": 4, "cat-1": "Gender: DNA", "cat_1_index": 4, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: UCON8", "ini": 3, "clust": 5, "rank": 5, "rankvar": 5, "cat-0": "Category: DNA", "cat_0_index": 5, "cat-1": "Gender: DNA", "cat_1_index": 5, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: L1M2b", "ini": 2, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Category: L1", "cat_0_index": 7, "cat-1": "Gender: LINE", "cat_1_index": 6, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER41B", "ini": 1, "clust": 0, "rank": 7, "rankvar": 7, "cat-0": "Category: ERV1", "cat_0_index": 6, "cat-1": "Gender: LTR", "cat_1_index": 7, "group": [8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}]}}, {"N_row_var": "all", "dist": "cos", "nodes": {"row_nodes": [{"name": "Gene: ENCFF075KDC", "ini": 16, "clust": 1, "rank": 15, "rankvar": 15, "cat-0": "Gene Type: 0", "cat_0_index": 0, "group": [11.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF076NFT", "ini": 15, "clust": 0, "rank": 14, "rankvar": 14, "cat-0": "Gene Type: 0", "cat_0_index": 1, "group": [12.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF082OFO", "ini": 14, "clust": 14, "rank": 11, "rankvar": 6, "cat-0": "Gene Type: 0", "cat_0_index": 2, "group": [13.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF399ZSM", "ini": 13, "clust": 15, "rank": 12, "rankvar": 7, "cat-0": "Gene Type: 0", "cat_0_index": 3, "group": [14.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF722JKG", "ini": 12, "clust": 13, "rank": 13, "rankvar": 5, "cat-0": "Gene Type: 0", "cat_0_index": 4, "group": [15.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF758SQE", "ini": 11, "clust": 12, "rank": 10, "rankvar": 9, "cat-0": "Gene Type: 0", "cat_0_index": 5, "group": [16.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: SRR3498330", "ini": 10, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Gene Type: 0", "cat_0_index": 6, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498335", "ini": 9, "clust": 5, "rank": 2, "rankvar": 2, "cat-0": "Gene Type: 0", "cat_0_index": 7, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498331", "ini": 8, "clust": 4, "rank": 6, "rankvar": 10, "cat-0": "Gene Type: 0", "cat_0_index": 8, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498336", "ini": 7, "clust": 8, "rank": 7, "rankvar": 11, "cat-0": "Gene Type: 0", "cat_0_index": 9, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498327", "ini": 6, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Gene Type: 0", "cat_0_index": 10, "group": [10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498332", "ini": 5, "clust": 10, "rank": 3, "rankvar": 3, "cat-0": "Gene Type: 0", "cat_0_index": 11, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498329", "ini": 4, "clust": 11, "rank": 5, "rankvar": 8, "cat-0": "Gene Type: 0", "cat_0_index": 12, "group": [8.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498334", "ini": 3, "clust": 7, "rank": 4, "rankvar": 4, "cat-0": "Gene Type: 0", "cat_0_index": 13, "group": [9.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498328", "ini": 2, "clust": 9, "rank": 8, "rankvar": 12, "cat-0": "Gene Type: 0", "cat_0_index": 14, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498333", "ini": 1, "clust": 6, "rank": 9, "rankvar": 13, "cat-0": "Gene Type: 0", "cat_0_index": 15, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}], "col_nodes": [{"name": "Cell Line: MER125", "ini": 8, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Category: DNA", "cat_0_index": 0, "cat-1": "Gender: DNA", "cat_1_index": 0, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER126", "ini": 7, "clust": 6, "rank": 4, "rankvar": 4, "cat-0": "Category: DNA", "cat_0_index": 1, "cat-1": "Gender: DNA", "cat_1_index": 1, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER130", "ini": 6, "clust": 7, "rank": 6, "rankvar": 6, "cat-0": "Category: DNA", "cat_0_index": 2, "cat-1": "Gender: DNA", "cat_1_index": 2, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER135", "ini": 5, "clust": 4, "rank": 3, "rankvar": 2, "cat-0": "Category: DNA", "cat_0_index": 3, "cat-1": "Gender: DNA", "cat_1_index": 3, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER136", "ini": 4, "clust": 1, "rank": 2, "rankvar": 3, "cat-0": "Category: DNA", "cat_0_index": 4, "cat-1": "Gender: DNA", "cat_1_index": 4, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: UCON8", "ini": 3, "clust": 5, "rank": 5, "rankvar": 5, "cat-0": "Category: DNA", "cat_0_index": 5, "cat-1": "Gender: DNA", "cat_1_index": 5, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: L1M2b", "ini": 2, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Category: L1", "cat_0_index": 7, "cat-1": "Gender: LINE", "cat_1_index": 6, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER41B", "ini": 1, "clust": 0, "rank": 7, "rankvar": 7, "cat-0": "Category: ERV1", "cat_0_index": 6, "cat-1": "Gender: LTR", "cat_1_index": 7, "group": [8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0]}]}}, {"N_row_var": 10, "dist": "cos", "nodes": {"row_nodes": [{"name": "Gene: ENCFF075KDC", "ini": 10, "clust": 5, "rank": 9, "rankvar": 9, "cat-0": "Gene Type: 0", "cat_0_index": 0, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF076NFT", "ini": 9, "clust": 6, "rank": 8, "rankvar": 8, "cat-0": "Gene Type: 0", "cat_0_index": 1, "group": [7.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498333", "ini": 8, "clust": 3, "rank": 4, "rankvar": 7, "cat-0": "Gene Type: 0", "cat_0_index": 2, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498328", "ini": 7, "clust": 1, "rank": 3, "rankvar": 6, "cat-0": "Gene Type: 0", "cat_0_index": 3, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498336", "ini": 6, "clust": 2, "rank": 2, "rankvar": 5, "cat-0": "Gene Type: 0", "cat_0_index": 4, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: SRR3498331", "ini": 5, "clust": 0, "rank": 1, "rankvar": 4, "cat-0": "Gene Type: 0", "cat_0_index": 5, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF758SQE", "ini": 4, "clust": 7, "rank": 5, "rankvar": 3, "cat-0": "Gene Type: 0", "cat_0_index": 6, "group": [10.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: SRR3498329", "ini": 3, "clust": 4, "rank": 0, "rankvar": 2, "cat-0": "Gene Type: 0", "cat_0_index": 7, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Gene: ENCFF399ZSM", "ini": 2, "clust": 8, "rank": 7, "rankvar": 1, "cat-0": "Gene Type: 0", "cat_0_index": 8, "group": [8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}, {"name": "Gene: ENCFF082OFO", "ini": 1, "clust": 9, "rank": 6, "rankvar": 0, "cat-0": "Gene Type: 0", "cat_0_index": 9, "group": [9.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0]}], "col_nodes": [{"name": "Cell Line: MER125", "ini": 8, "clust": 3, "rank": 1, "rankvar": 1, "cat-0": "Category: DNA", "cat_0_index": 0, "cat-1": "Gender: DNA", "cat_1_index": 0, "group": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER126", "ini": 7, "clust": 6, "rank": 4, "rankvar": 4, "cat-0": "Category: DNA", "cat_0_index": 1, "cat-1": "Gender: DNA", "cat_1_index": 1, "group": [3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER130", "ini": 6, "clust": 7, "rank": 6, "rankvar": 6, "cat-0": "Category: DNA", "cat_0_index": 2, "cat-1": "Gender: DNA", "cat_1_index": 2, "group": [4.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER135", "ini": 5, "clust": 4, "rank": 3, "rankvar": 3, "cat-0": "Category: DNA", "cat_0_index": 3, "cat-1": "Gender: DNA", "cat_1_index": 3, "group": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER136", "ini": 4, "clust": 1, "rank": 2, "rankvar": 2, "cat-0": "Category: DNA", "cat_0_index": 4, "cat-1": "Gender: DNA", "cat_1_index": 4, "group": [7.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: UCON8", "ini": 3, "clust": 5, "rank": 5, "rankvar": 5, "cat-0": "Category: DNA", "cat_0_index": 5, "cat-1": "Gender: DNA", "cat_1_index": 5, "group": [5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: L1M2b", "ini": 2, "clust": 2, "rank": 0, "rankvar": 0, "cat-0": "Category: L1", "cat_0_index": 7, "cat-1": "Gender: LINE", "cat_1_index": 6, "group": [6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, {"name": "Cell Line: MER41B", "ini": 1, "clust": 0, "rank": 7, "rankvar": 7, "cat-0": "Category: ERV1", "cat_0_index": 6, "cat-1": "Gender: LTR", "cat_1_index": 7, "group": [8.0, 3.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0, 1.0]}]}}]}';

  // args must contain root of container and the visualization JSON
  var args = {
    'root': '#container-id-1',
    'network_data': network_data
  }

  onMount(unsubscribe);
</script>

{#await heatmap_json_dna}
  <LinearProgress/>
{:then heatmapData}
    <div class="flex justify-center">
      <div class="w-full flex flex-col md:flex-row md:max-w-xl rounded-lg bg-white shadow-lg">
<!--        <img class="lg:w-3/12 p-4 h-full md:h-auto object-contain md:w-48 rounded-t-lg md:rounded-none md:rounded-l-lg" src="/assets/img/heatmap.png" alt="" />-->
        <div class="w-8/12 flex flex-wrap">
<!--          <div class="flex flex-col justify-center w-7/12 pr-2">-->
          <div class="flex flex-col justify-center w-full pr-2">
            <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">
              <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">Files: {cartData.length}</h5>
            </div>
            <div class="block rounded-b shadow-lg bg-white max-w-sm w-full px-4">
              <!--            <h5 class="text-gray-900 text-xl leading-tight font-medium mb-2">Repeats: {cartRepeats.length}</h5>-->
              <VirtualList
                      height={200}
                      width=100%
                      itemCount={cartData.length}
                      itemSize={50}>

                <div slot="item" let:index let:style {style} class="row">
                <span>
<!--                        <IconButton class="material-icons" style="display: inline-block; margin-left: 15px"-->
<!--                                    on:click={() => Cart.addDataItems($Cart.data.filter(-->
<!--                                d => d.id !== cartData[index].id))}>-->
<!--                        cancel</IconButton>-->
                        <span class="inline-block px-12">
<!--                                <p class="font-bold">File: {cartData[index].id}</p>-->
                            <!--                                <span class="text-xs">biosample-target</span>-->
                            {#if (cartData[index].Target == 'unknown' || typeof cartData[index].Target === 'undefined')}
                                <p class="font-bold text-xs">{cartData[index].Biosample}({cartData[index].Assay})</p>
                            {:else }
                                <p className="font-bold text-xs">{cartData[index].Biosample}({cartData[index].Target})</p>
                            {/if}
                            <span class="text-xs">Target: {cartData[index].Target}, ID: {cartData[index].id}</span>
<!--                            <span class="font-bold text-xs">{cartData[index].Assay} in {cartData[index].Biosample}<br/></span>-->
                        </span>
                </span>
                </div>
              </VirtualList>
            </div>
          </div>
<!--          <div class="flex flex-col justify-center w-5/12 pr-4">-->
<!--            <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">-->
<!--              <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">Repeats: {cartRepeats.length}</h5>-->
<!--            </div>-->
<!--            <div class="block rounded-b shadow-lg bg-white max-w-sm w-full px-4">-->
<!--              &lt;!&ndash;            <h5 class="text-gray-900 text-xl leading-tight font-medium mb-2">Repeats: {cartRepeats.length}</h5>&ndash;&gt;-->
<!--              <VirtualList-->
<!--                      height={200}-->
<!--                      width=100%-->
<!--                      itemCount={cartRepeats.length}-->
<!--                      itemSize={50}>-->
<!--                <div slot="item" let:index let:style {style}>-->
<!--                    <span >-->
<!--                        <IconButton class="material-icons" style="display: inline-block; margin-left: 15px"-->
<!--                                    on:click={() =>{-->
<!--                                      Cart.addRepeats($Cart.repeats.filter(d => d.name !== cartRepeats[cartRepeats.length - 1 - index].name));-->
<!--                                      window.location.reload();-->
<!--                                    }}>-->
<!--                        cancel</IconButton>-->
<!--                        <span>Subfamilies: {cartRepeats[cartRepeats.length - 1 - index].name}</span>-->
<!--                    </span>-->
<!--                  &lt;!&ndash;            <Text>{cartRepeats[cartRepeats.length - 1 - index].name}</Text>&ndash;&gt;-->
<!--                </div>-->
<!--              </VirtualList>-->
<!--            </div>-->
<!--          </div>-->
        </div>
        <div class="flex flex-col justify-start px-6">
          <h5 class="text-gray-900 pt-6 text-xl font-medium mb-2">Heatmap</h5>
          <ul class="list-disc px-4 text-sm">
            <li> Data with different assay types are displayed in different section. </li>
            <li> Please click the switch to determine display Unique type or All type. </li>
            <li> Use the scroll bar or input box to change the heatmap bar. </li>
            <!-- ... -->
          </ul>
          <br>
          <a on:click={heatmapTour} class="inline-flex items-center cursor-pointer lg:w-6/12 px-2 py-2 text-sm font-medium text-center text-white bg-lightBlue-600 rounded-lg hover:bg-lightBlue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <i class="fa fa-fw fa-eye pr-6 pl-2"></i>
            Detailed Tour
            <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </a>
          <br>
          <!--            <p class="text-gray-600 text-xs">Sunburst chart guide.</p>-->
        </div>
      </div>
    </div>

    <hr class="py-2">

    {#if loaded[0] && $Cart.assay === 'DNA-seq'}
        <!--{#if loaded[0] && loaded[1]}-->
        <ClusterHeatmap on:tileClick inputJson={heatmap_json_dna}/>
    {:else if loaded[1] && $Cart.assay === 'Cage-seq'}
        <ClusterHeatmap on:tileClick inputJson={heatmap_json_rna}/>
    {:else}
        <div class="relative">
            <div class="flex justify-center items-center pt-12">
                <Jumper size="25" color="#4ea8de" unit="rem" duration="1s" />
            </div>
            <div class="flex justify-center items-center">
                <h2>Loading The Heatmap.</h2>
            </div>
        </div>
    {/if}
<!--    <div class="flex flex-col justify-center w-full" id="heatmap-card">-->
<!--      <div class="bg-gray-200 block px-4 rounded-t shadow-lg bg-white max-w-sm w-full">-->
<!--        <h5 class="text-gray-900 text-xl leading-tight font-medium py-2">Heatmap</h5>-->
<!--      </div>-->
<!--      <div class="block p-6 rounded-b shadow-lg bg-white max-w-sm w-full px-4">-->
<!--        <div class="flex flex-wrap ">-->
<!--          <div class="w-1/4 px-3 mb-2 md:mb-0" id="heatmap-assay-type">-->
<!--            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">-->
<!--              Assay Type:-->
<!--            </label>-->
<!--            <Button style="border: solid" on:click={() => menu.setOpen(true)}>-->
<!--              <Label>-->
<!--                Assay Type: {$Cart.assay}-->
<!--                <svg class="inline ml-2 w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>-->
<!--              </Label>-->
<!--            </Button>-->
<!--            <Menu bind:this={menu}>-->
<!--              <List>-->
<!--                <Item on:SMUI:action={() => (Cart.setAssayDNA())}>-->
<!--                  <Text>DNA-seq</Text>-->
<!--                </Item>-->
<!--                <Item on:SMUI:action={() => (Cart.setAssayRNA())}>-->
<!--                  <Text>Cage-seq</Text>-->
<!--                </Item>-->
<!--              </List>-->
<!--            </Menu>-->
<!--          </div>-->

<!--          <div class="w-1/6 px-3 mb-2 md:mb-0" id="heatmap-switch">-->
<!--            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">-->
<!--              Sequencing Type:-->
<!--            </label>-->
<!--              <Button id="heatmap-switch" style="border: solid" color="{checked ? 'secondary': 'primary'}" on:click={() =>{checked=!checked}}>-->
<!--                <Label>-->
<!--                  {checked? 'Unique':'All'}-->
<!--                </Label>-->
<!--              </Button>-->
<!--          </div>-->

<!--          <div class="w-1/3 px-3 mb-2 md:mb-0" id="heatmap-bar">-->
<!--            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">-->
<!--              Adjust Scale Bar:-->
<!--            </label>-->
<!--            <span> Scale Bar: </span>-->
<!--            <input class="w-20" type=number bind:value={$Cart.scale} min=1 max=10>-->
<!--            <input type=range bind:value={$Cart.scale} min=1 max=10>-->
<!--          </div>-->

<!--          </div>-->

<!--    {#if loaded[0]}-->
<!--    &lt;!&ndash;{#if loaded[0] && loaded[1]}&ndash;&gt;-->
<!--      {#if $Cart.assay === 'DNA-seq'}-->
<!--          <ClusterHeatmap on:tileClick inputJson={heatmap_json_dna}/>-->
<!--      {:else if $Cart.assay === 'Cage-seq'}-->
<!--          <ClusterHeatmap on:tileClick inputJson={heatmap_json_rna}/>-->
<!--      {/if}-->
<!--    {:else}-->
<!--        <div class="flex justify-center items-center pt-12">-->
<!--            <Jumper size="25" color="#4ea8de" unit="rem" duration="1s" />-->
<!--        </div>-->
<!--        <div class="flex justify-center items-center">-->
<!--            <h2>Loading The Heatmap.</h2>-->
<!--        </div>-->
<!--    {/if}-->

{:catch error}
  Some error has occured!
{/await}

<style>
    .row {
        padding: 0 5px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;
        /*line-height: 50px;*/
        font-weight: 500;
        background: #fff;
    }
</style>