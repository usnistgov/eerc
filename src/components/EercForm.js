//
// NIST Energy Escalation Rate Calculator (web edition)
//
// Principal Investigator:
//     Josh Kniefel <josh.kniefel@nist.gov>
//     Applied Economics Office (AEO)
//     Engineering Laboratory (EL)
//     National Institute of Standards and Technology (NIST)
//
// Developers:
//     Steve Barber <steve.barber@nist.gov>
//     Priya Lavappa <priya.lavappa@nist.gov>
//     EL Data, Security and Technology (ELDST)
//     Engineering Laboratory (EL)
//     National Institute of Standards and Technology (NIST)
//
// This static single-page app reproduces a prior standalone Java application.
//
// NIST Software
//
// This software was developed by employees of the National Institute of Standards
// and Technology (NIST), an agency of the Federal Government and is being made
// 105, works of NIST employees are not subject to copyright protection in the
// United States.  This software may be subject to foreign copyright.  Permission
// in the United States and in foreign countries, to the extent that NIST may hold
// copyright, to use, copy, modify, create derivative works, and distribute this
// software and its documentation without fee is hereby granted on a non-exclusive
// basis, provided that this notice and disclaimer of warranty appears in all copies.
//
// THE SOFTWARE IS PROVIDED 'AS IS' WITHOUT ANY WARRANTY OF ANY KIND, EITHER EXPRESSED
// , IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, ANY WARRANTY THAT THE SOFTWARE
// WILL CONFORM TO SPECIFICATIONS, ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
// A PARTICULAR PURPOSE, AND FREEDOM FROM INFRINGEMENT, AND ANY WARRANTY THAT THE
// DOCUMENTATION WILL CONFORM TO THE SOFTWARE, OR ANY WARRANTY THAT THE SOFTWARE WILL BE
// ERROR FREE.  IN NO EVENT SHALL NIST BE LIABLE FOR ANY DAMAGES, INCLUDING, BUT NOT
// LIMITED TO, DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES, ARISING OUT OF,
// RESULTING FROM, OR IN ANY WAY CONNECTED WITH THIS SOFTWARE, WHETHER OR NOT BASED UPON
// WARRANTY, CONTRACT, TORT, OR OTHERWISE, WHETHER OR NOT INJURY WAS SUSTAINED BY PERSONS
// OR PROPERTY OR OTHERWISE, AND WHETHER OR NOT LOSS WAS SUSTAINED FROM, OR AROSE OUT OF
// THE RESULTS OF, OR USE OF, THE SOFTWARE OR SERVICES PROVIDED HEREUNDER.
//

import React, { useEffect, useState, useReducer, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Alert from '@material-ui/lab/Alert';

import { jsPDF } from 'jspdf';
import Button from '@material-ui/core/Button';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';

import HtmlTooltip from './HtmlTooltip';
import MySelect from './MySelect';

////////////////////////////////////////////////////////////////////////////////
const CO2ePricesURL = 'CO2ePrices.json';
const CO2FactorsURL = 'CO2Factors.json';
const CO2FutureEmissionsURL = 'CO2FutureEmissions.json';
const EncostURL = 'Encost.json';
const ZipToStateURL = 'zipcodetostate.json';
const yearsIn = 31;  // number of years being read in
const carbonConvert = 0.912130;    // factor used to convert results from 2019$/GJ to 2012$/Mbtu; see Step 4 in EERC Calculations Excel file

////////////////////////////////////////////////////////////////////////////////

// NIST Logo is a base64 data-URL embedded image used in the generated PDF
// It was too much of a pain loading the image asynchronously.
const nistLogo = 'data:image/png;base64,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';

//const unselected = '--';
//const valid_re = /^((\d+\.?\d*)|(\d*\.\d+))$/;
const clean_re = /^\s*(\d*\.?\d*).*$/; // if match replace with $1
// eslint-disable-next-line
const pctclean_re = /^\s*(\-?\d*\.?\d*).*$/; // if match replace with $1
// eslint-disable-next-line
const needlead0_re = /^(?<neg>\-?)\./;
// eslint-disable-next-line
const trim0_re = /^(?<neg>\-?)0*(?<num>\d+)0*$/;
const empty_re = /^\s*$/g;
// eslint-disable-next-line
const nonnumeric_re = /[^\d\.]/g;
// eslint-disable-next-line
const nonpercent_re = /[^\d\.\-]/g;

/*
 * SWB: Changed startdates computation to be based on data file contents; see below
 *
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const numYears = 3;
 */

const energytypes = [
  { slug: "coal", name: "Coal" },
  { slug: "distillateoil", name: "Distillate Oil" },
  { slug: "electricity", name: "Electricity" },
  { slug: "naturalgas", name: "Natural Gas" },
  { slug: "residual", name: "Residual" },
];

const sectors = ["Commercial", "Industrial"];

/*
var startdates = [];
for (let i = 1; i <= numYears; i++) {
  //let year = currentYear + i;
  startdates[i] = currentYear + i;  //year.toString();
}
*/

const zero_carbon_price_policy = '__zero__';
const carbonprices = { 'Medium': 'Default', 'Low': 'Low', 'High': 'High', 'No carbon price': zero_carbon_price_policy};

const min_duration = 10;
const max_duration = 25;
const slidermarks = [
  {
    value: min_duration,
    label: `${min_duration} yrs`,
  },
  {
    value: max_duration,
    label: `${max_duration} yrs`,
  },
];
function slidervaluetext(value) {
  return `${value} years`;
}
const default_duration = min_duration;
const default_inflationrate = "2.3";
const default_locale = '';
const default_sector = '';
const default_startdate = '';
const default_carbonprice = '';
const default_result = NaN;

const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 120,
    },
    '& .MuiInput-root': {
      width: 120,
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(0, 1.5px) scale(0.9)',
    },
    '& .MuiSlider-root': {
      width: 100,
    },
    '.green': {
      color: 'green',
    },
    '.red': {
      color: 'red',
    },
    '.result': {
      color: 'purple',
      fontWeight: 'bold',
      fontSize: '1.5em',
    },
  },
  percent: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 64,
    },
    '& .MuiInput-root': {
      width: 64,
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(0, 1.5px) scale(0.9)',
    },
  },
  result: {
    '& .MuiTextField-result': {
      width: 250,
    },
    '& .MuiFilledInput-input': {
      color: 'darkviolet',
      backgroundColor: 'yellow',
      fontWeight: 'bold',
      fontSize: '2.0em',
      width: 250,
    },
    '& .MuiFormControl-result': {
      width: 250,
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(0, 1.5px) scale(0.9)',
    },
    'fieldset': {
      backgroundColor: 'green',
    },
  }
}));

// results of carbon pricing calculations
var carbonC = new Array(yearsIn);
var carbonNG = new Array(yearsIn);
var carbonE = new Array(yearsIn);
var carbonR = new Array(yearsIn);
var carbonD = new Array(yearsIn);

// encostReducer is a vastly simplified reducer that just returns the new state,
// because we only set state once after the file is loaded - there are no
// incremental updates.
function encostReducer(state, updateArg) {
  return { ...state, ...updateArg };
}

//
// Move previously inline functions outside of the component, and pass
// state values as parameters...
//

const stateToRegion = state => {
  switch(state) {
    //case unselected:
    case "":
    case null:
      return("undefined");
    case "ME": case "NH": case "VT": case "MA": case "RI": case "CT": case "NY": case "NJ": case "PA":
      return("NorthEast");
    case "DE": case "MD": case "DC": case "VA": case "WV": case "NC": case "SC": case "GA": case "FL": case "KY": case "TN": case "AL": case "MS": case "AR": case "LA": case "OK": case "TX":
      return("South");
    case "OH": case "MI": case "IN": case "WI": case "IL": case "MO": case "IA": case "MN": case "ND": case "SD": case "NE": case "KS":
      return("MidWest");
    default:
      return("West");
  }
};

const addPrices = (prices, carbon, carbonprice) => {
  //console.log("entering addPrices: %o += %o", prices, carbon);
  // add EIA prices and carbon prices and store is prices array
  if (carbonprice !== '') {  // default, low, or high carbon price
    for(let i=0; i<yearsIn; i++) {
      prices[i] = prices[i] + carbon[i];
    }
  }
  //console.log("exiting addPrices with prices=%o", prices);
}

const calculateC = (start, end, prices) => {  // added by asr 8-14-09; modified by asr 6-5-11
  //console.log("entering calculateC startidx=%d endidx=%d prices=%o", start, end, prices);
  // method calculates indices for years in contract and sums to get C; to calculate C, we are assuming A = $1.00
  let C = 0.0;
  for ( let i = start; i <= end; i++) {
    C += prices[i]/prices[0];
  }   // calculate index and add to C
  //console.log("exiting calculateC %f", C);
  return C;
}

const compareStartEnd = (start, end, prices) => {  // added by asr 8-14-09; changed 6-5-11, instead of testing for terminal index >= 1, now testing if start date's index < end year's index
  // this method reports if start date's index < end date's index
  //console.log("compareStartEnd: %d %d %o", start, end, prices);
  let r = (prices[start] < prices[end]);
  //console.log("compareStartEnd returns %s", r);
  return r;
}

const solveForAnnualAverageRate = (computedC, compareYearIndex, duration) => {  // added by asr 8-15-09; modified by asr 6-5-11 to use start date's index < end date's index and
  // used modified UCA formula
  // using modified UCA formula, this method iteratively solves for the annual average rate (real)
  //console.log("entering solveForAnnualAverageRate: computedC=%f cmpYrIdx=%s duration=%d", computedC, compareYearIndex, duration);
  let eAvg = 0.0;
  let previousEAvg = 0.0;
  let estC = 0.0;
  let diff = 0.0;
  let previousDiff = 0.0;
  let diffNeg = false;
  let previousDiffNeg = false;
  let signChanged = false;
  let bump = 0.0;

  if (compareYearIndex) {
    eAvg = 0.02;     // 1st guess
  } else {
    // if start date's index > end year's index, need different initial setting for eAvg to
    // account for possibility of negative eAvg results
    eAvg = -0.01;
  }
  //console.log("Initial eAvg=%f", eAvg);
  // 11-6-11 asr now using modified UCA formula; when first making this change in June 2011, I only updated the formula in the while loop, I forgot it here
  //	previous UCA formula:   estC = ((Math.pow((1 + eAvg), Contract))-1)/eAvg;  // estimated C
  estC = ((Math.pow((1 + eAvg), (duration+1))  - (1+eAvg))) /eAvg;  // estimated C
  //console.log("initial estC=%f", estC);
  diff = (estC - computedC);
  //console.log("initial diff=%f", diff);
  diffNeg = (diff < 0);                 // is the difference between estimated C and computed C negative?

  // set bump value
  // if start date's index > end date's index, need different initial setting for Iteration Bump
  if (diffNeg) {                        // the difference from actual C is negative
    if (compareYearIndex) {
      bump = .25;
    } else {
      bump = -.25;
    }
  } else {                              // the difference from actual C is positive
    if (compareYearIndex) {
      bump = -.25;
    } else {
      bump = .25;
    }
  }
  //console.log("bump=%f", bump);

  while (!signChanged) {                // repeat until difference changes sign
    // move values to "previous" variables
    previousEAvg = eAvg;
    previousDiff = diff;
    previousDiffNeg = diffNeg;

    eAvg = previousEAvg * (1+bump);      // eAvg
    // 6-19-11 asr now using modified UCA formula
    //	previous UCA formula:   estC = ((Math.pow((1 + eAvg), Contract))-1)/eAvg;  // estimated C
    estC = ((Math.pow((1 + eAvg), (duration+1))  - (1+eAvg))) /eAvg;  // estimated C
    diff = (estC - computedC);           // difference from actual C
    diffNeg = (diff < 0);                // is difference negative?
    //console.log("Iterate: eAvg=%f ; previousEAvg=%f ; diff=%f ; previousDiff=%f", eAvg, previousEAvg, diff, previousDiff);

    signChanged = (diffNeg !== previousDiffNeg);  // difference changed sign?
  }
  //console.log("Final: eAvg=%f ; previousEAvg=%f ; diff=%f ; previousDiff=%f", eAvg, previousEAvg, diff, previousDiff);

  // when difference changes sign, interpolate for a close approximation to eAvg; this is the annual average rate (real)
  let r = (eAvg + (Math.abs(diff)/(Math.abs(previousDiff)+Math.abs(diff))) * (previousEAvg - eAvg));
  //console.log("solveForAnnualAverageRate returns %f", r);
  return r;
}

export default function EercForm() {
  const classes = useStyles();
  const [locale, setLocale] = React.useState(default_locale);
  const [pecs, setPecs] = React.useState({
    coal: "0",
    distillateoil: "0",
    electricity: "0",
    naturalgas: "0",
    residual: "0",
  });
  const [sector, setSector] = useState(default_sector);
  const [startdate, setStartdate] = useState(default_startdate); // TODO compute this!
  const [duration, setDuration] = useState(default_duration);
  const [carbonprice, setCarbonprice] = useState(default_carbonprice);
  const [inflationrate, setInflationrate] = useState(default_inflationrate);
  const [result_real, set_Result_Real] = useState(default_result);
  const [result_nominal, set_Result_Nominal] = useState(default_result);
  const [warnings, set_Warnings] = useState([]);

  const [CO2Factors, setCO2Factors] = useState({});
  const [CO2ePrices, setCO2ePrices] = useState({});
  const [CO2FutureEmissions, setCO2FutureEmissions] = useState({});
  const [Encost, updateEncost] = useReducer(encostReducer, {});
  const [ZipToState, setZipToState] = useState({});
  const [startdates, setStartdates] = useState([]);
  //const [valid, setValid] = useState(false);

  if (CO2ePrices.startyear) {
    if (startdates.length === 0 || CO2ePrices.startyear !== startdates[0]) {
      let a = [];
      for (let i = 0; i < (CO2ePrices.endyear - CO2ePrices.startyear - max_duration - 1); i++) {
        a.push(parseInt(CO2ePrices.startyear) + i);
      }
      setStartdates(a);
    }
  }

  let pecsTotal = parseFloat(pecs.coal) + parseFloat(pecs.distillateoil) + parseFloat(pecs.electricity) + parseFloat(pecs.naturalgas) + parseFloat(pecs.residual);

  async function loadDatafiles() {
    //console.log("loadDatafiles() called");

    setCO2Factors(await (await fetch(CO2FactorsURL)).json());
    setCO2ePrices(await (await fetch(CO2ePricesURL)).json());
    setCO2FutureEmissions(await (await fetch(CO2FutureEmissionsURL)).json());
    updateEncost(await (await fetch(EncostURL)).json());
    setZipToState(await (await fetch(ZipToStateURL)).json());
    // SWB: validation inline here doesn't work; the value isn't yet set in this render?
  }

  // This asynchronously loads the data files on page load
  useEffect(() => {
    loadDatafiles();
  }, []);

  const handleLocaleChange = event => {
    let v = event.target.value; //.replace(nonnumeric_re, '');
    //event.target.value = v;
    setLocale(v);
  };

  const handleSectorChange = event => {
    setSector(event.target.value);
  };

  const handlePecsChange = prop => event => {
    let v = event.target.value.replace(nonnumeric_re, '').replace(clean_re, '$1').replace(trim0_re, '$<neg>$<num>').replace(needlead0_re, '$<neg>0.').replace(empty_re, '0');
    event.target.value = v;
    setPecs({ ...pecs, [prop]: v });
  };

  const handleStartdateChange = event => {
    setStartdate(event.target.value);
  };

  const handleDurationChange = (event, value) => {
    setDuration(value);
  };

  const handleCarbonpriceChange = event => {
    let k = event.target.value;
    setCarbonprice(k);
  };

  const handleInflationrateChange = event => {
    let v = event.target.value.replace(nonpercent_re, '').replace(pctclean_re, '$1').replace(trim0_re, '$<neg>$<num>').replace(needlead0_re, '$<neg>0.').replace(empty_re, '0');
    event.target.value = v;
    setInflationrate(v);
  };

  const calculateCarbonPrice = useCallback((CO2Factor, cP, isElectricity, baseyear) => {
    //console.log("calculateCarbonPrice: isElec=%o baseyear=%d CO2Factor=%o cP=%o CO2ePrices[%s]=%o", isElectricity, baseyear, CO2Factor, cP, carbonprice, CO2ePrices[carbonprice]);
    if (carbonprice !== '') {  // default, low, or high carbon price
      if (carbonprices[carbonprice] !== zero_carbon_price_policy) {
        for (let i=0; i<yearsIn; i++) {
          cP[i] = CO2ePrices[carbonprices[carbonprice]][i + baseyear] * CO2Factor;
        }  // steps 1 & 2 from Excel file
        if (isElectricity) {
          for (let i=0; i<yearsIn; i++) {
            cP[i] = cP[i] * CO2FutureEmissions[carbonprices[carbonprice]][i + baseyear];
          }
        }  // step 3
        for (let i=0; i<yearsIn; i++) {
          cP[i] = cP[i] * carbonConvert;
        }  // step 4
      }
    }
    //console.log("exiting calculateCarbonPrice");
  }, [carbonprice, CO2ePrices, CO2FutureEmissions]);

  // This is an attempt to avoid delayed updates because of state change queuing by
  // calling validate every time one of the state variables changes
  useEffect(() => {
    const CW=parseFloat(pecs.coal);
    const DW=parseFloat(pecs.distillateoil);
    const EW=parseFloat(pecs.electricity);
    const NGW=parseFloat(pecs.naturalgas);
    const RW=parseFloat(pecs.residual);
    const pt = CW+DW+EW+NGW+RW; // total of energy percentages

    const v = (
        (pt === 100) &&
        /* (ZipToState.hasOwnProperty(locale)) && */
        CO2Factors.hasOwnProperty(locale) &&
        sectors.includes(sector) &&
        (startdates.includes(parseInt(startdate))) &&
        (duration >= min_duration && duration <= max_duration) &&
        (carbonprice !== '' && Object.keys(carbonprices).includes(carbonprice)) &&
        (!isNaN(parseFloat(inflationrate)))
    );
    if (v) {
      //console.log("effect validated %o (sum %f%%, locale %s, start %s, dur %s, cp %s, infl %s => %f)", v, pt, locale, startdate, duration, carbonprice, inflationrate, parseFloat(inflationrate));
      //console.log("entering useEffect-CalculateRate with CW=%f DW=%f EW=%f NGW=%f RW=%f", CW, DW, EW, NGW, RW);

      let escalationRate = NaN;
      let nomRate = NaN;
      // prices used to calculate rate (EIA data plus carbon)
      let pricesC = new Array(yearsIn);   // TODO: I thinj this is supposed to be Encost data?
      let pricesNG = new Array(yearsIn);
      let pricesE = new Array(yearsIn);
      let pricesR = new Array(yearsIn);
      let pricesD = new Array(yearsIn);
      // value of C
      let cC = 0;
      let cNG = 0;
      let cE = 0;
      let cR = 0;
      let cD = 0;
      // changed by asr 6-5-11; is start date's index < end date's index?
      let compareIndicesC = false;
      let compareIndicesNG = false;
      let compareIndicesE = false;
      let compareIndicesR = false;
      let compareIndicesD = false;

      let rateC = 0.0;
      let rateNG = 0.0;
      let rateE = 0.0;
      let rateR = 0.0;
      let rateD = 0.0;

      let date_start = parseInt(startdate);
      //let date_end = date_start + parseInt(duration) - 1; // modified by asr 6-5-11:  range of indexes to add in order to calculate C ends one year after the performance period end year
                            // so study period = (end year-start year)+1
      //console.log("date_start: %s (%d)  date_end: %s (%d)  duration: %s (%d)", date_start, date_start, date_end, date_end, duration, duration);

      let region = stateToRegion(/*ZipToState[locale]*/ locale) + " " + sector;
      let baseyearC = null;
      let baseyearNG = null;
      let baseyearE = null;
      let baseyearR = null;
      let baseyearD = null;
      let hasC = true;
      let hasNG = true;
      let hasE = true;
      let hasR = true;
      let hasD = true;
      let w = [];
      try { baseyearC =  parseInt(Object.keys(Encost[region]["Coal"]).sort()[0]);           } catch(e) { hasC = false; };
      try { baseyearNG = parseInt(Object.keys(Encost[region]["Natural Gas"]).sort()[0]);    } catch(e) { hasNG = false; };
      try { baseyearE =  parseInt(Object.keys(Encost[region]["Electricity"]).sort()[0]);    } catch(e) { hasE = false; };
      try { baseyearR =  parseInt(Object.keys(Encost[region]["Residual Oil"]).sort()[0]);   } catch(e) { hasR = false; };
      try { baseyearD =  parseInt(Object.keys(Encost[region]["Distillate Oil"]).sort()[0]); } catch(e) { hasD = false; };
      // set baseyear to be the consensus non-zero baseyear, if it exists
      let a = [baseyearC, baseyearNG, baseyearE, baseyearR, baseyearD].filter(v => (v !== null));
      //console.log("non-zero baseyears: %o", a);
      if ([...new Set(a)].length !== 1) { // use Set to remove duplicates from array
        w.push(`Data file may be corrupt: unable to determine a consensus base year for data!`);
      }

      //console.log("Region: %s", region);
      for (let i = 0 ; i < yearsIn; i++) {
        carbonC[i] =  0.0;
        carbonNG[i] = 0.0;
        carbonE[i] =  0.0;
        carbonR[i] =  0.0;
        carbonD[i] =  0.0;
        try { pricesC[i] =  Encost[region]["Coal"][i + baseyearC]; } catch(e) { pricesC[i] = 1; };
        try { pricesNG[i] = Encost[region]["Natural Gas"][i + baseyearNG]; } catch(e) { pricesNG[i] = 1; };
        try { pricesE[i] =  Encost[region]["Electricity"][i + baseyearE]; } catch(e) { pricesE[i] = 1; };
        try { pricesR[i] =  Encost[region]["Residual Oil"][i + baseyearR]; } catch(e) { pricesR[i] = 1; };
        try { pricesD[i] =  Encost[region]["Distillate Oil"][i + baseyearD]; } catch(e) { pricesD[i] = 1; };
      }
      let uses_missing_data = false;
      if ( CW>0 ) {                        // coal
        if (hasC) {
          calculateCarbonPrice(CO2Factors["Coal"], carbonC, false, baseyearC);
          addPrices(pricesC, carbonC, carbonprices[carbonprice]);
          let index_start = date_start - baseyearC + 1;
          let index_end = index_start + duration - 1;
          cC  = calculateC(index_start, index_end, pricesC);
          compareIndicesC = compareStartEnd(index_start, index_end, pricesC);
          rateC = solveForAnnualAverageRate(cC, compareIndicesC, duration);
        } else {
          w.push(`Coal data is not available for the ${region} region`);
          uses_missing_data = true;
        }
      }
      if ( NGW>0 ) {                       // natural gas
        if (hasNG) {
          calculateCarbonPrice(CO2Factors["NatGas"], carbonNG, false, baseyearNG);
          addPrices(pricesNG, carbonNG, carbonprices[carbonprice]);
          let index_start = date_start - baseyearNG + 1;
          let index_end = index_start + duration - 1;
          cNG = calculateC(index_start, index_end, pricesNG);
          compareIndicesNG = compareStartEnd(index_start, index_end, pricesNG);
          rateNG = solveForAnnualAverageRate(cNG, compareIndicesNG, duration);
        } else {
          w.push(`Natural Gas data is not available for the ${region} region`);
          uses_missing_data = true;
        }
      }
      if ( EW>0 ) {                       // electricity
        if (hasE) {
          calculateCarbonPrice(CO2Factors[/*ZipToState[locale]*/ locale], carbonE, true, baseyearE);
          addPrices(pricesE, carbonE, carbonprices[carbonprice]);
          let index_start = date_start - baseyearE + 1;
          let index_end = index_start + duration - 1;
          cE  = calculateC(index_start, index_end, pricesE);
          compareIndicesE = compareStartEnd(index_start, index_end, pricesE);
          rateE = solveForAnnualAverageRate(cE, compareIndicesE, duration);
        } else {
          w.push(`Electricity data is not available for the ${region} region`);
          uses_missing_data = true;
        }
      }
      if ( RW>0 ) {                       // residual oil
        if (hasR) {
          calculateCarbonPrice(CO2Factors["ResidOil"], carbonR, false, baseyearR);
          addPrices(pricesR, carbonR, carbonprices[carbonprice]);
          let index_start = date_start - baseyearR + 1;
          let index_end = index_start + duration - 1;
          cR  = calculateC(index_start, index_end, pricesR);
          compareIndicesR = compareStartEnd(index_start, index_end, pricesR);
          rateR = solveForAnnualAverageRate(cR, compareIndicesR, duration);
        } else {
          w.push(`Residual Oil data is not available for the ${region} region`);
          uses_missing_data = true;
        }
      }
      if ( DW>0 ) {                       // distillate oil
        if (hasD) {
          calculateCarbonPrice(CO2Factors["DistOil"], carbonD, false, baseyearD);
          addPrices(pricesD, carbonD, carbonprices[carbonprice]);
          let index_start = date_start - baseyearD + 1;
          let index_end = index_start + duration - 1;
          cD  = calculateC(index_start, index_end, pricesD);
          compareIndicesD = compareStartEnd(index_start, index_end, pricesD);
          rateD = solveForAnnualAverageRate(cD, compareIndicesD, duration);
        } else {
          w.push(`Distillate Oil data is not available for the ${region} region`);
          uses_missing_data = true;
        }
      }

      //console.log("rateC=%f rateD=%f rateE=%f rateR=%f rateNG=%f", rateC, rateD, rateE, rateR, rateNG);
      escalationRate = (CW*rateC)+(DW*rateD)+(EW*rateE)+(RW*rateR)+(NGW*rateNG);  // blended rate
      nomRate = ((1+(escalationRate/100))*(1+(parseFloat(inflationrate)/100)))-1;
      nomRate = nomRate*100;
      //console.log("Escalation rate = %f", escalationRate);
      //console.log("Nominal rate = %f", nomRate);

      if (uses_missing_data) {
        escalationRate = NaN;
        nomRate = NaN;
      }

      set_Result_Real(escalationRate);
      set_Result_Nominal(nomRate);
      set_Warnings(w);
      //console.log("exiting useEffect-CalculateRate");
    } else {
      set_Result_Real(NaN);
      set_Result_Nominal(NaN);
      set_Warnings([]);
    }
  }, [ZipToState, CO2Factors, Encost, calculateCarbonPrice, locale, pecs, sector, startdate, startdates, duration, carbonprice, inflationrate]);

  const handlePDF = (e) => {
    //SWB const input = document.getElementById('PrintMe');
    const pdf = new jsPDF({
      orientation: "portrait",
      format: 'letter',
      unit: 'in',
      compress: true,
    }).setProperties({title: "NIST Energy Escalation Rate Calculation"});
    const lm = 1.0; // left margin in inches as per constructor options above
    const center = 8.5 / 2;
    const now = new Date();
    pdf.addImage(nistLogo, 'PNG', lm, 0.5); // nistLogo is a base64 data-URL
    let vc = 2.0; // vertical cursor in inches
    pdf.setTextColor(0,0,0).setFontSize(24).setFont('helvetica','bold').text("NIST Energy Escalation Rate Calculation", center, vc, 'center');
    pdf.setTextColor(0,0,255).setFontSize(12).setFont('courier','normal').text("https://pages.nist.gov/eerc/", center, vc+0.3, 'center');
    vc += 1.25;
    pdf.setTextColor(0,0,0).setFontSize(20).setFont('helvetica','bold').text("Input Parameters:", lm+0.5, vc);
    pdf.setFont('helvetica','normal');
    vc += 0.5;

    for (const et of energytypes) {
      if (pecs[et.slug] > 0) {
        pdf.setTextColor(0,0,0).setFontSize(14).text(`Percent from ${et.name}:`, lm+1, vc);
        pdf.setTextColor(0,0,255).setFontSize(14).text(`${pecs[et.slug]}%`, lm+4, vc);
        vc += 0.2;
      }
    }
    vc += 0.2;
    pdf.setTextColor(0,0,0).setFontSize(14).text("Location:", lm+1, vc);
    pdf.setTextColor(0,0,255).setFontSize(14).text(`${locale} (${stateToRegion(/*ZipToState[locale]*/ locale)})`, lm+4, vc);
    vc += 0.25;
    pdf.setTextColor(0,0,0).setFontSize(14).text("Sector:", lm+1, vc);
    pdf.setTextColor(0,0,255).setFontSize(14).text(sector, lm+4, vc);
    vc += 0.25;
    pdf.setTextColor(0,0,0).setFontSize(14).text("Contract Start:", lm+1, vc);
    pdf.setTextColor(0,0,255).setFontSize(14).text(startdate.toString(), lm+4, vc);
    vc += 0.25;
    pdf.setTextColor(0,0,0).setFontSize(14).text("Contract Duration:", lm+1, vc);
    pdf.setTextColor(0,0,255).setFontSize(14).text(`${duration.toString()} years`, lm+4, vc);
    vc += 0.25;
    pdf.setTextColor(0,0,0).setFontSize(14).text("Carbon Pricing Policy:", lm+1, vc);
    pdf.setTextColor(0,0,255).setFontSize(14).text(carbonprice, lm+4, vc);
    vc += 0.25;
    pdf.setTextColor(0,0,0).setFontSize(14).text("Annual Inflation Rate:", lm+1, vc);
    pdf.setTextColor(0,0,255).setFontSize(14).text(`${parseFloat(inflationrate).toFixed(2)}%`, lm+4, vc);
    vc += 1;
    pdf.setTextColor(0,0,0).setFontSize(20).setFont('helvetica','bold').text("Results:", lm+0.5, vc);
    vc += 0.4;
    pdf.setTextColor(0,0,0).setFontSize(16).text("Real Rate:", lm+1, vc);
    pdf.setTextColor(96,0,172).setFontSize(16).text(`${isNaN(result_real) ? "---" : parseFloat(result_real).toFixed(2)}%`, lm+4, vc);
    vc += 0.4;
    pdf.setTextColor(0,0,0).setFontSize(16).text("Nominal Rate:", lm+1, vc);
    pdf.setTextColor(96,0,172).setFontSize(16).text(`${isNaN(result_nominal) ? "---" : parseFloat(result_nominal).toFixed(2)}%`, lm+4, vc);
    vc += 0.4;
    pdf.setTextColor(0,0,0).setFontSize(16).text("Calculated on:", lm+1, vc);
    pdf.setTextColor(0,0,0).setFontSize(12).setFont('helvetica','normal').text(now.toLocaleString(), lm+4, vc);
    vc += 0.4;
    pdf.setTextColor(0,0,0).setFontSize(16).setFont('helvetica','bold').text("Datafile version:", lm+1, vc);
    pdf.setTextColor(0,0,0).setFontSize(14).setFont('helvetica','normal').text(CO2ePrices.startyear.toString(), lm+4, vc);

    pdf.output('dataurlnewwindow');

    /*
    ***** SWB: html2canvas has some severe limitations making it unusable so
    *****      we'll need to manually render the information in the PDF... ARG.
    pdf.html(input, {
      callback: function(doc) {
        pdf.save("eerc-calc.pdf");
      },
      html2canvas: {
        //windowWidth: 600,
        //width: 600,
        scale: 0.3,
        imageTimeout: 60000,
        useCORS: true,
      },
    });
    */
  };


  var dataset_msg = '';
  if (typeof CO2ePrices.startyear === 'undefined' || CO2ePrices.startyear === 'null') {
    dataset_msg = <Typography variant="h6" color="error" gutterBottom>[Warning: Dataset is not loaded!]</Typography>
  } else {
    dataset_msg = <Typography variant="body2" gutterBottom>(Loaded {CO2ePrices.startyear} dataset)</Typography>
  }

  let warnings_msg = warnings.map((m,i) => {
    return <Alert key={`alert${i}`} severity="warning">{m}</Alert>;
  });

  // we need to filter out just the 2-letter state names from CO2Factors
  const localeOptions = [...new Set(Object.keys(CO2Factors).filter(s => s.length === 2))].sort();

  return (
    <form className={classes.root} noValidate autoComplete="off">
      {dataset_msg}
      <Typography variant="body2" paragraph>To use, complete all form fields. Computed results are shown immedately at the bottom of the page.<br />The EERC User Guide is here:&nbsp;&nbsp;
        <Link target="_blank" rel="noopener" href="EERC User Guide.htm">HTML</Link>&nbsp;&nbsp;<Link target="_blank" rel="noopener" href="EERC User Guide.pdf">PDF</Link>
      </Typography>
      <fieldset className={classes.formControl}>
        <FormLabel component="legend">&nbsp;Percent of Energy Cost Savings&nbsp;</FormLabel>
        <Grid container alignItems="flex-start" justify="center" spacing={3}>
          {energytypes.map((energy, index) => (
            <Grid item xs={4} sm={2} key={'grid'+index}>
              <HtmlTooltip
                arrow
                title={
                  <React.Fragment>
                    {"Percentage of energy cost savings in dollars that is attributable to " + energy.name + " used in the project. This input is used to weight the escalation rate."}
                  </React.Fragment>
                }
              >
                <TextField key={energy.name} className={classes.percent} label={energy.name} value={pecs[energy.slug]} margin="dense"
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  inputProps={{ maxLength: 5, style: { textAlign: 'right' } }}
                  onChange={handlePecsChange(energy.slug)}
                />
              </HtmlTooltip>
            </Grid>
          ))}
          <Grid item xs={12}>
            <TextField
              className={classes.percent}
              helperText={pecsTotal !== 100 ? "Must equal 100%" : ""}
              error={pecsTotal !== 100}
              label="Total"
              disabled
              variant="filled"
              value={pecsTotal}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Fuel Rate Information&nbsp;</FormLabel>
        <Grid container alignItems="flex-start" justify="center" spacing={1}>
          <Grid item xs={6} sm={3}>
            {/* <TextField
              label="Location"
              margin="dense"
              value={locale}
              onChange={handleLocaleChange}
              error={!(ZipToState.hasOwnProperty(locale))}
              helperText={ZipToState.hasOwnProperty(locale)?"":"Enter US ZIP code"}
              InputProps={{
                endAdornment: <InputAdornment position="end"> ({ZipToState[locale]})</InputAdornment>
              }}
            /> */}
            <MySelect
              name="Location"
              options={localeOptions}
              helperText="Select US state"
              value={locale}
              handleChange={handleLocaleChange}
              isError={() => (!(CO2Factors.hasOwnProperty(locale)))}
              tooltip=<React.Fragment>Selecting the ZIP code in which the project is located is needed to select the associated energy price escalation rates (by Census Region) and CO2 pricing and emission rates (currently by State).</React.Fragment>
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MySelect
              name="Sector"
              options={sectors.sort()}
              helperText="Select Sector"
              value={sector}
              handleChange={handleSectorChange}
              isError={() => (!(sectors.includes(sector)))}
              tooltip=<React.Fragment>Selection of commercial sector or industrial sector determines the escalation rate schedule applied to the energy cost calculation.</React.Fragment>
            />
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Contract Term&nbsp;</FormLabel>
        <Grid container alignItems="baseline" justify="center" spacing={6}>
          <Grid item xs={6} sm={3}>
            <MySelect
              name="Start Date"
              options={startdates}
              helperText="Select start date"
              value={startdate}
              handleChange={handleStartdateChange}
              isError={() => (!(startdates.includes(parseInt(startdate))))}
              tooltip=<React.Fragment>Date (year) when energy savings start to accrue, which is usually after project acceptance at the beginning of performance period.</React.Fragment>
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"Number of years of the performance period for which the average escalation rate will be calculated."}
                </React.Fragment>
              }
            >
              <div className={classes.root} align="left">
                <Typography id="discrete-slider-always" align="left" variant="body2" gutterBottom>
                  Years Duration
                </Typography>
                <Slider
                  defaultValue={default_duration}
                  onChangeCommitted={handleDurationChange}
                  min={min_duration}
                  max={max_duration}
                  step={1}
                  marks={slidermarks}
                  getAriaValueText={slidervaluetext}
                  aria-labelledby="discrete-slider-always"
                  valueLabelDisplay="auto"
                />
              </div>
            </HtmlTooltip>
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Carbon Pricing Policy&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={12}>
            <MySelect
              name="Carbon Price"
              options={Object.keys(carbonprices)}
              helperText="Select policy"
              value={carbonprice}
              handleChange={handleCarbonpriceChange}
              isError={() => ((!(Object.keys(carbonprices).includes(carbonprice))) || carbonprice === '')}
              tooltip={
                <React.Fragment>
                  {"Determines the carbon pricing scenario to assume:"}
                  <ul>
                  <li><em>{"No Carbon Price"}</em> {"assumes that no carbon policy is enacted (status quo)"}</li>
                  <li><em>{"Medium"}</em> {"assumes carbon prices based on implementation from recent climate change bill (American Clean Energy and Security Act of 2009: H.R. 2454) is enacted"}</li>
                  <li><em>{"Low"}</em> {"assumes a carbon policy is implemented that is less restrictive than the Medium policy option on offsets and low carbon energy sources"}</li>
                  <li><em>{"High"}</em> {"assumes significant restrictions relative to the Medium policy option on offsets and low carbon energy sources"}</li>
                  </ul>
                </React.Fragment>
              }
            />
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Annual Inflation Rate&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" spacing={1}>
          <Grid item xs={12}>
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"The general rate of inflation for the nominal discount rate calculation. The default rate of inflation is the long-term inflation rate calculated annually by DOE/FEMP using the method described in 10 CFR 436 without consideration of the 3.0 % floor for the real discount rate."}
                </React.Fragment>
              }
            >
              <TextField value={inflationrate}
                className={classes.percent}
                InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
                inputProps={{ maxLength: 5, style: { textAlign: 'right' } }}
                onChange={handleInflationrateChange}
              />
            </HtmlTooltip>
          </Grid>
        </Grid>
      </fieldset><br />
      {warnings_msg.length ? <div><fieldset style={{ border: "6px groove", borderColor: "red" }}>{warnings_msg}</fieldset><br /></div> : null}
      <fieldset style={{ border: "6px groove", borderColor: "black" }}>
        <FormLabel component="legend">&nbsp;Annual Energy Escalation Rate&nbsp;</FormLabel>
        <FormLabel component="legend">RESULTS</FormLabel><br />
        <Grid container alignItems="center" justify="center" spacing={3} style={{backgroundColor:"lightgrey"}}>
          <Grid item xs={12} sm={6}>
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"The calculated average escalation rate in real terms (excluding the rate of inflation). Estimated using the energy prices for the sector, fuel mix, and location."}
                </React.Fragment>
              }
            >
              <TextField
                className={classes.result}
                helperText={isNaN(result_real) ? "Fix selections" : ""}
                error={isNaN(result_real)}
                label="REAL"
                disabled
                variant="filled"
                style={{ width: 180 }}
                inputProps={{ style: { textAlign: 'right' } }}
                InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
                value={isNaN(result_real) ? "---" : parseFloat(result_real).toFixed(2)}
              />
            </HtmlTooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"The calculated average escalation rate in nominal terms (including the rate of inflation).  Calculated using the real escalation rate and input inflation rate."}
                </React.Fragment>
              }
            >
              <TextField
                className={classes.result}
                helperText={isNaN(result_nominal) ? "Fix selections" : ""}
                error={isNaN(result_nominal)}
                label="NOMINAL"
                disabled
                variant="filled"
                style={{ width: 180 }}
                inputProps={{ style: { textAlign: 'right' } }}
                InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
                value={isNaN(result_nominal) ? "---" : parseFloat(result_nominal).toFixed(2)}
              />
            </HtmlTooltip>
          </Grid>
          <Grid item xs={12} data-html2canvas-ignore="true">
            <div style={{
              margin: 'auto',
              width: 200,
            }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handlePDF}
              >
                Save to PDF
              </Button>
            </div>
          </Grid>
        </Grid>
      </fieldset>
      <br />
    </form>
  );
}
