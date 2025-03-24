// @ts-nocheck
import { FilePdfOutlined } from "@ant-design/icons";
import { pdf } from "@react-pdf/renderer";
import { Button, Layout, Space, Typography } from "antd";
import Pdf from "./Pdf";
import "./styles.css";

import {
	BehaviorSubject,
	Subject,
	combineLatest,
	filter,
	map,
	mergeMap,
	of,
	startWith,
	switchMap,
	tap,
	withLatestFrom,
} from "rxjs";
import {
	ContractStartDateType,
	DataYearType,
	SectorType,
	// SocialCostType, - uncomment when scc is added back
	StateType,
	currentYear,
} from "../data/Formats";
import stateZips from "../data/statetozip.json";

import { finalCalculations } from "../Calculations/Calculations";

import { useCallback, useEffect } from "react";
import { Coal } from "./Coal";
import { CostSavingsTotal } from "./CostSavingsTotal";
import Disclaimer from "./Disclaimer";
import DividerComp from "./Divider";
import Dropdown from "./Dropdown";
import Navigation from "./Navigation";
import NumberInput from "./NumberInput";
import RatesDisplay from "./RatesDisplay";

const { Content, Footer } = Layout;
const { Title } = Typography;

const dataYearChange$ = new BehaviorSubject<number>(DataYearType.CURRENT);
const sectorChange$ = new Subject<SectorType>();
const stateChange$ = new Subject<StateType>();
const zipCodeChange$ = new Subject<string>();

const coalChange$ = new BehaviorSubject(0);
const oilChange$ = new BehaviorSubject(0);
const electricityChange$ = new BehaviorSubject(0);
const gasChange$ = new BehaviorSubject(0);
const residualChange$ = new BehaviorSubject(0);

const contractTermChange$ = new BehaviorSubject<number>(10);
const contractStartDateChange$ = new BehaviorSubject<number>(ContractStartDateType.CURRENT);

// const socialCostChange$ = new Subject<SocialCostType>(); - uncomment when scc is added back

const inflationRateChange$ = new BehaviorSubject(2.9);

const realRate$ = new Subject<number>();
const nominalRate$ = new Subject<number>();

// uncomment when scc is added back
// const socialCostChange$ = new Subject<SocialCostType>();

sectorChange$
	.pipe(
		filter((sector) => sector === SectorType.COMMERCIAL),
		map(() => 0),
	)
	.subscribe(coalChange$);

dataYearChange$
	.pipe(
		mergeMap((dataYear) => {
			if (dataYear === DataYearType.CURRENT) {
				return [2.9];
			} else if (dataYear === DataYearType.PREVIOUS) {
				return [2.3];
			} else {
				return [2.9]; // defaults to 2.9
			}
		}),
	)
	.subscribe(inflationRateChange$);

const totalSum$ = combineLatest([coalChange$, oilChange$, electricityChange$, gasChange$, residualChange$]).pipe(
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
	sectorChange$,
	stateChange$,
	zipCodeChange$,
	coalChange$.pipe(startWith(0)),
	oilChange$.pipe(startWith(0)),
	electricityChange$.pipe(startWith(0)),
	gasChange$.pipe(startWith(0)),
	residualChange$.pipe(startWith(0)),
	totalSum$.pipe(startWith(0)),
	contractStartDateChange$.pipe(startWith(2024)),
	contractTermChange$.pipe(startWith(10)),
	// socialCostChange$.pipe(startWith(SocialCostType.NONE)), - uncomment when scc is added back
	inflationRateChange$,
]).pipe(
	tap((inputs) => {
		console.log(inputs);
		const totalSum = inputs[9]; // totalSum is the 10th element in the inputs array
		if (totalSum !== 100) {
			console.log("calculations not done");
		}
	}),
	map((inputs) => finalCalculations(inputs)),
);

const pdfClick$ = new Subject<void>();

function Form() {
	// uncomment when zipcode selection is added
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

	useEffect(() => {
		const subscription = results$.subscribe(([realRate, nominalRate]) => {
			realRate$.next(realRate); // Emit the real rate
			nominalRate$.next(nominalRate); // Emit the nominal rate
		});

		// Cleanup function to unsubscribe
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const generatePdf = useCallback(
		(
			_: undefined,
			dataYear: string,
			sector: string,
			location: { state: string; zipcode: string },
			sources: { coal: string; oil: string; electricity: string; gas: string; residual: string },
			contract: { contractDate: string; contractTerm: string },
			// socialCost: string,
			inflationRate: number,
		) => {
			console.log("pdf");
			const blob = pdf(
				<Pdf
					dataYear={dataYear}
					sector={sector}
					location={location}
					sources={sources}
					contract={contract}
					// socialCost={socialCost}
					inflationRate={inflationRate}
				/>,
			).toBlob();

			blob.then((blob: Blob | MediaSource) => {
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `EERC Report.pdf`;
				link.click();
			});
		},
		[],
	);

	useSubscribe(
		pdfClick$.pipe(
			withLatestFrom(
				dataYearChange$,
				sectorChange$,
				stateChange$,
				// zipCodeChange$,
				coalChange$,
				oilChange$,
				electricityChange$,
				gasChange$,
				residualChange$,
				contractStartDateChange$,
				contractTermChange$,
				// socialCostChange$,
				inflationRateChange$,
			),
		),
		([
			_,
			dataYear,
			sector,
			state,
			// zipcode,
			coal,
			oil,
			electricity,
			gas,
			residual,
			contractDate,
			contractTerm,
			// socialCost,
			inflationRate,
		]) => {
			console.log("clicked");
			console.log("Data for PDF:", {
				dataYear,
				sector,
				state,
				// zipcode,
				coal,
				oil,
				electricity,
				gas,
				residual,
				contractDate,
				contractTerm,
				// socialCost,
				inflationRate,
			});
			generatePdf(
				_,
				dataYear,
				sector,
				{ state, zipcode: "100001" },
				{ coal, oil, electricity, gas, residual },
				{ contractDate, contractTerm },
				// socialCost,
				inflationRate,
			);
		},
		[],
	);

	return (
		<>
			<Navigation />
			<Space direction="vertical" className="py-12 px-36 w-full light-gray">
				<Space className="flex justify-center flex-col blue header">
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
							value$={dataYearChange$}
							wire={dataYearChange$}
							showSearch
							defaultValue={DataYearType.CURRENT}
							placeholder="Year of Data"
							tooltip="Year of data used to determine the escalation rate schedule applied to the energy cost calculation."
							label="Data Release Year"
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select Sector"
							options={Object.values(SectorType)}
							value$={sectorChange$}
							wire={sectorChange$}
							showSearch
							defaultValue={SectorType.NONE}
							tooltip="Selection of commercial sector or industrial sector determines the escalation rate schedule applied to the energy cost calculation."
							label="Sector"
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
							label="State"
						/>
						{/* uncomment when zipcode selection is added
							<Dropdown
						 	className={"w-64"}
						 	placeholder="Select Zipcode"
						 	options={Object.values(getZipcodes(useSelectedState()))}
						 	value$={zipCodeChange$}
						 	wire={zipCodeChange$}
						 	showSearch
						 	disabled={useSelectedState() === "None Selected" ? true : false}
						 	tooltip="Selecting the zipcode in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by zipcode)."
							label="Zipcode"
						 	/>*/}
					</Space>

					<DividerComp heading={"Percent of Energy Cost Savings"} title="tooltip" />
					<Space className="flex justify-center">
						<Coal coal$={coalChange$} sector$={sectorChange$} />
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
					<CostSavingsTotal totalSum$={totalSum$} />

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
							label="Contract Start Date"
						/>
						<NumberInput
							className={"w-28"}
							value$={contractTermChange$}
							wire={contractTermChange$}
							min={10}
							max={25}
							addOn={"years"}
							tooltip="Number of years of the contract term"
							label="Duration"
							defaultValue={10}
						/>
					</Space>

					{/* uncomment when scc is added back */}
					{/* <DividerComp
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
					</Space> */}

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
							<RatesDisplay title="Real Rate" displayValue$={realRate$} />
							<RatesDisplay title="Nominal Rate" displayValue$={nominalRate$} />
						</Space>

						<Space>
							<Button
								className="mt-2 blue"
								icon={<FilePdfOutlined />}
								onClick={() => {
									pdfClick$.next();
								}}
							>
								Save Report (PDF)
							</Button>
						</Space>
					</Space>
				</Content>
			</Space>
			<Footer className="footer">
				<Disclaimer />
			</Footer>
		</>
	);
}

export default Form;
