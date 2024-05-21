// import { sccOptions } from "../data/Constants";
import { SocialCostType } from "../data/Formats";
import { yearsIn } from "./CalculationConstants";

const carbonC: number[] = new Array(yearsIn);
const carbonNG: number[] = new Array(yearsIn);
const carbonE: number[] = new Array(yearsIn);
const carbonR: number[] = new Array(yearsIn);
const carbonD: number[] = new Array(yearsIn);

export const encostReducer = (state, updateArg) => {
	return { ...state, ...updateArg };
};

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
