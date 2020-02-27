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

////////////////////////////////////////////////////////////////////////////////

const unselected = '--';
const valid_re = /^((\d+\.?\d*)|(\d*\.\d+))$/;
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

const locales = [
  unselected, "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
  "HI","IA", "ID", "IL","IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI",
  "MN", "MO", "MS", "MT", "NC","ND","NE", "NH", "NJ", "NM", "NV", "NY",
  "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT",
  "WA", "WI", "WV", "WY"
];

const sectors = ["Commercial", "Industrial"];

var startdates = [ unselected ];
for (let i = 0; i < numYears; i++) {
  //let year = currentYear + i;
  startdates[i+1] = currentYear + i;  //year.toString();
}

const carbonprices = [ unselected, 'None', 'Low', 'Medium', 'High'];

const min_duration = 1;
const max_duration = 25;
const default_duration = min_duration;
const default_inflationrate = "2.2";
const default_locale = unselected;
const default_sector = sectors[0].toLowerCase();
const default_startdate = unselected;
const default_carbonprice = unselected;

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

// encostReducer is a vastly simplified reducer that just returns the new state,
// because we only set state once after the file is loaded - there are no
// incremental updates.
function encostReducer(state, updateArg) {
  return { ...state, ...updateArg };
}

const eercCalculate = () => {
  var Rreal = 0;
  var Rnominal = 1.5;
  return {real: Rreal, nominal: Rnominal};
};


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
  const [CO2Factors, setCO2Factors] = useState({});
  const [CO2ePrices, setCO2ePrices] = useState({});
  const [CO2FutureEmissions, setCO2FutureEmissions] = useState({});
  const [Encost, updateEncost] = useReducer(encostReducer, {});

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
  }

  useEffect(() => {
    loadDatafiles();
  }, []);

  const handleLocaleChange = event => {
    setLocale(event.target.value);
  };

  const handlePecsChange = prop => event => {
    let v = event.target.value.replace(nonnumeric_re, '').replace(clean_re, '$1').replace(trim0_re, '$1').replace(needlead0_re, '0.').replace(empty_re, '0');
    event.target.value = v;
    setPecs({ ...pecs, [prop]: event.target.value });
  };

  const handleSectorChange = event => {
    setSector(event.target.value);
  };

  const handleStartdateChange = event => {
    setStartdate(event.target.value);
  };

  const handleDurationChange = event => {
    setDuration(event.target.value);
  };

  const handleCarbonpriceChange = event => {
    setCarbonprice(event.target.value);
  };

  const handleInflationrateChange = event => {
    let v = event.target.value.replace(nonnumeric_re, '').replace(clean_re, '$1').replace(trim0_re, '$1').replace(needlead0_re, '0.').replace(empty_re, '0');
    event.target.value = v;
    setInflationrate(v);
  };

  const pecsTotal = () => {
    return parseFloat(pecs.coal) + parseFloat(pecs.distillateoil) + parseFloat(pecs.electricity) + parseFloat(pecs.naturalgas) + parseFloat(pecs.residual);
  };

  const validate = () => {
    return (
        (pecsTotal() === 100) &&
        (locale !== unselected) &&
        (startdate !== unselected) &&
        (carbonprice !== unselected) &&
        (!isNaN(parseFloat(inflationrate)))
    );
  };

  const resultReal = () => {
    if (validate()) {
      return 10.0;
    } else {
      return NaN;
    }
  };

  const resultNominal = () => {
    if (validate()) {
      return 10.0;
    } else {
      return NaN;
    }
  };

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <fieldset className={classes.formControl}>
        <FormLabel component="legend">Percent of Energy Cost Savings</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={6}>
            <List dense>
              {energytypes.map((energy, index) => (
                <ListItem key={energy.slug}>
                  <TextField key={energy.name} label={energy.name} value={pecs[energy.slug]} margin="dense"
                    InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
                    onChange={handlePecsChange(energy.slug)}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={6}>
            <TextField
              helperText={pecsTotal() !== 100 ? "Must equal 100%" : ""}
              error={pecsTotal() !== 100}
              label="Total"
              disabled
              variant="filled"
              value={pecsTotal()}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">Fuel Rate Information</FormLabel>
        <Grid container alignItems="center" justify="center" direction="row">
          <Grid item xs={6}>
            <FormControl border={1} component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Location</FormLabel>
              <TextField
                margin="dense"
                id="select-location"
                select
                value={locale}
                onChange={handleLocaleChange}
                SelectProps={{
                  native: true,
                }}
                error={locale===unselected}
                helperText={locale===unselected?"Select location":""}
              >
                {locales.map((option, index) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
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
                    value={value.toLowerCase()}
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
        <FormLabel component="legend">Contract Term</FormLabel>
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
        <FormLabel component="legend">Carbon Pricing Policy</FormLabel>
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
                {carbonprices.map((option, index) => (
                  <option key={option} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </TextField>
            </FormControl>
          </Grid>
        </Grid>
      </fieldset><br />
      <fieldset>
        <FormLabel component="legend">Annual Inflation Rate</FormLabel>
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
        <FormLabel component="legend">Annual Energy Escalation Rate</FormLabel>
        <FormLabel component="legend">RESULTS</FormLabel><br />
        <Grid container alignItems="center" justify="center" direction="row" style={{backgroundColor:"lightgrey"}}>
          <Grid item xs={6}>
            <TextField
              className={classes.result}
              helperText={isNaN(resultReal()) ? "Fix selections" : ""}
              error={isNaN(resultReal())}
              label="REAL"
              disabled
              variant="filled"
              InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
              value={isNaN(resultReal()) ? "---" : resultReal()}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.result}
              helperText={isNaN(resultNominal()) ? "Fix selections" : ""}
              error={isNaN(resultNominal())}
              label="NOMINAL"
              disabled
              variant="filled"
              InputProps={{ endAdornment: <InputAdornment  position="end">%</InputAdornment> }}
              value={isNaN(resultNominal()) ? "---" : resultNominal()}
            />
          </Grid>
        </Grid>
      </fieldset>
      <br />
    </form>
  );
}
