  import { writable } from 'svelte/store';
  // import _data from "../json/main.json";
  export const consensusModal = writable(null);
  export const genomeModal = writable(null);
  export const TEModal = writable(null);

  function createStore() {
    const {subscribe, set, update} = writable({
      data: [],
      // humanData: [],
      // mouseData: [],
      repeats: [],
      // humanRepeats: [],
      // mouseRepeats: [],
      assay: 'DNA-seq',
      biosample: 'Human',
      species: 'Human',
      scale: 2,
      consensuslist: [],
      genomelist: [],
      multiTEGenomeList: []
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

      updateMultiTEGenomeList: (newVal) => update(n => {
        n.multiTEGenomeList = newVal;
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
      }),

      setSpecies: (species) => update( n => {
        n.biosample = species;
        n.species = species;
        return n;
      })
    }
  }

  export const Cart = createStore();
  Cart.subscribe(value => {
    if(value.data.length > 0){
      localStorage.Cart = JSON.stringify(value);
      // console.log('Recover local storage.', value);
    }
  })


