# Data files for the EERC app

This app uses 4 static data files. The filenames are hardcoded in the app. These are the files
that need to exist in the `public/` directory and should be updated yearly:

* Encost.json
* CO2Factors.txt
* CO2FutureEmissions.json
* CO2ePrices.json

The original datafiles provided by Priya (and sourced originally from DOE I believe?)
were EERC-CO2.txt and EERC-ENCOST.txt, which I have renamed with a year suffix (-2019, -2020). 

To convert them to a format more easily readable by the app, I did this:

1. split EERC-CO2-2020.txt into separate files for each major section (as they had been
previously) and place them in `public/` :
   - EERC-CO2Factors-2020.txt
   - EERC-CO2FutureEmissions-2020.txt
   - EERC-CO2ePrices-2020.txt
2. move EERC-ENCOST-2020.txt into `public/` 
3. `cd public`
4. `../build_encost_json.js < EERC-ENCOST-2020.txt > Encost.json`
5. `../build_ep_fe_json.js < EERC-CO2ePrices-2020.txt > CO2ePrices.json`
6. `../build_ep_fe_json.js < EERC-CO2FutureEmissions-2020.txt > CO2FutureEmissions.json`
7. `cp -p EERC-CO2Factors-2020.txt CO2Factors.txt` (NOTE: this is not a json file!)
8. (optional) I manually edited CO2Factors.txt to remove trailing whitespace and blank lines, to reduce the size.
