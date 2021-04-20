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
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Alert from '@material-ui/lab/Alert';

////////////////////////////////////////////////////////////////////////////////
// A tooltip customized to for showing HTML content
const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 280,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

////////////////////////////////////////////////////////////////////////////////
const CO2ePricesURL = 'CO2ePrices.json';
const CO2FactorsURL = 'CO2Factors.json';
const CO2FutureEmissionsURL = 'CO2FutureEmissions.json';
const EncostURL = 'Encost.json';
const ZipToStateURL = 'zipcodetostate.json';
const yearsIn = 31;  // number of years being read in
const carbonConvert = 0.912130;    // factor used to convert results from 2019$/GJ to 2012$/Mbtu; see Step 4 in EERC Calculations Excel file

////////////////////////////////////////////////////////////////////////////////

const unselected = '--';
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

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const numYears = 3;

const energytypes = [
  { slug: "coal", name: "Coal" },
  { slug: "distillateoil", name: "Distillate Oil" },
  { slug: "electricity", name: "Electricity" },
  { slug: "naturalgas", name: "Natural Gas" },
  { slug: "residual", name: "Residual" },
];

const sectors = ["Commercial", "Industrial"];

var startdates = [ unselected ];
for (let i = 1; i <= numYears; i++) {
  //let year = currentYear + i;
  startdates[i] = currentYear + i;  //year.toString();
}

const zero_carbon_price_policy = '__zero__';
const carbonprices = { '--': unselected, 'Medium': 'Default', 'Low': 'Low', 'High': 'High', 'No carbon price': zero_carbon_price_policy};

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
const default_startdate = unselected;
const default_carbonprice = unselected;
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
    case unselected:
    case "":
    case null:
      console.err("stateToRegion cannot map "+state+" to a region");
      return("");
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
  if (carbonprice !== unselected) {  // default, low, or high carbon price
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
  const [localeTooltipOpen, setLocaleTooltipOpen] = useState(false);
  const [sectorTooltipOpen, setSectorTooltipOpen] = useState(false);

  const [CO2Factors, setCO2Factors] = useState({});
  const [CO2ePrices, setCO2ePrices] = useState({});
  const [CO2FutureEmissions, setCO2FutureEmissions] = useState({});
  const [Encost, updateEncost] = useReducer(encostReducer, {});
  const [ZipToState, setZipToState] = useState({});
  //const [valid, setValid] = useState(false);

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

  const handleLocaleTooltip = bool => {
      setLocaleTooltipOpen(bool);
  }

  const handleLocaleChange = event => {
    let v = event.target.value; //.replace(nonnumeric_re, '');
    //event.target.value = v;
    setLocale(v);
    setLocaleTooltipOpen(false);
  };

  const handlePecsChange = prop => event => {
    let v = event.target.value.replace(nonnumeric_re, '').replace(clean_re, '$1').replace(trim0_re, '$<neg>$<num>').replace(needlead0_re, '$<neg>0.').replace(empty_re, '0');
    event.target.value = v;
    setPecs({ ...pecs, [prop]: v });
  };

  const handleSectorTooltip = bool => {
      setSectorTooltipOpen(bool);
  }

  const handleSectorChange = event => {
    setSector(event.target.value);
  };

  const handleStartdateChange = event => {
    setStartdate(event.target.value);
  };

  const handleDurationChange = (event, value) => {
    setDuration(value);
  };

  const handleCarbonpriceChange = event => {
    setCarbonprice(event.target.value);
  };

  const handleInflationrateChange = event => {
    let v = event.target.value.replace(nonpercent_re, '').replace(pctclean_re, '$1').replace(trim0_re, '$<neg>$<num>').replace(needlead0_re, '$<neg>0.').replace(empty_re, '0');
    event.target.value = v;
    setInflationrate(v);
  };

  const calculateCarbonPrice = useCallback((CO2Factor, cP, isElectricity, baseyear) => {
    //console.log("calculateCarbonPrice: isElec=%o baseyear=%d CO2Factor=%o cP=%o CO2ePrices[%s]=%o", isElectricity, baseyear, CO2Factor, cP, carbonprice, CO2ePrices[carbonprice]);
    if (carbonprice !== unselected) {  // default, low, or high carbon price
      if (carbonprice !== zero_carbon_price_policy) {
        for (let i=0; i<yearsIn; i++) {
          cP[i] = CO2ePrices[carbonprice][i + baseyear] * CO2Factor;
        }  // steps 1 & 2 from Excel file
        if (isElectricity) {
          for (let i=0; i<yearsIn; i++) {
            cP[i] = cP[i] * CO2FutureEmissions[carbonprice][i + baseyear];
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
        (startdate !== unselected) &&
        (duration >= min_duration && duration <= max_duration) &&
        (carbonprice !== unselected) &&
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
      let date_end = date_start + parseInt(duration) - 1; // modified by asr 6-5-11:  range of indexes to add in order to calculate C ends one year after the performance period end year
                            // so study period = (end year-start year)+1
      //console.log("date_start: %s (%d)  date_end: %s (%d)  duration: %s (%d)", date_start, date_start, date_end, date_end, duration, duration);

      let region = stateToRegion(ZipToState[locale]) + " " + sector;
      let baseyearC = null;
      let baseyearNG = null;
      let baseyearE = null;
      let baseyearR = null;
      let baseyearD = null;
      let baseyear = null;
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
        w.push(`Data file may be corrupt: unable to determine a concensus base year for data!`);
      } else {
        baseyear = a[0];
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
          addPrices(pricesC, carbonC, carbonprice);
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
          addPrices(pricesNG, carbonNG, carbonprice);
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
          calculateCarbonPrice(CO2Factors[ZipToState[locale]], carbonE, true, baseyearE);
          addPrices(pricesE, carbonE, carbonprice);
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
          addPrices(pricesR, carbonR, carbonprice);
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
          addPrices(pricesD, carbonD, carbonprice);
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
  }, [ZipToState, CO2Factors, Encost, calculateCarbonPrice, locale, pecs, sector, startdate, duration, carbonprice, inflationrate]);

  var dataset_msg = '';
  if (typeof CO2ePrices.startyear === 'undefined' || CO2ePrices.startyear === 'null') {
    dataset_msg = <Typography variant="h6" color="error" gutterBottom>[Warning: Dataset is not loaded!]</Typography>
  } else {
    dataset_msg = <Typography variant="body2" gutterBottom>(Loaded {CO2ePrices.startyear} dataset)</Typography>
  }

  let warnings_msg = warnings.map((m,i) => {
    return <Alert key={`alert${i}`} severity="warning">{m}</Alert>;
  });

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
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"Selecting the ZIP code in which the project is located is needed to select the associated energy price escalation rates (by Census Region) and CO2 pricing and emission rates (currently by State)."}
                </React.Fragment>
              }
              open={localeTooltipOpen}
            >
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
              <FormControl>
                <InputLabel id="location-label" shrink>Location</InputLabel>
                <Select
                  labelId="location-label"
                  margin="dense"
                  value={locale}
                  onChange={handleLocaleChange}
                  error={!(CO2Factors.hasOwnProperty(locale))}
                  onMouseEnter={() => {handleLocaleTooltip(true)}}
                  onMouseLeave={() => {handleLocaleTooltip(false)}}
                  onOpen={() => {handleLocaleTooltip(false)}}
                >
                  {/* filter the 2-letter states from CO2Factors keys */}
                  {[...new Set(Object.keys(CO2Factors).filter(s => s.length === 2))].sort().map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{CO2Factors.hasOwnProperty(locale)?"":"Select US state"}</FormHelperText>
              </FormControl>
            </HtmlTooltip>
          </Grid>
          <Grid item xs={6} sm={3}>
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"Selection of commercial sector or industrial sector determines the escalation rate schedule applied to the energy cost calculation."}
                </React.Fragment>
              }
              open={sectorTooltipOpen}
            >
              <FormControl>
                <InputLabel id="sector-label" shrink>Sector</InputLabel>
                <Select
                  labelId="sector-label"
                  margin="dense"
                  value={sector}
                  onChange={handleSectorChange}
                  error={!sectors.includes(sector)}
                  onMouseEnter={() => {handleSectorTooltip(true)}}
                  onMouseLeave={() => {handleSectorTooltip(false)}}
                  onOpen={() => {handleSectorTooltip(false)}}
                >
                  {sectors.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
                <FormHelperText>{sectors.includes(sector)?"":"Select sector"}</FormHelperText>
              </FormControl>
            </HtmlTooltip>
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Contract Term&nbsp;</FormLabel>
        <Grid container alignItems="baseline" justify="center" spacing={6}>
          <Grid item xs={6} sm={3}>
            <HtmlTooltip
              arrow
              title={
                <React.Fragment>
                  {"Date (year) when energy savings start to accrue, which is usually after project acceptance at the beginning of performance period."}
                </React.Fragment>
              }
            >
              <TextField
                label="Start Date"
                margin="dense"
                id="select-startdate"
                select
                value={startdate}
                SelectProps={{ native: true }}
                onChange={handleStartdateChange}
                error={startdate===unselected}
                helperText={startdate===unselected?"Select start date":""}
              >
                {startdates.map((option, index) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </HtmlTooltip>
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
            <HtmlTooltip
              arrow
              title={
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
            >
              <FormControl border={1} component="fieldset" className={classes.formControl}>
                <TextField
                  margin="dense"
                  id="select-carbonprice"
                  select
                  value={carbonprice}
                  SelectProps={{ native: true }}
                  onChange={handleCarbonpriceChange}
                  error={carbonprice===unselected}
                  helperText={carbonprice===unselected?"Select policy":""}
                >
                  {Object.keys(carbonprices).map((k, index) => (
                    <option key={k} value={carbonprices[k]}>
                      {k}
                    </option>
                  ))}
                </TextField>
              </FormControl>
            </HtmlTooltip>
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
        </Grid>
      </fieldset>
      <br />
    </form>
  );
}
