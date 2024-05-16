import { bind, shareLatest } from "@react-rxjs/core";
import { selfDependent } from "@react-rxjs/utils";
import { map } from "rxjs";
import { Form } from "./Formats";

const [_f$, connectForm] = selfDependent<Form>();

const _form$ = _f$.pipe(shareLatest());

export { _form$, connectForm };

const [useDataYear, dataYearType$] = bind(_form$.pipe(map((p) => p?.dataYearType)));
const [useSector, sectorType$] = bind(_form$.pipe(map((p) => p?.sectorType)));
const [useState, stateType$] = bind(_form$.pipe(map((p) => p?.stateType)));
const [useZipcode, zipcodeType$] = bind(_form$.pipe(map((p) => p?.zipcodeType)));

const [useCoal, coal$] = bind(_form$.pipe(map((p) => p?.coal)));
const [useOil, oil$] = bind(_form$.pipe(map((p) => p?.oil)));
const [useElectricity, electricity$] = bind(_form$.pipe(map((p) => p?.electricty)));
const [useGas, gas$] = bind(_form$.pipe(map((p) => p?.gas)));
const [useResidual, residual$] = bind(_form$.pipe(map((p) => p?.residual)));
const [useTotal, total$] = bind(_form$.pipe(map((p) => p?.total)));

const [useContractStartDate, contractStartDateType$] = bind(_form$.pipe(map((p) => p?.contractStartDateType)));
const [useContractTermDuration, contractTermDuration$] = bind(_form$.pipe(map((p) => p?.contractTermDuration)));
const [useAnnualInflationRate, annualInflationRate$] = bind(_form$.pipe(map((p) => p?.annualInflationRate)));

const [useSocialCostCarbon, socialCostCarbonType$] = bind(_form$.pipe(map((p) => p?.socialCostCarbonType)));

const [useRealRate, realRate$] = bind(_form$.pipe(map((p) => p?.realRate)));
const [usenominalRate, nominalRate$] = bind(_form$.pipe(map((p) => p?.nominalRate)));

const Model = {
	form$: _form$,

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
	useTotal,
	total$,
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
