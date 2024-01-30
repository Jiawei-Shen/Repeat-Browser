import axios from 'axios';
// import pako from 'pako';
// import {getMultipleTabixRegions} from './getMultipleTabixRegions';
import {getFileAndUnzipAll, getZarrStatdata, reshapeZarrStatFormat} from './getFileAndUnzipAll';
import * as _ from 'lodash';
import { TabixIndexedFile } from '@gmod/tabix';
import { slice, openArray } from "zarr";

const RemoteFile = require('generic-filehandle');
const ALL_READS_RPKM_STAT_POSITION = 8; //Starts from 0.
const UNIQUE_READS_RPKM_STAT_POSITION = 10; //Starts from 0.

/**
 * 1. one function to fetch RPKM - input dataset URL and subfamily - DONE
 * 2. One hash to store all the values from 1. - when a list of data and list of repeats are input
 * 3. One function to check first if value exists in 2, else call 1.
 */

/**
 *
 * @param {string} DATASET e.g {
                                "name": "ENCFF598WCX",
                                "subfamUniq": "https://s3.amazonaws.com/repbr/TEST/ENCFF598W/ENCFF598WCX.iteres.uniq.bw",
                                "subfamAll": "https://s3.amazonaws.com/repbr/TEST/ENCF/ENCFF598WCX.iteres.bw",
                                "subamLoci": "https://s3.amazonaws.com/repbr/TEST/ENCFF598WCX.A/ENCFF598WCX.ALL.iteres.loci.gz",
                                "subfamStat": "https://s3.amazonaws.com/repbr/TEST/ENCFF598WCX/ENCFF598WCX.subfamily.bed.gz",
                                "metadata": {}
                                }
 * @param {string} key e.g. subfamStat
 * @param {string} SUBFAMILY e.g. MER41B
 */
export async function getDataFromTabix(DATASET, KEY, SUBFAMILY) {

    const URL = DATASET[KEY];

    try {
        if (!URL) {
            throw new Error(`Valid URL was not provided : ${URL}`);
        }

        if (!SUBFAMILY) {
            throw new Error(`Valid SUBFAMILY was not provided : ${SUBFAMILY}`);
        }
        const tbiIndexed = new TabixIndexedFile({
            filehandle: new RemoteFile(URL),
            tbiFilehandle: new RemoteFile(`${URL}.tbi`)
        })
        const lines = [];
        await tbiIndexed.getLines(SUBFAMILY, 0, 1, (line, fileOffset) => lines.push(line)); // 0,1 because there is only 1 row per subfamily

        return lines.map(line => responseParse(line, DATASET, KEY));

    } catch (error) {
        console.log(error)
        return error;
    }
}

/**
 *
 * @param {Array} DATASETS e.g [{
      "name": "ENCFF598WCX",
      "subfamUniq": "https://s3.amazonaws.com/repbr/TEST/ENCFF598W/ENCFF598WCX.iteres.uniq.bw",
      "subfamAll": "https://s3.amazonaws.com/repbr/TEST/ENCF/ENCFF598WCX.iteres.bw",
      "subamLoci": "https://s3.amazonaws.com/repbr/TEST/ENCFF598WCX.A/ENCFF598WCX.ALL.iteres.loci.gz",
      "subfamStat": "https://s3.amazonaws.com/repbr/TEST/ENCFF598WCX/ENCFF598WCX.subfamily.bed.gz",
      "metadata": {}
    }]
 * @param {Array} SUBFAMILIES e.g. ['MER41B']
 */
export async function getDataForHeatmap(DATASETS, KEY, SUBFAMILIES) {
    try {
        if (DATASETS === undefined || DATASETS.length == 0) { // array empty or does not exist
            throw new Error('Valid DATASETS list was not provided');
        }

        if (SUBFAMILIES === undefined || SUBFAMILIES.length == 0) {
            throw new Error('Valid SUBFAMILY list was not provided');
        }
        const localStorageLookup = localStorage.getItem('DATASETS_SUBFAMILIES');
        let localStorageFoundItems = {};
        if (localStorageLookup) {
            localStorageFoundItems = JSON.parse(localStorageLookup);
        }
        
        const fetchedAlready = [];

        const promisesList = [];
        DATASETS.forEach(dataset => {
            const {name} = dataset;
            promisesList.push(getMultipleTabixRegions(dataset, KEY, SUBFAMILIES)); // API call
            // SUBFAMILIES.forEach(subfamily => {
            //     // check if the combination exists in localStorage
            //     if (localStorageFoundItems[name]) {
            //         // console.log(`${name}===${subfamily}`);
            //         if (localStorageFoundItems[name][subfamily]) {
            //             fetchedAlready.push(localStorageFoundItems[name][subfamily]);
            //         } else {
            //             console.log(dataset, KEY, subfamily)
            //             promisesList.push(getDataFromTabix(dataset, KEY, subfamily)); // API call
            //         }
            //     } else {
            //         // else push it in promise List
            //         promisesList.push(getDataFromTabix(dataset, KEY, subfamily));
            //     }
            // })
        })

        let toReturn = [];

        if (promisesList.length > 0) {
            // chunk this into blocks of 10 requests
            // if (promisesList.length > 10) {
            //     const promisesChunks = makeArrayChunks(promisesList, 20);
            //     const resolvedResults = [];
            //     promisesChunks.forEach(async (chunk, index) => {
            //         const resolvedChunkList = await Promise.all(chunk);
            //         resolvedResults.concat(resolvedChunkList);
            //     })
            //     toReturn = syncToLocalStorage(resolvedResults);
            // } else {
                const resolvedPromiseList = await Promise.all(promisesList);
                toReturn = syncToLocalStorage(resolvedPromiseList);
            // }
            
        } else {
            toReturn = toReturn.concat(fetchedAlready);
        }

        return formatResponse(toReturn);

    } catch (error) {
        console.log(error)
        return error;
    }
}

export async function getDataForHeatmapAll(DATASETS, KEY, SUBFAMILIES) {
    
    try {
        if (DATASETS === undefined || DATASETS.length == 0) { // array empty or does not exist
            throw new Error('Valid DATASETS list was not provided');
        }

        // const localStorageLookupDatasets = localStorage.getItem('DATASETS'); // fetch entire .bed.gz file
        // let localStorageFoundDatasets = {};
        // if (localStorageLookupDatasets) {
        //     localStorageFoundDatasets = JSON.parse(localStorageLookupDatasets);
        // }

        const promisesList = [];
        let dataAll = {};
        let dataFetchedBefore = [];
        let dataFetchedNow = [];
        
        DATASETS.forEach(DATASET => {
            promisesList.push(getFileAndUnzipAll(DATASET, KEY));
        })
        // DATASETS.forEach(DATASET => {
        //     if (localStorageFoundDatasets[DATASET.id]) {
        //         // this data was fetched earlier
        //         dataFetchedBefore.push({ id: DATASET.id, body:  localStorageFoundDatasets[DATASET.id] });
        //     } else {
        //         promisesList.push(getFileAndUnzipAll(DATASET, KEY));
                
        //         dataAll[DATASET.id] = {}
        //     }
        // });
        dataFetchedNow = await Promise.all(promisesList);
        const allDataList = dataFetchedBefore.concat(dataFetchedNow);
        
        const dataFormatted = allDataList.map(item => reshapeFormat(item));
        // console.log(dataFormatted);

        // const dataFilteredForSubfamilies = filterForRequestedRepeats(allDataList, SUBFAMILIES);
        // storeInLocalStorage(dataFilteredForSubfamilies);

        let objToReturn = { all: [], unique: [] };
        dataFormatted.forEach(d => {
            const { all, unique } = d;
            objToReturn.all.push(all);
            objToReturn.unique.push(unique);
        })
        // console.log(objToReturn);
        return objToReturn;

    } catch(error) {
        console.log(error)
        return error;
    }
}

/**
 *
 * @param {Array} input e.g. ["LTR1B	0	1	{"family":"ERV1","class":"LTR","consensus_length":824,"reads_count":2660,"unique_reads_count":2475,"total_length":207274,"genome_count":320,"all_reads_RPKM":0.470,"all_reads_RPM":97.507,"unique_reads_RPKM":0.515,"unique_reads_RPM":106.831}"]
 * @param {string} DATASET e.g {
                                "name": "ENCFF598WCX",
                                "subfamUniq": "https://s3.amazonaws.com/repbr/TEST/ENCFF598W/ENCFF598WCX.iteres.uniq.bw",
                                "subfamAll": "https://s3.amazonaws.com/repbr/TEST/ENCF/ENCFF598WCX.iteres.bw",
                                "subamLoci": "https://s3.amazonaws.com/repbr/TEST/ENCFF598WCX.A/ENCFF598WCX.ALL.iteres.loci.gz",
                                "subfamStat": "https://s3.amazonaws.com/repbr/TEST/ENCFF598WCX/ENCFF598WCX.subfamily.bed.gz",
                                "metadata": {}
                                }
 * @param {string} key e.g. subfamStat // NOT USING now. But might be useful in future to write a more generalized version of this function
 * */
function responseParse(input, dataset, key) {

    const myArray = input.split('\t');
    if (myArray.length === 0) {
        return null;
    }
    var firstItem = myArray[0];
    var lastItem = myArray[myArray.length - 1];
    var objOutput = {
        subfamily: firstItem,
        id: dataset.id,
        ...JSON.parse(lastItem)
    };
    return objOutput;
}

function filterForRequestedRepeats(dataList, subfamilies) {
    let toReturn = {};
    dataList.forEach(d => {
        const { id, body } = d;
        let tmp = {};

        subfamilies.forEach(s => {
            tmp[s] = body[s];
        })
        toReturn[id] = tmp;
    })
    return toReturn;
}

function reshapeFormat(input) {
    const { id, body } = input;
    const objOutput = {
        all: {},
        unique: {}
    }
    let tmp_all = {};
    let tmp_uniq = {};

    const datalines = body.split('\n');

    datalines.slice(1).forEach(line => {
        // tmp_all[d] = body[d].all_reads_RPKM;
        // tmp_uniq[d] = body[d].unique_reads_RPKM;
        line = line.split("\t");
        tmp_all[line[0]] = line[ALL_READS_RPKM_STAT_POSITION];
        tmp_uniq[line[0]] = line[UNIQUE_READS_RPKM_STAT_POSITION];
    });
    objOutput.all = {
            id,
            ...tmp_all
        }

    objOutput.unique = {
            id,
            ...tmp_uniq
        }

    return objOutput;
}
/**
 *
 * @param {Array} input
 * @return {Object}
     * all: {
     *      name: ENCFF598WCX,
     *      MER41B: 0.56,
     *      LTR32C: 0.29
     *      ...
     * },
     * unique: {
     *      name: ENCFF598WCX,
     *      MER41B: 0.26,
     *      LTR32C: 0.83
     *      ...
     * }
 */
function formatResponse(formattedResponse) {

    // TODO: sync this to localStorage const formattedResponse = input.map(d =>
    // d[0])
    const objOutput = {
        all: [],
        unique: []
    }
    const nestedByName = d3
        .nest()
        .key(function (d) {
            return d.id;
        })
        .entries(formattedResponse);

    nestedByName.forEach(({key, values}) => {
        let tmp_all = {};
        values.forEach(d => {
            tmp_all[d.subfamily] = d.all_reads_RPKM;
        })

        let tmp_uniq = {};
        values.forEach(d => {
            tmp_uniq[d.subfamily] = d.unique_reads_RPKM;
        })
        objOutput
            .all
            .push({
                id: key,
                ...tmp_all
            })

        objOutput
            .unique
            .push({
                id: key,
                ...tmp_uniq
            })
    })
    return objOutput;
}


function syncToLocalStorage(input) {
    const syncedResponse = input.map(list => syncToLocalStoragePerRow(list));
    return syncedResponse[0];
}

function syncToLocalStoragePerRow(list) {
    let names = _.uniq(list.map(d => d.id));
    let subfamilies = _.uniq(list.map(d => d.subfamily));
    let objToSave = {};
    let objPulled = {}
    let objToReturn = {};
    let listToReturn = [];

    names.forEach(name => {
        objToSave[name] = {};
        subfamilies.forEach(subfamily => {
            objToSave[name][subfamily] = {}
        });
    })
    list.forEach(item => {
        const {name, subfamily} = item;
        objToSave[name][subfamily] = item;
    })

    const localStorageLookup = localStorage.getItem('DATASETS_SUBFAMILIES');

    if (localStorageLookup) {
        objPulled = JSON.parse(localStorageLookup);
        let keysPulled = Object.keys(objPulled);
        const allKeys = _.uniq(names.concat(keysPulled));

        allKeys.forEach(key => {
            objToReturn[key] = Object.assign({}, objPulled[key], objToSave[key]);
        })
        localStorage.setItem('DATASETS_SUBFAMILIES', JSON.stringify(objToReturn));
        return flattenLookupObj(objToReturn);
    } else {
        localStorage.setItem('DATASETS_SUBFAMILIES', JSON.stringify(objToSave));
        return flattenLookupObj(objToSave);
    }
}

function flattenLookupObj(obj) {
    let tmp = [];
    Object
        .keys(obj)
        .forEach(key => {
            let moreObjs = obj[key];
            Object
                .keys(moreObjs)
                .forEach(moreKey => {
                    tmp.push(moreObjs[moreKey]);
                })
        })

    return tmp;
}

/**
 * 
 * @param {Array} array 
 * @param {Number} chunk_size 
 */
const makeArrayChunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map(begin => array.slice(begin, begin + chunk_size));


function storeInLocalStorage(input) {

    localStorage.setItem('DATASETS', JSON.stringify(input));
}


export async function getZarrForHeatmapAll(DATASETS, KEY, SUBFAMILIES) {
    try {
        if (DATASETS === undefined || DATASETS.length == 0) { // array empty or does not exist
            throw new Error('Valid DATASETS list was not provided');
        }
        const promisesList = [];
        let dataAll = {};
        let dataFetchedBefore = [];
        let dataFetchedNow = [];

        // DATASETS.forEach(DATASET => {
        //     promisesList.push(getFileAndUnzipAll(DATASET, KEY));
        // })
        DATASETS.forEach(FILE => {
            promisesList.push(getZarrStatdata(FILE, SUBFAMILIES));
        })
        dataFetchedNow = await Promise.all(promisesList);
        // const allDataList = dataFetchedBefore.concat(dataFetchedNow);
        // const dataFormatted = allDataList.map(item => reshapeZarrStatFormat(item));

        // const dataFilteredForSubfamilies = filterForRequestedRepeats(allDataList, SUBFAMILIES);
        // storeInLocalStorage(dataFilteredForSubfamilies);
        let objToReturn = { all: [], unique: [] };
        dataFetchedNow.forEach(d => {
            const { all, unique } = d;
            objToReturn.all.push(all);
            objToReturn.unique.push(unique);
        })
        return objToReturn;

    } catch(error) {
        console.log(error)
        return error;
    }
}

const simpleRequestWithURL = async function (TSVSTR, rootURL){
    const url_submit = rootURL + "submit";
    const url_retrieve = rootURL + "retrieve";

    const para = {"tsv_content" : TSVSTR};
    const form = new FormData();
    form.append("task", JSON.stringify(para));
    form.append("developer_email", "fake@email.com");

    let form2 = new FormData();

    // Initiate the first request
    await fetch(url_submit, {
        method: 'POST',
        body: form,
    })
        .then((response) => response.json())
        .then((data) => {
            form2.append("task_id", data[0].id)
        })

    // Define how to retrieve result
    const retrieve_request = function (){
        return fetch(url_retrieve, {
            method: 'POST',
            body: form2,
        })
            .then((response) => response.json())
            .then((data) => {
                return data[0]
            })}

    const delay = function (time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    let i = 0;
    while (true){
        i += 1
        let d = await retrieve_request();
        if (d.finished){
            return d.result
        }

        let delay_ms = 100;
        if (i > 4){
            delay_ms = 1000;
        }
        await delay(delay_ms)
    }


}

const simpleRequest = function (TSVSTR){
    // const url1 = "https://127.0.0.1:10981/";
    // const url2 = "https://10.20.127.23:10981/";
    const url = "https://clusterapi.repeatbrowser.org/";

    return simpleRequestWithURL(TSVSTR, url)
}


export async function getBackendjson(DATASETS, KEY, SUBFAMILIES){
    try {
        if (DATASETS === undefined || DATASETS.length == 0) { // array empty or does not exist
            throw new Error('Valid DATASETS list was not provided');
        }
        let backend_input_str = "";
        let backend_input_str_line1 = "\t\t";
        let backend_input_str_line2 = "\t\t";
        let backend_input_str_line3 = "\t\t";
        SUBFAMILIES.forEach(r=>{
            backend_input_str_line1 += "Repeats Subfamily: " + r.name + '\t';
            backend_input_str_line2 += "Family: " + r.family + '\t';
            backend_input_str_line3 += "Class: " + r.class + '\t';
        })
        // const test_string = backend_input_str_line1.replace(/\t(?=[^\t]+$)/, "\n");
        // backend_input_str_line1 += - "\t" + "\n"
        // backend_input_str_line2 += - "\t" + '\n'
        // backend_input_str_line3 += - "\t" + '\n'
        backend_input_str_line1 = backend_input_str_line1.slice(0, -1) + '\n';
        backend_input_str_line2 = backend_input_str_line2.slice(0, -1) + '\n';
        backend_input_str_line3 = backend_input_str_line3.slice(0, -1) + '\n';

        backend_input_str = backend_input_str_line1 + backend_input_str_line2 + backend_input_str_line3
        const promisesList = [];
        let dataFetchedNow = [];

        // DATASETS.forEach(DATASET => {
        //     promisesList.push(getFileAndUnzipAll(DATASET, KEY));
        // })

        DATASETS.forEach(FILE => {
            promisesList.push(getZarrStatdata(FILE, SUBFAMILIES));
        })

        dataFetchedNow = await Promise.all(promisesList);
        // const allDataList = dataFetchedBefore.concat(dataFetchedNow);
        // const dataFormatted = allDataList.map(item => reshapeZarrStatFormat(item));

        // const dataFilteredForSubfamilies = filterForRequestedRepeats(allDataList, SUBFAMILIES);
        // storeInLocalStorage(dataFilteredForSubfamilies);
        let backend_input_str_all = ""
        let backend_input_str_unique = ""
        for(let i=0; i<DATASETS.length; i++){
            // console.log(DATASETS[i]);
            const { all, unique } = dataFetchedNow[i];
            let str_line_header;
            // console.log(DATASETS[i]);
            if (DATASETS[i].Target == 'unknown' || typeof DATASETS[i].Target === 'undefined'){
                str_line_header = "File: " +  `${DATASETS[i].Biosample} (${DATASETS[i].Assay})` + "\t" + "Info: " + DATASETS[i].id +"\t";
            } else {
                str_line_header = "File: " +  `${DATASETS[i].Biosample} (${DATASETS[i].Target})` + "\t" + "Info: " + DATASETS[i].id +"\t";
            }

            // let str_line_header = "File: " +  `${DATASETS[i].Assay} in ${DATASETS[i].Biosample}` + "\t" + "Info: " + DATASETS[i].id +"\t";
            // let str_line_header = "File: " +  DATASETS[i].id + "\t" + "Info: " + `${DATASETS[i].Assay} in ${DATASETS[i].Biosample}` +"\t";
            // let str_line_header = "File: " + DATASETS[i].id + "\t" + "Biosample Type: " + DATASETS[i].Biosample +"\t";
            let str_line_content_all = "";
            let str_line_content_unique = "";
            SUBFAMILIES.forEach(r => {
                str_line_content_all += `${all[r.name]}` + '\t';
                str_line_content_unique += `${unique[r.name]}` + '\t';
            })
            // str_line_content_all += - "\t" + '\n';
            str_line_content_all = str_line_content_all.slice(0, -1) + '\n';
            str_line_content_unique = str_line_content_unique.slice(0, -1) + '\n';
            // str_line_content_unique += - "\t" + '\n';
            backend_input_str_all += str_line_header + str_line_content_all
            backend_input_str_unique += str_line_header + str_line_content_unique
        }
        backend_input_str_all = backend_input_str + backend_input_str_all.slice(0, -1);
        backend_input_str_unique = backend_input_str + backend_input_str_unique.slice(0, -1);

        const str_find = "undefined";
        const regex = new RegExp(str_find, "g");
        backend_input_str_all = backend_input_str_all.replace(regex, "0");
        backend_input_str_unique = backend_input_str_unique.replace(regex, "0");

        let result_all = simpleRequest(backend_input_str_all);
        let result_unique = simpleRequest(backend_input_str_unique);
        const resultJson = await result_unique;
        // console.log(resultJson);

        return resultJson

    } catch(error) {
        console.log(error)
        return error;
    }
}

export async function FetchZarrData(DATASETS, KEY, SUBFAMILIES) {
    try {
        if (DATASETS === undefined || DATASETS.length == 0) { // array empty or does not exist
            throw new Error('Valid DATASETS list was not provided');
        }

        const promisesList = [];
        let dataAll = {};
        let dataFetchedBefore = [];
        let dataFetchedNow = [];

        // DATASETS.forEach(DATASET => {
        //     promisesList.push(getFileAndUnzipAll(DATASET, KEY));
        // })

        DATASETS.forEach(FILE => {
            promisesList.push(getZarrStatdata(FILE));
        })

        dataFetchedNow = await Promise.all(promisesList);
        const allDataList = dataFetchedBefore.concat(dataFetchedNow);

        return allDataList

    } catch(error) {
        console.log(error)
        return error;
    }
}