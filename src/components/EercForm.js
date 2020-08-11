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

import React, { useEffect, useState, useReducer } from 'react';
//import { createStateLink, useStateLink } from '@hookstate/core';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
//import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
//import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
//import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Grid from '@material-ui/core/Grid';
//import Box from '@material-ui/core/Box';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
//import { set, has } from 'lodash';

//import '../EercCalc.js';
////////////////////////////////////////////////////////////////////////////////
const CO2ePricesURL = 'CO2ePrices.json';
const CO2FactorsURL = 'CO2Factors.txt';
const CO2FutureEmissionsURL = 'CO2FutureEmissions.json';
const EncostURL = 'Encost.json';
const ZipToStateURL = 'zipcodetostate.json';
const yearsIn = 31;  // number of years being read in
const carbonConvert = 0.912130;    // factor used to convert results from 2019$/GJ to 2012$/Mbtu; see Step 4 in EERC Calculations Excel file

////////////////////////////////////////////////////////////////////////////////

const unselected = '--';
//const valid_re = /^((\d+\.?\d*)|(\d*\.\d+))$/;
const clean_re = /^\s*(\d*\.?\d*).*$/; // if match replace with $1
const needlead0_re = /^\./;
const trim0_re = /^0*(\d+)0*$/;
const nonnumeric_re = /[^\d.]/g;
const empty_re = /^\s*$/g;

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

//const locales = [
//  unselected, "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
//  "HI","IA", "ID", "IL","IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI",
//  "MN", "MO", "MS", "MT", "NC","ND","NE", "NH", "NJ", "NM", "NV", "NY",
//  "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT",
//  "WA", "WI", "WV", "WY"
//];

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
const default_duration = min_duration;
const default_inflationrate = "2.2";
const default_locale = '';
const default_sector = sectors[0];
const default_startdate = unselected;
const default_carbonprice = unselected;
const default_result = NaN;

const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 150,
    },
    '& .MuiInput-root': {
      width: 150,
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
    }
  },
  result: {
    '& .MuiFilledInput-input': {
      width: 200,
      color: 'darkviolet',
      backgroundColor: 'yellow',
      fontWeight: 'bold',
      fontSize: '2.0em',
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
  const [CO2Factors, setCO2Factors] = useState({});
  const [CO2ePrices, setCO2ePrices] = useState({});
  const [CO2FutureEmissions, setCO2FutureEmissions] = useState({});
  const [Encost, updateEncost] = useReducer(encostReducer, {});
  const [ZipToState, setZipToState] = useState({});
  //const [valid, setValid] = useState(false);

  let pecsTotal = parseFloat(pecs.coal) + parseFloat(pecs.distillateoil) + parseFloat(pecs.electricity) + parseFloat(pecs.naturalgas) + parseFloat(pecs.residual);

  async function loadDatafiles() {
    const co2factorsresponse = await fetch(CO2FactorsURL);
    const co2factorstxt = await co2factorsresponse.text();
    setCO2Factors(co2factorstxt.split('\n').reduce((accum, l) => {
      let m = l.match(/^\s*(\S+)\s+(\S.*)\s*$/);
      if (m) {
        accum[m[1]] = m[2];
      }
      return accum;
    }, {} ));

    setCO2ePrices(await (await fetch(CO2ePricesURL)).json());
    // if (CO2ePrices['startyear'] === 0 ||
    //     !('Default' in CO2ePrices) ||
    //     !('Low' in CO2ePrices) ||
    //     !('High' in CO2ePrices) ) {
    //   console.log("ERROR: Parse of " + CO2ePricesURL + " failed!");
    //   console.log("CO2ePrices = " + JSON.stringify(CO2ePrices));
    //   alert("ERROR: Parse of " + CO2ePricesURL + " failed!");
    // }

    setCO2FutureEmissions(await (await fetch(CO2FutureEmissionsURL)).json());
    updateEncost(await (await fetch(EncostURL)).json());
    setZipToState(await (await fetch(ZipToStateURL)).json());
  }

  // This asynchronously loads the data files on page load
  useEffect(() => {
    loadDatafiles();
  }, []);

  const handleLocaleChange = event => {
    setLocale(event.target.value);
    //validate();
  };

  const handlePecsChange = prop => event => {
    let v = event.target.value.replace(nonnumeric_re, '').replace(clean_re, '$1').replace(trim0_re, '$1').replace(needlead0_re, '0.').replace(empty_re, '0');
    event.target.value = v;
    setPecs({ ...pecs, [prop]: v });
    ////setPecsTotal(parseFloat(pecs.coal) + parseFloat(pecs.distillateoil) + parseFloat(pecs.electricity) + parseFloat(pecs.naturalgas) + parseFloat(pecs.residual));
    //validate();
  };

  const handleSectorChange = event => {
    setSector(event.target.value);
    //validate();
  };

  const handleStartdateChange = event => {
    setStartdate(event.target.value);
    //validate();
  };

  const handleDurationChange = (event, value) => {
    setDuration(value);
    //validate();
  };

  const handleCarbonpriceChange = event => {
    setCarbonprice(event.target.value);
    //validate();
  };

  const handleInflationrateChange = event => {
    let v = event.target.value.replace(nonnumeric_re, '').replace(clean_re, '$1').replace(trim0_re, '$1').replace(needlead0_re, '0.').replace(empty_re, '0');
    event.target.value = v;
    setInflationrate(v);
    //validate();
  };

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

  //const validate = () => {
  //  let v = (
  //      (pecsTotal === 100) &&
  //      (ZipToState.hasOwnProperty(locale)) &&
  //      (startdate !== unselected) &&
  //      (carbonprice !== unselected) &&
  //      (!isNaN(parseFloat(inflationrate)))
  //  );
  //  console.log("validate: %o (%f, %s, %s, %s, %s, %s, %s, %f)", v, pecsTotal, locale, ZipToState[locale], startdate, duration, carbonprice, inflationrate, parseFloat(inflationrate));
  //  //setValid(v);
  //  if (v) {
  //    CalculateRate();
  //  } else {
  //    set_Result_Real(NaN);
  //    set_Result_Nominal(NaN);
  //  }
  //  return(v);
  //};

  //const valid = (
  //  (pecsTotal === 100) &&
  //  (ZipToState.hasOwnProperty(locale)) &&
  //  (startdate !== unselected) &&
  //  (carbonprice !== unselected) &&
  //  (!isNaN(parseFloat(inflationrate)))
  //);

  const CalculateRate = () => {
    console.log("entering CalculateRate");
    let CW=pecs["coal"];
    let DW=pecs["distillateoil"];
    let EW=pecs["electricity"];
    let NGW=pecs["naturalgas"];
    let RW=pecs["residual"];
    //let total = 0;
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

    //let hold = 0;
    //let start = startdate;  // modified by asr 6-5-11:  range of indexes to add in order to calculate C begins one year after the performance period starts
    let rateC = 0.0;
    let rateNG = 0.0;
    let rateE = 0.0;
    let rateR = 0.0;
    let rateD = 0.0;

    let date_start = parseInt(startdate);
    let date_end = date_start + parseInt(duration) - 1; // modified by asr 6-5-11:  range of indexes to add in order to calculate C ends one year after the performance period end year
                          // so study period = (end year-start year)+1
    console.log("date_start: %s (%d)  date_end: %s (%d)  duration: %s (%d)", date_start, date_start, date_end, date_end, duration, duration);

    let category = stateToRegion(ZipToState[locale]) + " " + sector;
    let baseyearC = parseInt(Object.keys(Encost[category]["Coal"]).sort()[0]);
    let baseyearNG = parseInt(Object.keys(Encost[category]["Natural Gas"]).sort()[0]);
    let baseyearE = parseInt(Object.keys(Encost[category]["Electricity"]).sort()[0]);
    let baseyearR = parseInt(Object.keys(Encost[category]["Residual Oil"]).sort()[0]);
    let baseyearD = parseInt(Object.keys(Encost[category]["Distillate Oil"]).sort()[0]);
    if (!(baseyearC > 0 && baseyearC === baseyearNG && baseyearC === baseyearE && baseyearC === baseyearR && baseyearC === baseyearD)) {
      console.log("WARNING: baseyear mismatch: C:%s NG:%s E:%s R:%s D:%s", baseyearC, baseyearNG, baseyearE, baseyearR, baseyearD);
    }

    console.log("Category: %s", category);
    for (let i = 0 ; i < yearsIn; i++) {
      carbonC[i] = 0.0;
      carbonNG[i] = 0.0;
      carbonE[i] = 0.0;
      carbonR[i] = 0.0;
      carbonD[i] = 0.0;
      pricesC[i] = Encost[category]["Coal"][i + baseyearC];
      pricesNG[i] = Encost[category]["Natural Gas"][i + baseyearNG];
      pricesE[i] = Encost[category]["Electricity"][i + baseyearE];
      pricesR[i] = Encost[category]["Residual Oil"][i + baseyearR];
      pricesD[i] = Encost[category]["Distillate Oil"][i + baseyearD];
    }

    if ( CW>0 ) {                        // coal
      calculateCarbonPrice(CO2Factors["Coal"], carbonC, false, baseyearC);
      addPrices(pricesC, carbonC);
      let index_start = date_start - baseyearC;
      let index_end = date_end - baseyearC;
      cC  = calculateC(index_start, index_end, pricesC);
      compareIndicesC = compareStartEnd(date_start, date_end, pricesC);
      rateC = solveForAnnualAverageRate(cC, compareIndicesC);
    }
    if ( NGW>0 ){                       // natural gas
      calculateCarbonPrice(CO2Factors["NatGas"], carbonNG, false, baseyearNG);
      addPrices(pricesNG, carbonNG);
      let index_start = date_start - baseyearNG;
      let index_end = date_end - baseyearNG;
      cNG = calculateC(index_start, index_end, pricesNG);
      compareIndicesNG = compareStartEnd(date_start, date_end, pricesNG);
      rateNG = solveForAnnualAverageRate(cNG, compareIndicesNG);
    }
    if ( EW>0 ) {                       // electricity
      calculateCarbonPrice(CO2Factors[ZipToState[locale]], carbonE, true, baseyearE);
      addPrices(pricesE, carbonE);
      let index_start = date_start - baseyearE;
      let index_end = date_end - baseyearE;
      cE  = calculateC(index_start, index_end, pricesE);
      compareIndicesE = compareStartEnd(date_start, date_end, pricesE);
      rateE = solveForAnnualAverageRate(cE, compareIndicesE);
    }
    if ( RW>0 ) {                       // residual oil
      calculateCarbonPrice(CO2Factors["ResidOil"], carbonR, false, baseyearR);
      addPrices(pricesR, carbonR);
      let index_start = date_start - baseyearR;
      let index_end = date_end - baseyearR;
      cR  = calculateC(index_start, index_end, pricesR);
      compareIndicesR = compareStartEnd(date_start, date_end, pricesR);
      rateR = solveForAnnualAverageRate(cR, compareIndicesR);
    }
    if ( DW>0 ) {                       // distillate oil
      calculateCarbonPrice(CO2Factors["DistOil"], carbonD, false, baseyearD);
      addPrices(pricesD, carbonD);
      let index_start = date_start - baseyearD;
      let index_end = date_end - baseyearD;
      cD  = calculateC(index_start, index_end, pricesD);
      compareIndicesD = compareStartEnd(date_start, date_end, pricesD);
      rateD = solveForAnnualAverageRate(cD, compareIndicesD);
    }

    escalationRate = (CW*rateC)+(DW*rateD)+(EW*rateE)+(RW*rateR)+(NGW*rateNG);  // blended rate
    nomRate=((1+(escalationRate/100))*(1+(parseFloat(inflationrate)/100)))-1;
    nomRate=nomRate*100;
    set_Result_Real(escalationRate);
    set_Result_Nominal(nomRate);
    console.log("exiting CalculateRate");
  }

  const calculateCarbonPrice = (CO2Factor, cP, isElectricity, baseyear) => {
    console.log("calculateCarbonPrice: CO2ePrices[%s]=%o", carbonprice, CO2ePrices[carbonprice]);
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
    console.log("exiting calculateCarbonPrice");
  }

  const addPrices = (prices, carbon) => {
    console.log("entering addPrices: %o += %o", prices, carbon);
    // add EIA prices and carbon prices and store is prices array
    if (carbonprice !== unselected) {  // default, low, or high carbon price
      for(let i=0; i<yearsIn; i++) {
        prices[i] = prices[i] + carbon[i];
      }
    }
    console.log("exiting addPrices");
  }

  const calculateC = (start, end, prices) => {  // added by asr 8-14-09; modified by asr 6-5-11
    console.log("entering calculateC %d %d %o", start, end, prices);
    // method calculates indices for years in contract and sums to get C; to calculate C, we are assuming A = $1.00
    let C = 0.0;
    for ( let i = start; i <= end; i++) {
      C += prices[i]/prices[0];
    }   // calculate index and add to C
    console.log("exiting calculateC %f", C);
    return C;
  }

  const compareStartEnd = (start, end, prices) => {  // added by asr 8-14-09; changed 6-5-11, instead of testing for terminal index >= 1, now testing if start date's index < end year's index
    // this method reports if start date's index < end date's index
    console.log("compareStartEnd: %d %d %o", start, end, prices);
    return (prices[0] < prices[end - start]);
  }

  const solveForAnnualAverageRate = (computedC, compareYearIndex) => {  // added by asr 8-15-09; modified by asr 6-5-11 to use start date's index < end date's index and
    // used modified UCA formula
    // using modified UCA formula, this method iteratively solves for the annual average rate (real)
    console.log("entering solveForAnnualAverageRate: %f %d", computedC, compareYearIndex);
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
      eAvg = .02;     // 1st guess
    } else {
      // if start date's index > end year's index, need different initial setting for eAvg to
      // account for possibility of negative eAvg results
      eAvg = -.01;
    }
    // 11-6-11 asr now using modified UCA formula; when first making this change in June 2011, I only updated the formula in the while loop, I forgot it here
    //	previous UCA formula:   estC = ((Math.pow((1 + eAvg), Contract))-1)/eAvg;  // estimated C
    estC = ((Math.pow((1 + eAvg), (duration+1))  - (1+eAvg))) /eAvg;  // estimated C
    diff = (estC - computedC);

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

      signChanged = (diffNeg !== previousDiffNeg);  // difference changed sign?
    }

    // when difference changes sign, interpolate for a close approximation to eAvg; this is the annual average rate (real)
    console.log("about to exit solveForAnnualAverageRate");
    return (eAvg + (Math.abs(diff)/(Math.abs(previousDiff)+Math.abs(diff))) * (previousEAvg - eAvg));
  }

  // This is an attempt to avoid delayed updates because of state change queuing by
  // calling validate every time one of the state variables changes
  useEffect(() => {
    let pt = parseFloat(pecs.coal) + parseFloat(pecs.distillateoil) + parseFloat(pecs.electricity) + parseFloat(pecs.naturalgas) + parseFloat(pecs.residual);

    let v = (
        (pt === 100) &&
        (ZipToState.hasOwnProperty(locale)) &&
        (startdate !== unselected) &&
        (duration >= min_duration && duration <= max_duration) &&
        (carbonprice !== unselected) &&
        (!isNaN(parseFloat(inflationrate)))
    );
    console.log("effect validate: %o (%f, %s, %s, %s, %s, %s, %f)", v, pt, locale, startdate, duration, carbonprice, inflationrate, parseFloat(inflationrate));
    //setValid(v);
    if (v) {
      CalculateRate();
    } else {
      set_Result_Real(NaN);
      set_Result_Nominal(NaN);
    }
  }, [ZipToState, CalculateRate, result_real, result_nominal, locale, pecs, sector, startdate, duration, carbonprice, inflationrate]);

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <fieldset className={classes.formControl}>
        <FormLabel component="legend">&nbsp;Percent of Energy Cost Savings&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={3}>
            <List dense>
              {energytypes.map((energy, index) => (
                <ListItem key={energy.slug}>
                  <TextField key={energy.name} label={energy.name} value={pecs[energy.slug]} margin="dense"
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    onChange={handlePecsChange(energy.slug)}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={3}>
            <TextField
              helperText={pecsTotal !== 100 ? "Must equal 100%" : ""}
              error={pecsTotal !== 100}
              label="Total"
              disabled
              variant="filled"
              value={pecsTotal}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Fuel Rate Information&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={6}>
            <FormControl border={1} component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Location</FormLabel>
              <TextField
                margin="dense"
                value={locale}
                onChange={handleLocaleChange}
                error={!(ZipToState.hasOwnProperty(locale))}
                helperText={ZipToState.hasOwnProperty(locale)?"":"Enter US ZIP code"}
                InputProps={{
                  endAdornment: <InputAdornment position="end"> ({ZipToState[locale]})</InputAdornment>
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Sector</FormLabel>
              <RadioGroup
                name="sector"
                aria-label="sector"
                value={sector}
                onChange={handleSectorChange}
              >
                {sectors.map(value => (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={<Radio />}
                    label={value}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Contract Term&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={6}>
            <FormControl border={1} component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Start Date</FormLabel>
              <TextField
                margin="dense"
                id="select-startdate"
                select
                value={startdate}
                onChange={handleStartdateChange}
                SelectProps={{
                  native: true,
                }}
                error={startdate===unselected}
                helperText={startdate===unselected?"Select start date":""}
              >
                {startdates.map((option, index) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl border={1} component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Duration</FormLabel>
              <Typography id="discrete-slider-always" gutterBottom>Years</Typography><br /><br />
              <Slider
                defaultValue={default_duration}
                onChangeCommitted={handleDurationChange}
                min={min_duration}
                max={max_duration}
                step={1}
                width={300}
                aria-label="years duration"
                valueLabelDisplay="on"
              />
            </FormControl>
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Carbon Pricing Policy&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={6}>
            <FormControl border={1} component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Carbon Price Policy Options</FormLabel>
              <TextField
                margin="dense"
                id="select-carbonprice"
                select
                value={carbonprice}
                onChange={handleCarbonpriceChange}
                SelectProps={{
                  native: true,
                }}
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
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">&nbsp;Annual Inflation Rate&nbsp;</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={6}>
            <TextField label="Inflation" value={inflationrate}
              InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
              onChange={handleInflationrateChange}
            />
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset style={{ border: "6px groove", borderColor: "black" }}>
        <FormLabel component="legend">&nbsp;Annual Energy Escalation Rate&nbsp;</FormLabel>
        <FormLabel component="legend">RESULTS</FormLabel><br />
        <Grid container alignItems="center" justify="center" direction="row" style={{backgroundColor:"lightgrey"}}>
          <Grid item xs={6}>
            <TextField
              className={classes.result}
              helperText={isNaN(result_real) ? "Fix selections" : ""}
              error={isNaN(result_real)}
              label="REAL"
              disabled
              variant="filled"
              InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
              value={isNaN(result_real) ? "---" : parseFloat(result_real).toFixed(2)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.result}
              helperText={isNaN(result_nominal) ? "Fix selections" : ""}
              error={isNaN(result_nominal)}
              label="NOMINAL"
              disabled
              variant="filled"
              InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
              value={isNaN(result_nominal) ? "---" : parseFloat(result_nominal).toFixed(2)}
            />
          </Grid>
        </Grid>
      </fieldset>
      <br />
    </form>
  );
}
