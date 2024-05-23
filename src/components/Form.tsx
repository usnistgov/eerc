import { FilePdfOutlined } from "@ant-design/icons";
import { Button, Layout, Space, Statistic, Typography } from "antd";

import { bind } from "@react-rxjs/core";
import { BehaviorSubject, Subject, combineLatest, filter, map, of, switchMap } from "rxjs";
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

const zipCodeChange$ = new Subject<SocialCostType>();
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

export {
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
};

// const getSumArr = (sector$: Observable<SectorType>) => {
// 	return sector$.pipe(
// 		map((sector) => {
// 			if (sector === SectorType.INDUSTRIAL) {
// 				return [coalChange$, oilChange$, electricityChange$, gasChange$, residualChange$];
// 			} else {
// 				return [oilChange$, electricityChange$, gasChange$, residualChange$];
// 			}
// 		}),
// 	);
// };

sectorChange$
	.pipe(
		filter((sector) => sector === SectorType.COMMERCIAL),
		map(() => 0),
	)
	.subscribe(coalChange$);

const totalSum$ = combineLatest([coalChange$, oilChange$, electricityChange$, gasChange$, residualChange$]).pipe(
	map((arr) => arr.reduce((acc, sum) => acc + sum), 0),
);

const results$ = combineLatest([
	dataYearChange$,
	sectorChange$,
	stateChange$,
	zipCodeChange$,
	coalChange$,
	oilChange$,
	electricityChange$,
	gasChange$,
	residualChange$,
	totalSum$,
	contractStartDateChange$,
	contractTermChange$,
	socialCostChange$,
	inflationRateChange$,
]).pipe(map((inputs) => finalCalculations(inputs)));

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
	// const calculateCarbonPrice = useCallback(
	// 	(CO2Factor: number, cP: number[], isElectricity: boolean, baseyear: number) => {
	// 		//console.log("calculateCarbonPrice: isElec=%o baseyear=%d CO2Factor=%o cP=%o CO2ePrices[%s]=%o", isElectricity, baseyear, CO2Factor, cP, carbonprice, CO2ePrices[carbonprice]);
	// 		//console.log("calculateCarbonPrice: CO2FutureEmissions[%s] = %o", locale, CO2FutureEmissions[locale]);
	// 		//console.log("calculateCarbonPrice: CO2FutureEmissions[%s][%s] = %o", locale, baseyear, CO2FutureEmissions[locale][baseyear]);
	// 		// if (carbonprice !== "") {
	// 		if (carbonprice !== SocialCostType.NONE) {
	// 			// default, low, or high carbon price
	// 			if (carbonprices[carbonprice] !== zero_carbon_price_policy) {
	// 				for (let i = 0; i < yearsIn; i++) {
	// 					cP[i] = CO2ePrices[carbonprices[carbonprice]][i + baseyear] * CO2Factor;
	// 				} // steps 1 & 2 from Excel file
	// 				if (isElectricity) {
	// 					for (let i = 0; i < yearsIn; i++) {
	// 						//SWB 2022: change from index by CPP and year to index by state and year
	// 						//SWB 2022 cP[i] = cP[i] * CO2FutureEmissions[carbonprices[carbonprice]][i + baseyear];
	// 						cP[i] = cP[i] * CO2FutureEmissions[locale][i + baseyear];
	// 					}
	// 				} // step 3
	// 				for (let i = 0; i < yearsIn; i++) {
	// 					cP[i] = cP[i] * carbonConvert;
	// 				} // step 4
	// 			}
	// 		}
	// 		//console.log("exiting calculateCarbonPrice");
	// 	},
	// 	[carbonprice, CO2ePrices, CO2FutureEmissions, locale],
	// );

	const getZipcodes = (selectedState: string) => {
		if (selectedState !== "None Selected") {
			const zips = stateZips[selectedState];
			const zipOptions = zips.reduce((acc: number, curr: number) => {
				acc[curr] = curr;
				return acc;
			}, {});
			return zipOptions;
		}
		return {};
	};

	// use combine latest and then pass it to finalcalculations

	// useEffect(() => {
	// 	if (totalEnergySavings === 100) finalCalculations();
	// }, []);

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
						<Dropdown
							className={"w-64"}
							placeholder="Select Zipcode"
							options={Object.values(getZipcodes(useSelectedState()))}
							value$={zipCodeChange$}
							wire={zipCodeChange$}
							showSearch
							disabled={useSelectedState() === "None Selected" ? true : false}
							tooltip="Selecting the zipcode in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by zipcode)."
						/>
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

					<DividerComp heading={"Social Cost of Carbon Assumptions"} title="tooltip" />
					<Space className="flex justify-center">
						<Dropdown
							className={"w-64"}
							placeholder="Select Social Cost of Carbon"
							options={Object.values(SocialCostType)}
							value$={socialCostChange$}
							wire={socialCostChange$}
							showSearch
							tooltip={`Determines the social cost of GHG emissions projection to use from the Interagency Working Group on Social Cost of Greenhouse Gasses Interim Estimates under Executive Order 13990. The scenarios are based on the assumed discount rate (DR) and projection percentile:
							- No Carbon Price assumes that no carbon policy is enacted (status quo)
							- Low - $20 in 2024 - 5% DR (average) = average social cost of GHG assuming a 5% real discount rate
							- Medium - $66 in 2024 - 3% DR (average) = average social cost of GHG assuming a 3% real discount rate. Best match to DOE and OMB real discount rates.
							- High - $198 in 2024 - 3% DR (95th percentile) = 95th Percentile social cost of GHG assuming a 3% real discount rate`}
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
							{/* <NumberInput
							value$={realRateChange$}
							wire={realRateChange$}
							label="Real"
							readOnly
							tooltip="The calculated average escalation rate in real terms (excluding the rate of inflation). Estimated using the energy prices for the sector, fuel mix, and location."
						/> */}
							<Statistic
								className="p-1 mr-2 rounded-md text-center ring-2 ring-black ring-offset-2 w-24"
								title="Real Rate"
								value={5}
								suffix="%"
							/>
							<Statistic
								className="p-1 ml-2 rounded-md text-center ring-2 ring-black ring-offset-2 w-24"
								title="Nominal Rate"
								value={5}
								suffix="%"
							/>
							{/* <NumberInput
							value$={nominalRateChange$}
							wire={nominalRateChange$}
							label="Nominal"
							readOnly
							tooltip="The calculated average escalation rate in nominal terms (including the rate of inflation).  Calculated using the real escalation rate and input inflation rate."
						/> */}
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
