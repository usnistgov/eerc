import { shareLatest } from "@react-rxjs/core";
import { mergeWithKey } from "@react-rxjs/utils";
import { scan } from "rxjs";
import { Form } from "./Formats";

import {
	coalChange$,
	contractStartDateChange$,
	contractTermChange$,
	dataYearChange$,
	electricityChange$,
	gasChange$,
	inflationRateChange$,
	nominalRateChange$,
	oilChange$,
	realRateChange$,
	residualChange$,
	sectorChange$,
	socialCostChange$,
	stateChange$,
	totalChange$,
	zipCodeChange$,
} from "../components/Form";
import { SectorType, SocialCostType } from "./Formats";

const form$ = mergeWithKey({
	// Default behavior
	dataYear: dataYearChange$,
	sector: sectorChange$,
	state: stateChange$,
	zipcode: zipCodeChange$,
	oil: oilChange$,
	coal: coalChange$,
	electricity: electricityChange$,
	gas: gasChange$,
	residual: residualChange$,
	total: totalChange$,
	contractStartDate: contractStartDateChange$,
	contractTerm: contractTermChange$,
	socialCost: socialCostChange$,
	inflationRate: inflationRateChange$,
	realRate: realRateChange$,
	noinalRate: nominalRateChange$,
}).pipe(
	scan(
		(accumulator, operation) => {
			switch (operation.type) {
				default: {
					accumulator[operation.type] = operation.payload as never;
					break;
				}
			}
			return accumulator;
		},
		{
			dataYear: new Date().getFullYear(),
			sector: SectorType.INDUSTRIAL,
			state: "",
			zipcode: "",
			coal: 0,
			oil: 0,
			electricity: 0,
			gas: 0,
			residual: 0,
			total: 0,
			contractStartDate: new Date().getFullYear(),
			contractTerm: 15,
			socialCost: SocialCostType.NONE,
			inflationRate: 2.9,
		} as Form,
	),
	shareLatest(),
);

export { form$ };
