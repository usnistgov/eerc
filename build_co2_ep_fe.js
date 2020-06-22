#!/usr/bin/env node

const readline = require('readline');

var encostobj = {};

var startyear = null;
var endyear = null;
var duration = 0;
var section = null;
var co2 = {};

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function (line) {
  const l = line.trim();

  if (l && l != '') {
    if (duration <= 0) {
      let a = l.split(/\s*-\s*/);
      startyear = parseInt(a[0]);
      endyear = parseInt(a[1]);
      duration = endyear - startyear;
      co2.startyear = startyear;
      co2.endyear = endyear;
      co2.duration = duration;
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
  } else {
    section = null;
  }
}).on('close', function() {
  process.stdout.write(JSON.stringify(co2) + "\n"); 
});
