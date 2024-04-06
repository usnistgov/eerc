#!/usr/bin/env node

//const encostfn = 'public/Encost19.txt';
//const encostjs = 'public/Encost.json';

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
    let a = l.split(/\t+/);
    if (section === null) {
      section = a.shift();
//console.log("Section: %s", section);
      encostobj[section] = {};
      if (a.length > 0) {
        years = a;
//console.log(" Years: %o", years);
      }
    } else if (years === null) {
      years = l.split(/\s+/);
//console.log(" Years2: %o", years);
    } else if (subsection === null) {
      subsection = a.shift();
//console.log(" Subsection: %s", subsection);
      encostobj[section][subsection] = {};
      if (a.length > 0) {
        data = a.map(x => { return parseFloat(x) });
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
    section = subsection = null; // removed years here so they would inherit
  }
}).on('close', function() {
  process.stdout.write(JSON.stringify(encostobj) + "\n"); 
});
