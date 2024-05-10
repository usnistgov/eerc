import { bind, shareLatest } from "@react-rxjs/core";
import { NEVER, map, switchMap } from "rxjs";
import { filter, startWith } from "rxjs/operators";

export const currentForm$ = NEVER.pipe(startWith(1));

currentForm$.subscribe(console.log);

export const [useForm, form$] = bind(currentForm$, undefined);

const _form$ = form$.pipe(shareLatest());

const [useDataYear, dataYearType$] = bind(_form$.pipe(map((p) => p?.dataYearType)));
const [useSector, sectorType$] = bind(_form$.pipe(map((p) => p?.sectorType)));
const [useState, stateType$] = bind(_form$.pipe(map((p) => p?.stateType)));
const [useZipcode, zipcodeType$] = bind(_form$.pipe(map((p) => p?.zipcodeType)));

const [useCoal, coal$] = bind(_form$.pipe(map((p) => p?.coal)));
const [useOil, oil$] = bind(_form$.pipe(map((p) => p?.oil)));
const [useElectricity, electricity$] = bind(_form$.pipe(map((p) => p?.electricty)));
const [useGas, gas$] = bind(_form$.pipe(map((p) => p?.gas)));
const [useResidual, residual$] = bind(_form$.pipe(map((p) => p?.residual)));

const [useContractStartDate, contractStartDateType$] = bind(_form$.pipe(map((p) => p?.contractStartDateType)));
const [useContractTermDuration, contractTermDuration$] = bind(_form$.pipe(map((p) => p?.contractTermDuration)));
const [useAnnualInflationRate, annualInflationRate$] = bind(_form$.pipe(map((p) => p?.annualInflationRate)));

const [useSocialCostCarbon, socialCostCarbonType$] = bind(_form$.pipe(map((p) => p?.socialCostCarbonType)));

const [useRealRate, realRate$] = bind(_form$.pipe(map((p) => p?.realRate)));
const [usenominalRate, nominalRate$] = bind(_form$.pipe(map((p) => p?.nominalRate)));

const Model = {
	project$: _form$,

	useDataYear,
	dataYearType$,
	useSector,
	sectorType$,
	useState,
	stateType$,
	useZipcode,
	zipcodeType$,
	useCoal,
	coal$,
	useOil,
	oil$,
	useElectricity,
	electricity$,
	useGas,
	gas$,
	useResidual,
	residual$,
	useContractStartDate,
	contractStartDateType$,
	useContractTermDuration,
	contractTermDuration$,
	useSocialCostCarbon,
	socialCostCarbonType$,
	useAnnualInflationRate,
	annualInflationRate$,
	useRealRate,
	realRate$,
	usenominalRate,
	nominalRate$,
};

export { Model };
