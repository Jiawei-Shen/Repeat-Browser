//Todo: change the url after the bigwig file is ready!

export const createSession = function(input, count, subfam, uuid) {
  console.log(input, subfam);
  const allDataPoints = input.map(chr => {
    if(chr.values){
      return chr.values.map(d => {
        let tmp = {...d};
        tmp.chr = chr.key;

        return tmp;
      })
    } else{
      return 'undefied'
    }
  }).flat(2);
  let topEntries;
  if (allDataPoints.length > 1){
    topEntries = calcTopEntries(allDataPoints, 'RPKM', count);
  } else {
    topEntries = allDataPoints
  }
  const totalLength = calcTotalLength(topEntries);

  let features = topEntries.map((d, index) => {
    return {
      // name: subfam + "_" + parseInt(index + 1),
      name: d.chr,
      locus: { start: d.start, end: d.end, chr: d.chr },
      strand: "+"
    }
  })

  let bundleId = uuid;
  let viewIntervalEnd = totalLength;
  const dataInfo = input[0].values[0].data;
  let bigwig_url = ''
  console.log(input[0]);
  let organism;
  if (["hg38", "hg19", "GRCh38"].includes(dataInfo.Organism)) organism = 'hg38';
  if (["mm10"].includes(dataInfo.Organism)) organism = 'mm10';

  if(dataInfo['Zarr'].includes('chip')){
    let data_id = dataInfo['Zarr'].split('/');
    data_id = data_id[data_id.length - 2].split('_')[0];
    console.log(dataInfo['Zarr']);
    // bigwig_url = `https://s3-obs1.htcf.wustl.edu/repeatbrowser/${organism}/`
    bigwig_url = dataInfo['Zarr'].replace('.zarr/', `_bigwig/signal/${data_id}_signal.sorted.iteres.bigWig`)
  } else if(dataInfo['Zarr'].includes('dnase')){
    let data_id = dataInfo['Zarr'].split('/');
    data_id = data_id[data_id.length - 2].split('_')[0];
    bigwig_url = dataInfo['Zarr'].replace('.zarr/', `_bigwig/${data_id}.sorted.iteres.bigWig`)
    console.log(bigwig_url);
  }

  let assay = dataInfo.Assay.toLowerCase();
  if (assay.includes('cage')) assay = "cage-seq";
  if (assay.includes('chip')) assay = `${assay.split(" ")[1]}/${assay.split(" ")[0]}`;

  // let url = `https://wangftp.wustl.edu/~scheng/repeat_browser/${organism}/${assay}/Processed_${dataInfo.id}/${dataInfo.id}_bigwig/${dataInfo.id}.sorted.iteres.unique.bigWig`;
  // if (assay.includes('chip')) url = `https://wangftp.wustl.edu/~scheng/repeat_browser/${organism}/${assay}/Processed_${dataInfo.id}_signal/${dataInfo.id}_singal_bigwig/signal/${dataInfo.id}_signal.sorted.iteres.unique.bigWig`;

  bigwig_url = "https://wangftp.wustl.edu/~scheng/repeat_browser/paper_figure/chip-seq/HeLa-S3_STAT1/test/rep1/methylqa/ENCFF000XPK.bigWig"
  console.log(features[0].locus);

  const updatedTemplate=`
  [
  {
    "name": "Ruler",
    "type": "ruler",
    "label": "Ruler",
    "options": {
      "label": "Ruler"
    },
    "url": "",
    "metadata": {
      "Track type": "ruler"
    },
    "isSelected": false,
    "fileObj": "",
    "files": [

    ],
    "tracks": [

    ],
    "isText": false,
    "textConfig": {

    },
    "apiConfig": {

    },
    "queryEndpoint": {

    }
  },
  {
    "name": "gencodeV39",
    "type": "geneannotation",
    "label": "gencodeV39",
    "options": {
      "maxRows": 10,
      "label": "gencodeV39"
    },
    "url": "",
    "metadata": {
      "Track type": "geneannotation"
    },
    "isSelected": false,
    "fileObj": "",
    "files": [

    ],
    "tracks": [

    ],
    "isText": false,
    "textConfig": {

    },
    "apiConfig": {

    },
    "queryEndpoint": {

    },
    "genome": "hg19"
  },
  {
    "name": "RepeatMasker",
    "type": "repeatmasker",
    "label": "RepeatMasker",
    "options": {
      "label": "RepeatMasker"
    },
    "url": "https://vizhub.wustl.edu/public/hg19/rmsk16.bb",
    "metadata": {
      "Track type": "repeatmasker"
    },
    "isSelected": false,
    "fileObj": "",
    "files": [

    ],
    "tracks": [

    ],
    "isText": false,
    "textConfig": {

    },
    "apiConfig": {

    },
    "queryEndpoint": {

    }
  },
  {
    "name":"${subfam}",
    "type":"bigwig",
    "label":"${subfam}",
    "options":{"label":"${subfam}"},
    "url":"${bigwig_url}",
    "showOnHubLoad": true,
    "metadata":{"genome":"hg38","Track type":"bigwig"}
  }
]`
  // console.log(url);
  return updatedTemplate;
}


const reducer = (accumulator, currentValue) => {
  let res = accumulator + currentValue;
  return res;
 } ;

function calcTotalLength(list) {
  if(list.length>0) {
    return list.map(d => d.end - d.start).reduce(reducer);
  }else{
    return undefined
  }
}

function calcTopEntries(list, key, count) {
  return list.sort((a, b) => (a[key] > b[key]) ? 1 : -1).slice(Math.max(list.length - count, 1));
}

function calcBottomEntries(list, key, count) {
  return list.sort((a, b) => (a[key] > b[key]) ? 1 : -1).slice(0, count);
}

