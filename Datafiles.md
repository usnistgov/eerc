# Data files for the EERC app

This app uses 4 static data files. The filenames are hardcoded in the app. These are the files
that need to exist in the `public/` directory and should be updated yearly:

* Encost.json
* CO2Factors.json
* CO2FutureEmissions.json
* CO2ePrices.json

The original datafiles provided by Priya (and sourced originally from DOE I believe?)
were EERC-CO2.txt and EERC-ENCOST.txt, which I have renamed with a year suffix (-2019, -2020). 

To convert them to a format more easily readable by the app, I did this:

1. move EERC-ENCOST-2020.txt into `public/` 
2. `../build_encost_json.js < EERC-ENCOST-2020.txt > Encost.json`
3. `../build_co2_from_master.js -i EERC-CO2-2020.txt`
