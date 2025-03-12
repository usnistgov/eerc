import { FilePdfOutlined } from "@ant-design/icons";
import { Button, Layout, Space, Statistic, Typography } from "antd";

import { bind } from "@react-rxjs/core";
import { BehaviorSubject, Subject, combineLatest, filter, map, of, startWith, switchMap } from "rxjs";
import {
	ContractStartDateType,
	DataYearType,
	SectorType,
	SocialCostType,
	StateType,
	currentYear,
} from "../data/Formats";
import stateZips from "../data/statetozip.json";

import { finalCalculations } from "../Calculations/Calculations";

import { useState } from "react";
import Disclaimer from "./Disclaimer";
import DividerComp from "./Divider";
import Dropdown from "./Dropdown";
import Navigation from "./Navigation";
import NumberInput from "./NumberInput";

const { Content, Footer } = Layout;
const { Title } = Typography;

const dataYearChange$ = new Subject<number>();
const [useDataYear] = bind(dataYearChange$, DataYearType.CURRENT);

const sectorChange$ = new Subject<SectorType>();
const [useSector, sector$] = bind(sectorChange$, SectorType.INDUSTRIAL);

const stateChange$ = new Subject<StateType>();
const [useSelectedState] = bind(stateChange$, StateType.State);

const zipCodeChange$ = new Subject<string>();
const [useZipcode] = bind(zipCodeChange$);

const coalChange$ = new BehaviorSubject(0);
const oilChange$ = new BehaviorSubject(0);
const electricityChange$ = new BehaviorSubject(0);
const gasChange$ = new BehaviorSubject(0);
const residualChange$ = new BehaviorSubject(0);
const totalChange$ = new Subject();

const contractTermChange$ = new Subject();
const [useContractTerm] = bind(contractTermChange$);
const contractStartDateChange$ = new Subject<typeof ContractStartDateType>();
const [useContractStartDate] = bind(contractStartDateChange$, 2023);

const inflationRateChange$ = new Subject();
const [useInflationRate] = bind(inflationRateChange$, 0);

const realRateChange$ = new Subject();
const nominalRateChange$ = new Subject();

const socialCostChange$ = new Subject<SocialCostType>();
const [useSocialCost] = bind(socialCostChange$);

// export {
// 	coalChange$,
// 	contractStartDateChange$,
// 	contractTermChange$,
// 	dataYearChange$,
// 	electricityChange$,
// 	gasChange$,
// 	inflationRateChange$,
// 	nominalRateChange$,
// 	oilChange$,
// 	realRateChange$,
// 	residualChange$,
// 	sectorChange$,
// 	socialCostChange$,
// 	stateChange$,
// 	totalChange$,
// 	zipCodeChange$,
// };

sectorChange$
	.pipe(
		filter((sector) => sector === SectorType.COMMERCIAL),
		map(() => 0),
	)
	.subscribe(coalChange$);

// const totalSum$ = combineLatest([coalChange$, oilChange$, electricityChange$, gasChange$, residualChange$]).pipe(
// 	map((arr) => arr.reduce((acc, sum) => acc + sum), 0),
// );

const totalSum$ = combineLatest([
	coalChange$.pipe(startWith(0)), // Default value for coal
	oilChange$.pipe(startWith(0)), // Default value for oil
	electricityChange$.pipe(startWith(0)), // Default value for electricity
	gasChange$.pipe(startWith(0)), // Default value for gas
	residualChange$.pipe(startWith(0)), // Default value for residual
]).pipe(
	map((arr) => arr.reduce((acc, sum) => acc + (sum || 0), 0)), // Ensure sum defaults to 0
);

stateChange$
	.pipe(
		switchMap((selectedState: StateType) => {
			if (selectedState !== StateType.State) {
				// @ts-expect-error unable to resolve type
				const zips: string[] = stateZips[selectedState];
				const firstZip: string = zips.length > 0 ? zips[0] : "";
				zipCodeChange$.next(firstZip);
			} else {
				zipCodeChange$.next(""); // Reset if no state is selected
			}
			return of(null); // Just to complete the observable
		}),
	)
	.subscribe();

const results$ = combineLatest([
	dataYearChange$.pipe(startWith(DataYearType.CURRENT)),
	sectorChange$.pipe(startWith(SectorType.INDUSTRIAL)),
	stateChange$,
	zipCodeChange$,
	coalChange$.pipe(startWith(0)),
	oilChange$.pipe(startWith(0)),
	electricityChange$.pipe(startWith(0)),
	gasChange$.pipe(startWith(0)),
	residualChange$.pipe(startWith(0)),
	totalSum$,
	contractStartDateChange$.pipe(startWith(2024)),
	contractTermChange$,
	socialCostChange$,
	inflationRateChange$.pipe(startWith(2.9)),
]).pipe(
	filter(([, , , , , , , , , totalSum, , , ,]) => totalSum === 100), // Filter to only allow calculations when totalSum equals 100
	map((inputs) => finalCalculations(inputs)),
);

results$.subscribe(console.log);

const stream$ = totalSum$.pipe(
	switchMap((sum) => {
		if (sum === 100) {
			return results$;
		} else {
			return of("Fix");
		}
	}),
);

stream$.subscribe(console.log);

const [useTotal, total$] = bind(totalSum$, 0);
const [useResults, result$] = bind(results$);

function Form() {
	const [realRate, setRealRate] = useState(0);
	const [nominalRate, setNominalRate] = useState(0);

	// const getZipcodes = (selectedState: string) => {
	// 	if (selectedState !== "None Selected") {
	// 		const zips = stateZips[selectedState];
	// 		const zipOptions = zips.reduce((acc: number, curr: number) => {
	// 			acc[curr] = curr;
	// 			return acc;
	// 		}, {});
	// 		return zipOptions;
	// 	}
	// 	return {};
	// };

	results$.subscribe(([escalationRate, nominalRate]) => {
		const EscalationRate = escalationRate;
		const NominalRate = nominalRate;
		setNominalRate(nominalRate);
		setRealRate(escalationRate);

		console.log("rates are", escalationRate, nominalRate);
	});

	return (
		<>
			<Navigation />
			<Space direction="vertical" className="py-12 px-36 w-full">
				<Space className="flex justify-center flex-col">
					<Title level={2}>NIST Energy Escalation Rate Calculator</Title>
					<Title level={5}>Data loaded through {currentYear}</Title>
					<Title level={4}>
						To use, complete all form fields. Computed results are shown immedately at the bottom of the page.
					</Title>
				</Space>
				<Content>
					<DividerComp heading={"Data & Fuel Rate Information"} title="tooltip" />
					<Space className="flex justify-center">
						<Dropdown
							className={"w-64"}
							options={Object.values(DataYearType)}
							defaultValue={useDataYear()}
							value$={dataYearChange$}
							wire={dataYearChange$}
							showSearch
							placeholder="Year of Data"
							tooltip="Year of data used to determine the escalation rate schedule applied to the energy cost calculation."
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select Sector"
							options={Object.values(SectorType)}
							value$={sectorChange$}
							wire={sectorChange$}
							showSearch
							defaultValue={SectorType.INDUSTRIAL}
							tooltip="Selection of commercial sector or industrial sector determines the escalation rate schedule applied to the energy cost calculation."
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select State"
							options={Object.values(StateType)}
							defaultValue={StateType.State}
							value$={stateChange$}
							wire={stateChange$}
							showSearch
							tooltip="Selecting the state in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by state)."
						/>
						{/* <Dropdown
						 	className={"w-64"}
						 	placeholder="Select Zipcode"
						 	options={Object.values(getZipcodes(useSelectedState()))}
						 	value$={zipCodeChange$}
						 	wire={zipCodeChange$}
						 	showSearch
						 	disabled={useSelectedState() === "None Selected" ? true : false}
						 	tooltip="Selecting the zipcode in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by zipcode)."
						 />*/}
					</Space>

					<DividerComp heading={"Percent of Energy Cost Savings"} title="tooltip" />
					<Space className="flex justify-center">
						{useSector() === SectorType.INDUSTRIAL ? (
							<NumberInput
								value$={coalChange$}
								wire={coalChange$}
								label="Coal"
								min={0}
								tooltip="Percentage of energy cost savings in dollars that is attributable to coal used in the project. This input is used to weight the escalation rate."
							/>
						) : (
							""
						)}
						<NumberInput
							value$={oilChange$}
							wire={oilChange$}
							label="Oil"
							min={0}
							tooltip="Percentage of energy cost savings in dollars that is attributable to oil used in the project. This input is used to weight the escalation rate."
						/>
						<NumberInput
							value$={electricityChange$}
							wire={electricityChange$}
							label="Electricity"
							min={0}
							tooltip="Percentage of energy cost savings in dollars that is attributable to electricity used in the project. This input is used to weight the escalation rate."
						/>
						<NumberInput
							value$={gasChange$}
							wire={gasChange$}
							label="Gas"
							min={0}
							tooltip="Percentage of energy cost savings in dollars that is attributable to gas used in the project. This input is used to weight the escalation rate."
						/>
						<NumberInput
							value$={residualChange$}
							wire={residualChange$}
							label="Residual"
							min={0}
							tooltip="Percentage of energy cost savings in dollars that is attributable to residual used in the project. This input is used to weight the escalation rate."
						/>
					</Space>
					<Space className="flex flex-col justify-center mt-5">
						<NumberInput
							value$={total$}
							label="Total"
							status={useTotal() !== 100 ? "error" : ""}
							readOnly
							tooltip="Percentage of total energy cost savings in dollars. This input is used to weight the escalation rate."
						/>
						{useTotal() !== 100 ? <p className="text-red-500">The total must equal 100.</p> : ""}
					</Space>

					<DividerComp heading={"Contract Term"} title="tooltip" />
					<Space className="flex justify-center">
						<Dropdown
							className={"w-64"}
							placeholder="Start Date"
							options={Object.values(ContractStartDateType)}
							value$={contractStartDateChange$}
							wire={contractStartDateChange$}
							showSearch
							tooltip="Year of contract award/signing"
						/>
						<NumberInput
							className={"w-28"}
							value$={contractTermChange$}
							wire={contractTermChange$}
							min={10}
							max={25}
							addOn={"years"}
							tooltip="Number of years of the contract term"
						/>
					</Space>

					<DividerComp
						heading={"Carbon Market Rate Assumptions"}
						title={`Determines the social cost of GHG emissions projection to use from the Interagency Working Group on Social Cost of Greenhouse Gasses Interim Estimates under Executive Order 13990. The scenarios are based on the assumed discount rate (DR) and projection percentile:
							- No Carbon Price assumes that no carbon policy is enacted (status quo)
							- Low - $20 in 2024 - 5% DR (average) = average social cost of GHG assuming a 5% real discount rate
							- Medium - $66 in 2024 - 3% DR (average) = average social cost of GHG assuming a 3% real discount rate. Best match to DOE and OMB real discount rates.
							- High - $198 in 2024 - 3% DR (95th percentile) = 95th Percentile social cost of GHG assuming a 3% real discount rate`}
					/>
					<Space className="flex justify-center">
						<Dropdown
							className={"w-64"}
							placeholder="Select Carbon Market Rate"
							options={Object.values(SocialCostType)}
							value$={socialCostChange$}
							wire={socialCostChange$}
							showSearch
							// tooltip={
						/>
					</Space>

					<DividerComp heading={"Annual Inflation Rate"} title="tooltip" />
					<NumberInput
						value$={inflationRateChange$}
						wire={inflationRateChange$}
						min={0}
						defaultValue={2.9}
						tooltip="The general rate of inflation for the nominal discount rate calculation. The default rate of inflation is the long-term inflation rate calculated annually by DOE/FEMP using data from CEA and the method described in 10 CFR 436 without consideration of the 3.0 % floor for the real discount rate."
					/>

					<DividerComp heading={"Annual Energy Escalation Rate"} title="tooltip" />
					<Space className="flex flex-col justify-center">
						<Space>
							<Statistic
								className="p-1 mr-2 rounded-md text-center ring-2 ring-black ring-offset-2 w-24"
								title="Real Rate"
								value={realRate.toFixed(2)}
								suffix="%"
							/>
							<Statistic
								className="p-1 ml-2 rounded-md text-center ring-2 ring-black ring-offset-2 w-24"
								title="Nominal Rate"
								value={nominalRate.toFixed(2)}
								suffix="%"
							/>
						</Space>

						<Space>
							<Button className="mt-2" icon={<FilePdfOutlined />}>
								Save to PDF
							</Button>
						</Space>
					</Space>
				</Content>
			</Space>
			<Footer style={{ backgroundColor: "rgb(46, 46, 46)" }}>
				<Disclaimer />
			</Footer>
		</>
	);
}

export default Form;
