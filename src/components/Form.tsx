import { Layout, Space, Typography } from "antd";

import { useEffect, useState } from "react";
import { Subject } from "rxjs";
import {
	ContractStartDateType,
	DataYearType,
	SectorType,
	SocialCostType,
	StateType,
	currentYear,
} from "../data/Formats";
import Disclaimer from "./Disclaimer";
import DividerComp from "./Divider";
import Dropdown from "./Dropdown";
import Navigation from "./Navigation";
import NumberInput from "./NumberInput";

const { Content, Footer } = Layout;
const { Title } = Typography;

const dataYearChange$ = new Subject<typeof DataYearType>();
const sectorChange$ = new Subject<SectorType>();
const stateChange$ = new Subject<StateType>();
const zipCodeChange$ = new Subject<SocialCostType>();

const coalChange$ = new Subject();
const oilChange$ = new Subject();
const electricityChange$ = new Subject();
const gasChange$ = new Subject();
const residualChange$ = new Subject();
const totalChange$ = new Subject();

const contractTermChange$ = new Subject();
const inflationRateChange$ = new Subject();
const realRateChange$ = new Subject();
const nominalRateChange$ = new Subject();

const socialCostChange$ = new Subject<SocialCostType>();
const contractStartDateChange$ = new Subject<typeof ContractStartDateType>();
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

function Form() {
	const [sectorType, setSectorType] = useState<"Industrial" | "Commercial">("Industrial");
	useEffect(() => {
		sectorChange$.subscribe((sector) => {
			setSectorType(sector === "Industrial" ? "Industrial" : "Commercial");
		});
	}, [sectorType]);
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
							value$={stateChange$}
							wire={stateChange$}
							showSearch
							tooltip="Selecting the state in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by state)."
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select Zipcode"
							options={Object.values(SocialCostType)}
							value$={zipCodeChange$}
							wire={zipCodeChange$}
							showSearch
							tooltip="Selecting the zipcode in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by zipcode)."
						/>
					</Space>

					<DividerComp heading={"Percent of Energy Cost Savings"} title="tooltip" />
					<Space className="flex justify-center">
						{sectorType === "Industrial" ? (
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
					<Space className="flex justify-center mt-5">
						<NumberInput
							value$={totalChange$}
							wire={totalChange$}
							label="Total"
							status="error"
							readOnly
							tooltip="Percentage of total energy cost savings in dollars. This input is used to weight the escalation rate."
						/>
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
							value$={contractTermChange$}
							wire={contractTermChange$}
							min={0}
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
					<Space className="flex justify-center">
						<NumberInput
							value$={realRateChange$}
							wire={realRateChange$}
							label="Real"
							readOnly
							tooltip="The calculated average escalation rate in real terms (excluding the rate of inflation). Estimated using the energy prices for the sector, fuel mix, and location."
						/>
						<NumberInput
							value$={nominalRateChange$}
							wire={nominalRateChange$}
							label="Nominal"
							readOnly
							tooltip="The calculated average escalation rate in nominal terms (including the rate of inflation).  Calculated using the real escalation rate and input inflation rate."
						/>
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
