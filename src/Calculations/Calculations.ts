import { calculationInput, EncostType, SectorType, SocialCost, SocialCostType, StateType } from "../data/Formats";
import {
	carbonC,
	// carbonConvert,
	carbonD,
	carbonE,
	carbonNG,
	carbonR,
	pricesCoal,
	pricesElectricity,
	pricesGas,
	pricesOil,
	pricesResidual,
	yearsIn,
} from "./CalculationConstants";

// import { CO2ePrices, CO2Factors, CO2FutureEmissions } from "../data/CO2Data";
// import { sccOptions } from "../data/Constants";
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
			return "WestNorthCentral";
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

//step0 - find region

// step1
export const addPrices = (prices: number[], carbon: number[], carbonprice: string, index_start: number) => {
	// add EIA prices and carbon prices and store in prices array
	if (carbonprice !== SocialCost.NONE) {
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

// PP 2025: this function is not used as the socialcost is always set to "NONE". uncomment when scc is added back
// const calculateCarbonPrice = (
// 	CO2Factor: number,
// 	cP: number[],
// 	isElectricity: boolean,
// 	baseyear: number,
// 	socialCost: string,
// 	state: string,
// ) => {
// 	// PP 2025: replaced carbonprice with socialCost as variable name
// 	if (socialCost !== SocialCost.NONE) {
// 		// default, low, or high carbon price
// 		if (socialCost !== SocialCost.NONE) {
// 			for (let i = 0; i < yearsIn; i++) {
// 				cP[i] = CO2ePrices[socialCost][i + baseyear] * CO2Factor;
// 			} // steps 1 & 2 from Excel file
// 			if (isElectricity) {
// 				for (let i = 0; i < yearsIn; i++) {
// 					//SWB 2022: change from index by CPP and year to index by state and year
// 					//SWB 2022 cP[i] = cP[i] * CO2FutureEmissions[carbonprices[carbonprice]][i + baseyear];
// 					cP[i] = cP[i] * CO2FutureEmissions[state][i + baseyear];
// 				}
// 			} // step 3
// 			for (let i = 0; i < yearsIn; i++) {
// 				cP[i] = cP[i] * carbonConvert;
// 			} // step 4
// 		}
// 	}
// };

const getKeyByValue = (obj: typeof SocialCost, value: string) => {
	const entry = Object.entries(obj).find(([, val]) => val === value);
	return entry ? entry[0] : null;
};

// base years for each fuel comes from encost data
export const finalCalculations = (inputs: calculationInput) => {
	const [
		sector,
		state, // add zip
		,
		coal,
		oil,
		electricity,
		gas,
		residual,
		total,
		contractStart,
		term,
		// socialCost, - uncomment when scc is added back
		inflation,
	] = inputs;

	console.log(inputs);

	let escalationRate = 0;
	let nomRate = 0;

	if (total !== 100 || sector == SectorType.NONE || state == StateType.State) return [escalationRate, nomRate];

	const scc: SocialCostType | string = getKeyByValue(SocialCost, "No carbon price") || SocialCost.NONE; // - change 2nd parameter to "socialCost" when scc is added back, for now - will always be "NONE"
	const region: keyof EncostType = `${stateToRegion(state)} ${sector}`;

	let baseyearCarbon = null;
	let baseyearGas = null;
	let baseyearElectricity = null;
	let baseyearResidual = null;
	let baseyearOil = null;
	let hasCoal = true;
	let hasGas = true;
	let hasElectricity = true;
	let hasResidual = true;
	let hasOil = true;
	let cC = 0;
	let cNG = 0;
	let cE = 0;
	let cR = 0;
	let cD = 0;
	let rateCarbon = 0.0;
	let rateGas = 0.0;
	let rateElectricity = 0.0;
	let rateResidual = 0.0;
	let rateOil = 0.0;

	// calculate base year correctly
	try {
		const coalData = Encost[region]["Coal"];
		if (coalData) {
			const coalBaseYearKey = Object.keys(coalData).sort()[0];
			baseyearCarbon = parseInt(coalBaseYearKey);
		}
	} catch (e) {
		hasCoal = false;
	}
	try {
		baseyearGas = parseInt(Object.keys(Encost[region]["Natural Gas"]).sort()[0]);
	} catch (e) {
		hasGas = false;
	}
	try {
		baseyearElectricity = parseInt(Object.keys(Encost[region]["Electricity"]).sort()[0]);
	} catch (e) {
		hasElectricity = false;
	}
	try {
		const residualData = Encost[region]["Residual Oil"];
		if (residualData) {
			const residualBaseYearKey = Object.keys(residualData).sort()[0];
			baseyearResidual = parseInt(residualBaseYearKey);
		}
	} catch (e) {
		hasResidual = false;
	}
	try {
		baseyearOil = parseInt(Object.keys(Encost[region]["Distillate Oil"]).sort()[0]);
	} catch (e) {
		hasOil = false;
	}

	for (let i = 0; i < yearsIn; i++) {
		// Check for available prices using safe access
		const carbonIndex = baseyearCarbon !== null ? i + baseyearCarbon : 0; // Default to 0 or another sensible value
		const gasIndex = baseyearGas !== null ? i + baseyearGas : 0;
		const electricityIndex = baseyearElectricity !== null ? i + baseyearElectricity : 0;
		const residualIndex = baseyearResidual !== null ? i + baseyearResidual : 0;
		const oilIndex = baseyearOil !== null ? i + baseyearOil : 0;

		pricesCoal[i] = Encost[region]["Coal"]?.[carbonIndex] || 1;
		pricesGas[i] = Encost[region]["Natural Gas"]?.[gasIndex] || 1;
		pricesElectricity[i] = Encost[region]["Electricity"]?.[electricityIndex] || 1;
		pricesResidual[i] = Encost[region]["Residual Oil"]?.[residualIndex] || 1;
		pricesOil[i] = Encost[region]["Distillate Oil"]?.[oilIndex] || 1;
	}

	// coal
	try {
		if (coal > 0) {
			if (hasCoal && baseyearCarbon) {
				const index_start = contractStart - baseyearCarbon + 1;
				const index_end = index_start + term - 1;
				// calculateCarbonPrice(CO2Factors["Coal"], carbonC, false, baseyearCarbon, scc, state);
				addPrices(pricesCoal, carbonC, scc, index_start); // carbonprices is an object of socialCost
				cC = calculateC(index_start, index_end, pricesCoal);
				//compareIndicesC = compareStartEnd(index_start, index_end, pricesC);
				rateCarbon = solveForAnnualAverageRate(cC, term);
			}
		}
	} catch (error) {
		console.error("error", error);
	}

	// natural gas
	try {
		if (gas > 0) {
			if (hasGas && baseyearGas) {
				const index_start = contractStart - baseyearGas + 1;
				const index_end = index_start + term - 1;
				// calculateCarbonPrice(CO2Factors["NatGas"], carbonNG, false, baseyearGas, scc, state);
				addPrices(pricesGas, carbonNG, scc, index_start);
				cNG = calculateC(index_start, index_end, pricesGas);
				//compareIndicesNG = compareStartEnd(index_start, index_end, pricesNG);
				rateGas = solveForAnnualAverageRate(cNG, term);
			}
		}
	} catch (error) {
		console.error("error", error);
	}

	// electricity
	try {
		if (electricity > 0) {
			if (hasElectricity && baseyearElectricity) {
				const index_start = contractStart - baseyearElectricity + 1;
				const index_end = index_start + term - 1;
				// calculateCarbonPrice(CO2Factors[/*ZipToState[locale]*/ state], carbonE, true, baseyearElectricity, scc, state);
				addPrices(pricesElectricity, carbonE, scc, index_start);
				cE = calculateC(index_start, index_end, pricesElectricity);
				//compareIndicesE = compareStartEnd(index_start, index_end, pricesE);
				rateElectricity = solveForAnnualAverageRate(cE, term);
			}
		}
	} catch (error) {
		console.error("error", error);
	}

	// residual oil
	try {
		if (residual > 0) {
			if (hasResidual && baseyearResidual) {
				const index_start = contractStart - baseyearResidual + 1;
				const index_end = index_start + term - 1;
				// calculateCarbonPrice(CO2Factors["ResidOil"], carbonR, false, baseyearResidual, scc, state);
				addPrices(pricesResidual, carbonR, scc, index_start);
				cR = calculateC(index_start, index_end, pricesResidual);
				//compareIndicesR = compareStartEnd(index_start, index_end, pricesR);
				rateResidual = solveForAnnualAverageRate(cR, term);
			}
		}
	} catch (error) {
		console.error("error", error);
	}

	// distillate oil
	try {
		if (oil > 0) {
			if (hasOil && baseyearOil) {
				const index_start = contractStart - baseyearOil + 1;
				const index_end = index_start + term - 1;
				// calculateCarbonPrice(CO2Factors["DistOil"], carbonD, false, baseyearOil, scc, state);
				addPrices(pricesOil, carbonD, scc, index_start);
				cD = calculateC(index_start, index_end, pricesOil);
				//compareIndicesD = compareStartEnd(index_start, index_end, pricesD);
				rateOil = solveForAnnualAverageRate(cD, term);
			}
		}
	} catch (error) {
		console.error("error", error);
	}

	console.log(
		"rateC=%f rateD=%f rateE=%f rateR=%f rateNG=%f",
		rateCarbon,
		rateGas,
		rateElectricity,
		rateResidual,
		rateOil,
	);
	escalationRate =
		coal * rateCarbon + oil * rateOil + electricity * rateElectricity + residual * rateResidual + gas * rateGas; // blended rate
	nomRate = (1 + escalationRate / 100) * (1 + parseFloat(inflation.toFixed(2)) / 100) - 1;
	nomRate = nomRate * 100;

	console.log("exiting useEffect-CalculateRate", escalationRate, nomRate);
	return [escalationRate, nomRate];
};
