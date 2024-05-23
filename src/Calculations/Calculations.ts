/* eslint-disable */
// @ts-nocheck
// import { sccOptions } from "../data/Constants";

import { SocialCostType } from "../data/Formats";
import {
	carbonC,
	carbonConvert,
	carbonD,
	carbonE,
	carbonNG,
	carbonR,
	hasCoal,
	hasElectricity,
	hasGas,
	hasOil,
	hasResidual,
	pricesCoal,
	pricesElectricity,
	pricesGas,
	pricesOil,
	pricesResidual,
	yearsIn,
} from "./CalculationConstants";

import { CO2Factors, CO2FutureEmissions, CO2ePrices } from "../data/CO2Data";
import { sccOptions } from "../data/Constants";
import { encost as Encost } from "../data/Encost";

export const stateToRegion = (state: string) => {
	switch (state) {
		//case unselected:
		case "":
		case null:
			return "undefined";
		case "ME":
		case "NH":
		case "VT":
		case "MA":
		case "RI":
		case "CT":
			return "NewEngland";
		case "NY":
		case "NJ":
		case "PA":
			return "MidAtlantic";
		case "DE":
		case "MD":
		case "DC":
		case "VA":
		case "WV":
		case "NC":
		case "SC":
		case "GA":
		case "FL":
			return "SouthAtlantic";
		case "KY":
		case "TN":
		case "AL":
		case "MS":
			return "EastSouthCentral";
		case "AR":
		case "LA":
		case "OK":
		case "TX":
			return "WestSouthCentral";
		case "OH":
		case "MI":
		case "IN":
		case "WI":
		case "IL":
			return "EastNorthCentral";
		case "MO":
		case "IA":
		case "MN":
		case "ND":
		case "SD":
		case "NE":
		case "KS":
			return "EastNorthCentral";
		case "CA":
		case "OR":
		case "WA":
		case "HI":
		case "AK":
			return "Pacific";
		default:
			return "Mountain";
	}
};
export const encostReducer = (state, updateArg) => {
	return { ...state, ...updateArg };
};

const carbonprices = {
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH",
};

//step0 - find region

// step1
export const addPrices = (prices: number[], carbon: number[], carbonprice: SocialCostType, index_start: number) => {
	// add EIA prices and carbon prices and store in prices array
	if (
		carbonprice !== SocialCostType.NONE
		// zero_carbon_price_policy
	) {
		for (let i = index_start + 1; i < yearsIn; i++) {
			prices[i] = prices[i] + carbon[i];
		}
	}
	console.log("exiting addPrices with prices=%o", prices);
};

//step2
export const calculateC = (start: number, end: number, prices: number[]) => {
	// method calculates indices for years in contract and sums to get C; to calculate C, we are assuming A = $1.00
	let C = 0.0;
	for (let i = start; i <= end; i++) {
		C += prices[i] / prices[0];
	} // calculate index and add to C
	console.log("exiting calculateC %f", C);
	return C;
};

// step3
export const solveForAnnualAverageRate = (computedC: number, duration: number) => {
	// using modified UCA formula, this method iteratively solves for the annual average rate (real)

	// SWB 2023/01/20: positiveEAvg supercedes old compareYearIndex (from compareStartEnd)
	const positiveEAvg = computedC - duration >= 0;
	console.log(
		"entering solveForAnnualAverageRate: computedC=%f positiveEAvg=%s duration=%d",
		computedC,
		positiveEAvg,
		duration,
	);

	let eAvg = 0.0;
	let previousEAvg = 0.0;
	let estC = 0.0;
	let diff = 0.0;
	let previousDiff = 0.0;
	let diffNeg = false;
	let previousDiffNeg = false;
	let signChanged = false;
	let bump = 0.0;

	if (positiveEAvg) {
		eAvg = 0.02; // 1st guess
	} else {
		// if start date's index > end year's index, need different initial setting for eAvg to
		// account for possibility of negative eAvg results
		eAvg = -0.01;
	}
	console.log("Initial eAvg=%f", eAvg);
	// 11-6-11 asr now using modified UCA formula; when first making this change in June 2011, I only updated the formula in the while loop, I forgot it here
	//	previous UCA formula:   estC = ((Math.pow((1 + eAvg), Contract))-1)/eAvg;  // estimated C
	estC = (Math.pow(1 + eAvg, duration + 1) - (1 + eAvg)) / eAvg; // estimated C
	console.log("initial estC=%f", estC);
	diff = estC - computedC;
	console.log("initial diff=%f", diff);
	diffNeg = diff < 0; // is the difference between estimated C and computed C negative?

	// set bump value
	// if start date's index > end date's index, need different initial setting for Iteration Bump
	if (diffNeg) {
		// the difference from actual C is negative
		if (positiveEAvg) {
			bump = 0.25;
		} else {
			bump = -0.25;
		}
	} else {
		// the difference from actual C is positive
		if (positiveEAvg) {
			bump = -0.25;
		} else {
			bump = 0.25;
		}
	}
	console.log("bump=%f", bump);

	while (!signChanged) {
		// repeat until difference changes sign
		// move values to "previous" constiables
		previousEAvg = eAvg;
		previousDiff = diff;
		previousDiffNeg = diffNeg;

		eAvg = previousEAvg * (1 + bump); // eAvg
		// 6-19-11 asr now using modified UCA formula
		//	previous UCA formula:   estC = ((Math.pow((1 + eAvg), Contract))-1)/eAvg;  // estimated C
		estC = (Math.pow(1 + eAvg, duration + 1) - (1 + eAvg)) / eAvg; // estimated C
		diff = estC - computedC; // difference from actual C
		diffNeg = diff < 0; // is difference negative?
		console.log(
			"Iterate: eAvg=%f ; previousEAvg=%f ; diff=%f ; previousDiff=%f",
			eAvg,
			previousEAvg,
			diff,
			previousDiff,
		);

		signChanged = diffNeg !== previousDiffNeg; // difference changed sign?
	}
	console.log("Final: eAvg=%f ; previousEAvg=%f ; diff=%f ; previousDiff=%f", eAvg, previousEAvg, diff, previousDiff);

	// when difference changes sign, interpolate for a close approximation to eAvg; this is the annual average rate (real)
	const r = eAvg + (Math.abs(diff) / (Math.abs(previousDiff) + Math.abs(diff))) * (previousEAvg - eAvg);
	console.log("solveForAnnualAverageRate returns %f", r);
	return r;
};

const calculateCarbonPrice = (
	CO2Factor: number,
	cP: number[],
	isElectricity: boolean,
	baseyear: number,
	socialCost: SocialCostType,
	state: string,
) => {
	//console.log("calculateCarbonPrice: isElec=%o baseyear=%d CO2Factor=%o cP=%o CO2ePrices[%s]=%o", isElectricity, baseyear, CO2Factor, cP, carbonprice, CO2ePrices[carbonprice]);
	//console.log("calculateCarbonPrice: CO2FutureEmissions[%s] = %o", locale, CO2FutureEmissions[locale]);
	//console.log("calculateCarbonPrice: CO2FutureEmissions[%s][%s] = %o", locale, baseyear, CO2FutureEmissions[locale][baseyear]);
	// if (carbonprice !== "") {

	// PP: replaced carbonprice with socialCost as variable name
	if (socialCost !== SocialCostType.NONE) {
		// default, low, or high carbon price
		if (carbonprices[socialCost] !== SocialCostType.NONE) {
			for (let i = 0; i < yearsIn; i++) {
				cP[i] = CO2ePrices[carbonprices[socialCost]][i + baseyear] * CO2Factor;
			} // steps 1 & 2 from Excel file
			if (isElectricity) {
				for (let i = 0; i < yearsIn; i++) {
					//SWB 2022: change from index by CPP and year to index by state and year
					//SWB 2022 cP[i] = cP[i] * CO2FutureEmissions[carbonprices[carbonprice]][i + baseyear];
					cP[i] = cP[i] * CO2FutureEmissions[state][i + baseyear];
				}
			} // step 3
			for (let i = 0; i < yearsIn; i++) {
				cP[i] = cP[i] * carbonConvert;
			} // step 4
		}
	}
	//console.log("exiting calculateCarbonPrice");
};

const getKeyByValue = (obj, value) => {
	const entry = Object.entries(obj).find(([key, val]) => val === value);
	return entry ? entry[0] : null;
};

// base years for each fuel comes from encost data
export const finalCalculations = (inputs) => {
	const [
		dataYear,
		sector,
		state,
		zip,
		coal,
		oil,
		electricity,
		gas,
		residual,
		total,
		contractStart,
		term,
		socialCost,
		inflation,
	] = inputs;

	const scc = getKeyByValue(SocialCostType, socialCost);

	const region = stateToRegion(/*ZipToState[locale]*/ state) + " " + sector;

	let cC = 0;
	let cNG = 0;
	let cE = 0;
	let cR = 0;
	let cD = 0;
	let rateC = 0.0;
	let rateNG = 0.0;
	let rateE = 0.0;
	let rateR = 0.0;
	let rateD = 0.0;

	const baseyearCarbon = 2024;
	const baseyearGas = 2024;
	const baseyearElectricity = 2024;
	const baseyearResidual = 2024;
	const baseyearOil = 2024;

	const warningsArr = [];
	let uses_missing_data = false;

	for (let i = 0; i < yearsIn; i++) {
		carbonC[i] = 0.0;
		carbonNG[i] = 0.0;
		carbonE[i] = 0.0;
		carbonR[i] = 0.0;
		carbonD[i] = 0.0;
		try {
			pricesCoal[i] = Encost[region]["Coal"][i + baseyearCarbon];
		} catch (e) {
			pricesCoal[i] = 1;
		}
		try {
			pricesGas[i] = Encost[region]["Natural Gas"][i + baseyearGas];
		} catch (e) {
			pricesGas[i] = 1;
		}
		try {
			pricesElectricity[i] = Encost[region]["Electricity"][i + baseyearElectricity];
		} catch (e) {
			pricesElectricity[i] = 1;
		}
		try {
			pricesResidual[i] = Encost[region]["Residual Oil"][i + baseyearResidual];
		} catch (e) {
			pricesResidual[i] = 1;
		}
		try {
			pricesOil[i] = Encost[region]["Distillate Oil"][i + baseyearOil];
		} catch (e) {
			pricesOil[i] = 1;
		}
	}

	// coal
	if (coal > 0) {
		if (hasCoal) {
			const index_start = contractStart - baseyearCarbon + 1;
			const index_end = index_start + term - 1;
			calculateCarbonPrice(CO2Factors["Coal"], carbonC, false, baseyearCarbon, scc, state);
			addPrices(pricesCoal, carbonC, carbonprices[scc], index_start); // carbonprices is an object of socialCost
			cC = calculateC(index_start, index_end, pricesCoal);
			//compareIndicesC = compareStartEnd(index_start, index_end, pricesC);
			rateC = solveForAnnualAverageRate(cC, term);
		} else {
			// w is an array of warnings to set
			warningsArr.push(`Coal data is not available for the ${region} region`);
			uses_missing_data = true;
		}
	}
	// natural gas
	if (gas > 0) {
		if (hasGas) {
			const index_start = contractStart - baseyearGas + 1;
			const index_end = index_start + term - 1;
			calculateCarbonPrice(CO2Factors["NatGas"], carbonNG, false, baseyearGas, scc, state);
			addPrices(pricesGas, carbonNG, carbonprices[scc], index_start);
			calculateC(index_start, index_end, pricesGas);
			//compareIndicesNG = compareStartEnd(index_start, index_end, pricesNG);
			rateNG = solveForAnnualAverageRate(cNG, term);
		} else {
			warningsArr.push(`Natural Gas data is not available for the ${region} region`);
			uses_missing_data = true;
		}
	}
	// 	// electricity
	if (electricity > 0) {
		if (hasElectricity) {
			const index_start = contractStart - baseyearElectricity + 1;
			const index_end = index_start + term - 1;
			calculateCarbonPrice(CO2Factors[/*ZipToState[locale]*/ state], carbonE, true, baseyearElectricity, scc, state);
			addPrices(pricesElectricity, carbonE, carbonprices[scc], index_start);
			cE = calculateC(index_start, index_end, pricesElectricity);
			//compareIndicesE = compareStartEnd(index_start, index_end, pricesE);
			rateE = solveForAnnualAverageRate(cE, term);
		} else {
			warningsArr.push(`Electricity data is not available for the ${region} region`);
			uses_missing_data = true;
		}
	}
	// 	// residual oil
	if (residual > 0) {
		if (hasResidual) {
			const index_start = contractStart - baseyearResidual + 1;
			const index_end = index_start + term - 1;
			calculateCarbonPrice(CO2Factors["ResidOil"], carbonR, false, baseyearResidual, scc, state);
			addPrices(pricesResidual, carbonR, carbonprices[scc], index_start);
			cR = calculateC(index_start, index_end, pricesResidual);
			//compareIndicesR = compareStartEnd(index_start, index_end, pricesR);
			rateR = solveForAnnualAverageRate(cR, term);
		} else {
			warningsArr.push(`Residual Oil data is not available for the ${region} region`);
			uses_missing_data = true;
		}
	}
	// 	// distillate oil
	if (oil > 0) {
		if (hasOil) {
			const index_start = contractStart - baseyearOil + 1;
			const index_end = index_start + term - 1;
			calculateCarbonPrice(CO2Factors["DistOil"], carbonD, false, baseyearOil, scc, state);
			addPrices(pricesOil, carbonD, carbonprices[scc], index_start);
			cD = calculateC(index_start, index_end, pricesOil);
			//compareIndicesD = compareStartEnd(index_start, index_end, pricesD);
			rateD = solveForAnnualAverageRate(cD, term);
		} else {
			warningsArr.push(`Distillate Oil data is not available for the ${region} region`);
			uses_missing_data = true;
		}
	}

	//console.log("rateC=%f rateD=%f rateE=%f rateR=%f rateNG=%f", rateC, rateD, rateE, rateR, rateNG);
	let escalationRate = coal * rateC + oil * rateD + electricity * rateE + residual * rateR + gas * rateNG; // blended rate
	let nomRate = (1 + escalationRate / 100) * (1 + parseFloat(inflation) / 100) - 1;
	nomRate = nomRate * 100;
	//console.log("Escalation rate = %f", escalationRate);
	//console.log("Nominal rate = %f", nomRate);

	if (uses_missing_data) {
		escalationRate = NaN;
		nomRate = NaN;
	}

	// set_Result_Real(escalationRate);
	// set_Result_Nominal(nomRate);
	// set_Warnings(warningsArr);
	console.log("exiting useEffect-CalculateRate", escalationRate, nomRate);
	return [escalationRate, nomRate];
};
