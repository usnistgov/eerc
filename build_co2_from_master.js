#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const fs = require('fs');
const argv = require('yargs')
  .usage('Usage: $0 [-i filename] [-d directoryname]')
  .string('d')
  .describe('d', 'Directory to write output files to')
  .default('d', ".")
  .string('i')
  .describe('i', 'File name to be read from')
  .default('i', "/dev/stdin")
  .argv;

const json_suffix = '.json';
var startyear = null;
var endyear = null;
var duration = 0;
var section = null;
var file = null;
var co2 = {};

var readStream;

if (argv.i === '/dev/stdin') {
  readStream = process.stdin;
} else {
  readStream = fs.createReadStream(argv.i);
  readStream.on('error', function(err) {
    console.log(err.message);
    process.exit(1);
  });
}

var rl = readline.createInterface({
  input: readStream,
  output: process.stdout,
  terminal: false
});

if (! fs.statSync(argv.d).isDirectory()) {
  console.log("ERROR: '%s' is not a directory");
  process.exit(1);
}

const save_file = (fn, o) => {
  //console.log("Writing %s = %o", fn, o);
  let filename = '';
  if (path.isAbsolute(fn)) {
    filename = fn + json_suffix;
  } else {
    filename = path.join(argv.d, fn) + json_suffix;
  }
  fs.writeFile(filename, JSON.stringify(o) + "\n", err => {
    if (err) console.log(err.message);
  });
  startyear = null;
  endyear = null;
  duration = 0;
  section = null;
  file = null;
};

rl.on('line', function (line) {
  const l = line.replace(/#.*$/, '').trim();

  if (l && l != '') {
    if (l === "CO2Factors" || l === "CO2ePrices" || l === "CO2FutureEmissions") {
      if (file !== null) {
        save_file(file, co2);
        co2 = {}
      }
      file = l;
    } else if (file === "CO2Factors") {
      let a = l.split(/\s+/);
      if (a.length !== 2) {
        console.log("ERROR: CO2Factors format is 'key value' but got: '%s'", l);
        console.log("Output file may be corrupt!");
      }
      co2[a[0]] = parseFloat(a[1]);
    } else if (file === "CO2ePrices" || file == "CO2FutureEmissions") {
      if (duration <= 0) {
        let a = l.split(/\s*-\s*/);
        startyear = parseInt(a[0]);
        endyear = parseInt(a[1]);
        duration = endyear - startyear;
        co2.startyear = startyear;
        co2.endyear = endyear;
        co2.duration = duration;
        section = null;
      } else if (section === null) {
        let a = l.split(/\t+/);
        section = a.shift();
        if (a.length > 0) {
          let data = a.map(x => { return parseFloat(x) });
          if (data.length != (duration + 1)) {
            console.error("WARNING: " + section + ": data length does not equal duration");
          }
          co2[section] = {};
          for (let i = 0; i <= duration; i++) {
            co2[section][startyear + i] = data[i];
          }
          section = null;
        }
      } else {
        let a = l.split(/\s+/);
        if (a.length > 0) {
          let data = a.map(x => { return parseFloat(x) });
          if (data.length != (duration + 1)) {
            console.error("WARNING: " + section + ": data length does not equal duration");
          }
          co2[section] = {};
          for (let i = 0; i <= duration; i++) {
            co2[section][startyear + i] = data[i];
          }
          section = null;
        }
      }
    }
  }
}).on('close', function() {
  if (file !== null) {
    save_file(file, co2);
    co2 = {};
  }
});
