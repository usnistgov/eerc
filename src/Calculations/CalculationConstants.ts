/* eslint-disable */
// @ts-nocheck
import { encost as Encost } from "../data/Encost";
import { stateToRegion } from "./Calculations";

export const yearsIn: number = 31;
export const carbonConvert: number = 0.974817;
export const zero_carbon_price_policy: string = "__zero__";
export const zero_carbon_price_key: string = "No carbon price";

export const carbonC: number[] = new Array(yearsIn);
export const carbonNG: number[] = new Array(yearsIn);
export const carbonE: number[] = new Array(yearsIn);
export const carbonR: number[] = new Array(yearsIn);
export const carbonD: number[] = new Array(yearsIn);

export let pricesCarbon = new Array(yearsIn); // TODO: I think this is supposed to be Encost data?
export let pricesGas = new Array(yearsIn);
export let pricesElectricity = new Array(yearsIn);
export let pricesResidual = new Array(yearsIn);
export let pricesOil = new Array(yearsIn);

export let hasCoal = true;
export let hasGas = true;
export let hasElectricity = true;
export let hasResidual = true;
export let hasOil = true;

// let w = [];
// try {
// 	baseyearC = parseInt(Object.keys(Encost[region]["Coal"]).sort()[0]);
// } catch (e) {
// 	hasC = false;
// }
// try {
// 	baseyearNG = parseInt(Object.keys(Encost[region]["Natural Gas"]).sort()[0]);
// } catch (e) {
// 	hasNG = false;
// }
// try {
// 	baseyearE = parseInt(Object.keys(Encost[region]["Electricity"]).sort()[0]);
// } catch (e) {
// 	hasE = false;
// }
// try {
// 	baseyearR = parseInt(Object.keys(Encost[region]["Residual Oil"]).sort()[0]);
// } catch (e) {
// 	hasR = false;
// }
// try {
// 	baseyearD = parseInt(Object.keys(Encost[region]["Distillate Oil"]).sort()[0]);
// } catch (e) {
// 	hasD = false;
// }
// // set baseyear to be the consensus non-zero baseyear, if it exists
// let a = [baseyearC, baseyearNG, baseyearE, baseyearR, baseyearD].filter((v) => v !== null);
// //console.log("non-zero baseyears: %o", a);
// if ([...new Set(a)].length !== 1) {
// 	// use Set to remove duplicates from array
// 	w.push(`Data file may be corrupt: unable to determine a consensus base year for data!`);
// }
