#!/usr/bin/env node

const encostfn = 'public/Encost19.txt';
const encostjs = 'public/Encost.json';

const readline = require('readline');

var encostobj = {};

var section = null;
var years = null;
var subsection = null;
var data = null;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function (line) {
  const l = line.trim();

  if (l && l != '') {
    if (section === null) {
      section = l;
      encostobj[section] = {};
    } else if (years === null) {
      years = l.split(/\s+/);
    } else if (subsection === null) {
      subsection = l;
      encostobj[section][subsection] = {};
    } else {
      data = l.split(/\s+/).map(x => { return parseFloat(x) });
      if (data.length !== years.length) {
        console.error("WARNING: " + section + "/" + subsection + ": data length does not equal year length");
      }
      let o = {};
      for (let i = 0; i < years.length; i++) {
        o[years[i]] = data[i];
      }
      encostobj[section][subsection] = o;
      subsection = null;
    }
  } else {
    section = years = subsection = null;
  }
}).on('close', function() {
  process.stdout.write(JSON.stringify(encostobj) + "\n"); 
});
