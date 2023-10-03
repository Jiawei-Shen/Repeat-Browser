  import { writable } from 'svelte/store';
  // import _data from "../json/main.json";
  export const consensusModal = writable(null);
  export const genomeModal = writable(null);

  function createStore() {
    const {subscribe, set, update} = writable({
      data: [],
      repeats: [],
      assay: 'DNA-seq',
      biosample: 'Human',
      scale: 2,
      consensuslist: [],
      genomelist: []
      // files: _data.files // list of all files
    });

    return {
      subscribe,

      set,

      addDataItems: (newVal) => update(n => {
        n.data = newVal;
        return n;
      }),

      addRepeats: (newVal) => update(n => {
        n.repeats = newVal;
        return n;
      }),

      updateConsensusTrack: (newVal) => update(n => {
        n.consensuslist = newVal;
        return n;
      }),

      updateGenomeView: (newVal) => update(n => {
        n.genomelist = newVal;
        return n;
      }),

      setAssayDNA: () => update( n => {
        n.assay = 'DNA-seq';
        return n;
      }),

      setAssayRNA: () => update( n => {
        n.assay = 'Cage-seq';
        return n;
      }),

      setScale: (scale) => update( n => {
        n.scale = scale;
        return n;
      })
    }
  }

  export const Cart = createStore();
  Cart.subscribe(value => {
    if(value.data.length > 0){
      localStorage.Cart = JSON.stringify(value);
    }
  })


