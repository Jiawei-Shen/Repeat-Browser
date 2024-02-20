// import BigSource from '../../dataSource/BigSource';
import BigWigSource from '../../api/BigWigSource';
import {getZarrdata} from "../../api/getFileAndUnzipAll";
import {openArray} from "zarr";
// import CONFIG from '../../config/settings.json'
// import { max } from 'd3-array'
// import DATA from '../../json/test.datahubs.json';
// import { Cart } from '../../stores/CartStore';
const fetch = require('node-fetch')
const zarrRemote = require('zarr-js')(fetch)


/**
 * all {score: 0, start: 0, end: 1}
 */
export const fetchConsensusData = async function (FILE, subfam) {
    const fileId = FILE[0].id;
    // const FILE = DATA.files.filter(file => file.File_accession === dataId);
    // const FILE = $Cart.data.filter(file => file.File_accession === dataId);
    // console.log(FILE);
    const optionsBigWig = {
        url: {
            // all: `${CONFIG.WEB_ASSETS_URL_AWS}/${dataId}/data.iteres.bigWig`,
            // unique: `${CONFIG.WEB_ASSETS_URL_AWS}/${dataId}/data.iteres.unique.bigWig`
            all: FILE[0].subfamAll,
            unique: FILE[0].subfamUniq
        },
        params: {
            chr: subfam,
            min: 1,
            max: 99999 // if you give a very large value, it will return just what exists.
            // No need to specifically pass consensus length
        }
    }

    // const dataSource_all = new BigSource(optionsBigWig.url.all);
    // const dataSource_unique = new BigSource(optionsBigWig.url.unique);

    // let allPromise = dataSource_all.getBigWigData(optionsBigWig.params)
    // let uniquePromise = dataSource_unique.getBigWigData(optionsBigWig.params)

    const dataSource_all = new BigWigSource(optionsBigWig.url.all);
    const dataSource_unique = new BigWigSource(optionsBigWig.url.unique);

    const { chr, min, max } = optionsBigWig.params;
    let allPromise = dataSource_all.getData(chr, min, max);
    let uniquePromise = dataSource_unique.getData(chr, min, max);

    let combined = await Promise.all([allPromise, uniquePromise])
    const [all, unique] = combined;

    return { fileId, all, unique };
    // let toRespond = consolidate(combined)
    // let maxValue = calcMaxValue(combined)

    // return { 
    //     data: toRespond,
    //     max: maxValue
    // }

}

function consolidate(responses) {
    let all = responses[0];
    let unique = responses[1];
    
    let consolidated = []

    all.forEach((element, i) => {
        let tmp = {}
        tmp.all = Number.parseInt(element.score, 10);
        tmp.unique = Number.parseInt(unique[i].score, 10);
        tmp.position = i + 1;

        consolidated.push(tmp);
    });

    return consolidated;

}


function calcMaxValue(responses) {
    let all = responses[0];
    let unique = responses[1];

    let allValues = all.map(item => item.score)
    let uniqueValues = unique.map(item => item.score)

    let concatValues = allValues.concat(uniqueValues)

    return d3.max(concatValues)

}

export default fetchConsensusData

/**
const optionsBigWig = {
    url: {
        all: `${CONFIG.WEB_ASSETS_URL}/a7fe1c70-6b00-11e7-8202-1bbac9f23d88/data.iteres.bigWig`,
        unique: `${CONFIG.WEB_ASSETS_URL}/a7fe1c70-6b00-11e7-8202-1bbac9f23d88/data.iteres.unique.bigWig`
    },
    params: {
        chr: 'AluJb',
        min: 1,
        max:  400  // if you give a very large value, it will return just what exists. 
                    // No need to specifically pass consensus length
    }
}
 */

export const fetchConsensusDataAll = async function(experiment, subfam, FILES) {
    const { Replicates, Controls } = experiment;

    let signalPromises = [];
    let backgroundPromises = [];

    let signalValues = [];
    let backgroundValues = [];

    Replicates.map(fileName => {
        const file = FILES.filter(file => file.id === fileName);
        if (file.length === 0) {
            console.error('File not found : ' + fileName);
            throw new Error('File not found : ' + fileName);
        } else {
            signalPromises.push(fetchConsensusData(file, subfam));
        }
    })
    signalValues = await Promise.all(signalPromises);

    if (Controls.length > 0) {
        Controls.map(fileName => {
            const file = FILES.filter(file => file.id === fileName);
            if (file.length === 0) {
                console.error('File not found : ' + fileName);
                throw new Error('File not found : ' + fileName);
            } else {
                backgroundPromises.push(fetchConsensusData(file, subfam));
            }
        })
        backgroundValues = await Promise.all(backgroundPromises);
    }

    return [...signalValues, ...backgroundValues]
}


export const fetchConsensusDatabyZarr = async function (FILE, subfam, data_length) {
    const zarr_url = FILE[0].Zarr;
    const fileId = FILE[0].id;
    const mode = FILE[0].Mode;
    const assay = FILE[0].Assay;
    let name;

    if(FILE[0].Target == 'unknown' || typeof FILE[0].Target === 'undefined'){
        name = `${FILE[0].Biosample}(${FILE[0].Assay})`
    } else {
        name = `${FILE[0].Biosample}(${FILE[0].Target})`
    }
    // console.log(name);

    let return_value;

    if (mode === 'Experiment'){
        // let signal_allPromise = getZarrWig('signal_all_bigwig', subfam, zarr_url);
        // let signal_uniquePromise = getZarrWig('signal_uni_bigwig', subfam, zarr_url);
        //
        // let control_allPromise = getZarrWig('control_all_bigwig', subfam, zarr_url);
        // let control_uniquePromise = getZarrWig('control_uni_bigwig', subfam, zarr_url);
        let signal_allPromise = getZarrWigNew('signal_all_bigwig', subfam, zarr_url, 'DNA', data_length);
        let signal_uniquePromise = getZarrWigNew('signal_uni_bigwig', subfam, zarr_url, 'DNA', data_length);

        let control_allPromise = getZarrWigNew('control_all_bigwig', subfam, zarr_url, 'DNA', data_length);
        let control_uniquePromise = getZarrWigNew('control_uni_bigwig', subfam, zarr_url, 'DNA', data_length);

        let signal_combined = await Promise.all([signal_allPromise, signal_uniquePromise])
        let control_combined = await Promise.all([control_allPromise, control_uniquePromise])

        const [signal_all, signal_unique] = signal_combined;
        const [control_all, control_unique] = control_combined;
        const maxValue = Math.max(...signal_combined.map(s => Math.max(...s.map(x => x.score))));
        console.log(maxValue);
        return_value = [{"fileId": fileId + "_signal", "all": signal_all, "unique": signal_unique,maxValue, "fileName": name},
            {"fileId": fileId + "_control", "all": control_all, "unique": control_unique, maxValue, "fileName": name}];
    } else if(assay.includes('RNA') || assay.includes('Cage')){
        // let allPromise = getZarrWigNew('all_bigwig', subfam, zarr_url, 'RNA');
        // let uniquePromise = getZarrWigNew('uni_bigwig', subfam, zarr_url, 'RNA');
        //
        // let combined = await Promise.all([allPromise, uniquePromise])
        // const [all, unique] = combined;
        // return_value = [{fileId, all, unique, "fileName": name}];
        console.log('The Cage!');
        let all_plus_Promise = getZarrWigNew('all+_bigwig', subfam, zarr_url, 'RNA', data_length);
        let all_minus_Promise = getZarrWigNew('all-_bigwig', subfam, zarr_url, 'RNA', data_length);
        let unique_plus_Promise = getZarrWigNew('uni+_bigwig', subfam, zarr_url, 'RNA', data_length);
        let unique_minus_Promise = getZarrWigNew('uni-_bigwig', subfam, zarr_url, 'RNA', data_length);

        console.log(all_minus_Promise);

        let combined = await Promise.all([all_plus_Promise, all_minus_Promise, unique_plus_Promise, unique_minus_Promise]);
        const [all_plus, all_minus, unique_plus, unique_minus] = combined;

        const maxValue = Math.max(...combined.map(s => Math.max(...s.map(x => x.score))));
        return_value = [{fileId, all_plus, all_minus, unique_plus, unique_minus, maxValue, "fileName": name}];
        // const [all, unique] = combined;
        // return_value = [{fileId, all, unique, "fileName": name}];
    } else {
        // let allPromise = getZarrWig('all_bigwig', subfam, zarr_url);
        // let uniquePromise = getZarrWig('uni_bigwig', subfam, zarr_url);
        let allPromise = getZarrWigNew('all_bigwig', subfam, zarr_url, 'DNA', data_length);
        let uniquePromise = getZarrWigNew('uni_bigwig', subfam, zarr_url, 'DNA', data_length);

        let combined = await Promise.all([allPromise, uniquePromise])
        const [all, unique] = combined;
        const maxValue = Math.max(...combined.map(s => Math.max(...s.map(x => x.score))));
        return_value = [{fileId, all, unique, maxValue, "fileName": name}];
    }
    return return_value;
}


async function getZarrWig(wig_type, subfam, zarr_url, assay='DNA'){
    let chunk_id;
    let wig_zatrr;

    switch (wig_type){
        case 'all_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'all_wig';
            break;

        case 'uni_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'uni_wig';
            break;

        case 'signal_all_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'signal_all_wig';
            break;

        case 'signal_uni_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'signal_uni_wig';
            break;

        case 'control_all_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'control_all_wig';
            break;

        case 'control_uni_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'control_uni_wig';
            break;
    }

    const z = await openArray({ store: zarr_url + wig_type});
    const data_test = await z.get(null)
    const response = await fetch(zarr_url + '\.zattrs');
    const data = await response.json();
    const sub_stat_list = data[wig_zatrr];
    const the_index = sub_stat_list.indexOf(subfam);
    let result
    if (assay === 'RNA'){
        result = data_test['data'][the_index].filter((element, index, array) => {return element > 0})
    } else {
        result = data_test['data'][the_index].filter((element, index, array) => {return element >= 0})
    }
    let the_return_value = new Array();
    result.forEach((element, i) => {
        the_return_value.push({'score': element, 'start': i, 'end': i+1});
    })
    console.log(the_return_value, wig_type);

    let wig_promise = new Promise((resolve) => {
        zarrRemote.openGroup(zarr_url, (err, group, metadata) => {
            const subfam_list = metadata['metadata']['.zattrs'][wig_zatrr];
            const chunksize = metadata['metadata'][`${wig_type}/.zarray`]['chunks'];
            const subfam_index = subfam_list.indexOf(subfam);

            group[wig_type](chunk_id, function(err, array) {
                const all_array = array.data;
                const target_array = all_array.slice(chunksize[1] * subfam_index, chunksize[1] * (subfam_index + 1));
                if (assay === 'RNA'){
                    const return_value = target_array.filter((element, index, array) => {return element > 0})
                    resolve(return_value);
                } else {
                    const return_value = target_array.filter((element, index, array) => {return element >= 0})
                    resolve(return_value);
                }
            })
        })
    })
    const target_array = await wig_promise;
    let return_value = new Array();
    target_array.forEach((element, i) => {
        return_value.push({'score': element, 'start': i, 'end': i+1});
    })
    // console.log(return_value);

    return return_value
}

async function getZarrWigNew(wig_type, subfam, zarr_url, assay='DNA', data_length){
    let chunk_id;
    let wig_zatrr;
    // console.log(data_length, assay);

    switch (wig_type){
        case 'all+_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'all+_wig';
            break;

        case 'all-_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'all-_wig';
            break;

        case 'uni+_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'uni-_wig';
            break;

        case 'uni-_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'uni+_wig';
            break;

        case 'all_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'all_wig';
            break;

        case 'uni_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'uni_wig';
            break;

        case 'signal_all_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'signal_all_wig';
            break;

        case 'signal_uni_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'signal_uni_wig';
            break;

        case 'control_all_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'control_all_wig';
            break;

        case 'control_uni_bigwig':
            chunk_id = [0, 0];
            wig_zatrr = 'control_uni_wig';
            break;
    }

    const z = await openArray({ store: zarr_url + wig_type});
    const data_test = await z.get(null);
    const response = await fetch(zarr_url + '\.zattrs');
    const data = await response.json();
    const sub_stat_list = data[wig_zatrr];
    const the_index = sub_stat_list.indexOf(subfam);
    // console.log(sub_stat_list, subfam);
    let result = data_test['data'][the_index].slice(0, data_length);
    // let result;
    // if (assay === 'RNA'){
    //     result = data_test['data'][the_index].filter((element, index, array) => {return element > 0})
    // } else {
    //     result = data_test['data'][the_index].filter((element, index, array) => {return element >= 0})
    // }
    let the_return_value = new Array();
    result.forEach((element, i) => {
        the_return_value.push({'score': element, 'start': i, 'end': i+1});
    })
    return the_return_value
}