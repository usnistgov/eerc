import { Layout, Space, Typography } from "antd";

import { SectorType, SocialCostType, StateType, currentYear } from "../data/Formats";
import { Model } from "../data/Model";
import Disclaimer from "./Disclaimer";
import DividerComp from "./Divider";
import dropdown from "./Dropdown";
import Navigation from "./Navigation";
import inputNumber from "./NumberInput";

const { Content, Footer } = Layout;
const { Title } = Typography;

const { change$: dataYearChange$, component: DataYear } = dropdown(
	Object.values({ current: currentYear, prev: currentYear - 1 }),
	Model.dataYearType$,
);
const { change$: sectorChange$, component: Sector } = dropdown(Object.values(SectorType), Model.sectorType$);
const { change$: stateChange$, component: State } = dropdown(Object.values(StateType), Model.socialCostCarbonType$);
const { change$: zipcodeChange$, component: Zipcode } = dropdown(
	Object.values(SocialCostType),
	Model.socialCostCarbonType$,
);

const { onChange$: coalChange$, component: Coal } = inputNumber(Model.coal$);
const { onChange$: oilChange$, component: Oil } = inputNumber(Model.oil$);
const { onChange$: electricityChange$, component: Electricity } = inputNumber(Model.electricity$);
const { onChange$: gasChange$, component: Gas } = inputNumber(Model.gas$);
const { onChange$: residualChange$, component: Residual } = inputNumber(Model.residual$);
const { onChange$: totalChange$, component: Total } = inputNumber(Model.total$);

const { change$: contractStartDateChange$, component: ContractStartDate } = dropdown(
	Object.values({
		current: currentYear,
		current1: currentYear + 1,
		current2: currentYear + 2,
		current3: currentYear + 3,
	}),
	Model.contractStartDateType$,
);

const { onChange$: contractTermChange$, component: ContractTermDuration } = inputNumber(Model.contractTermDuration$);

const { change$: socialCostChange$, component: SocialCostCarbon } = dropdown(
	Object.values(SocialCostType),
	Model.socialCostCarbonType$,
);

const { onChange$: inflationRateChange$, component: AnnualInflationRate } = inputNumber(Model.annualInflationRate$);

const { onChange$: realRateChange$, component: RealRate } = inputNumber(Model.realRate$);
const { onChange$: nominalRateChange$, component: NominalRate } = inputNumber(Model.nominalRate$);

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
	zipcodeChange$,
};

function Form() {
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
						<DataYear placeholder="Year of Data" />
						<Sector placeholder="Select Sector" />
						<State placeholder="Select State" />
						<Zipcode placeholder="Select Zipcode" />
					</Space>

					<DividerComp heading={"Percent of Energy Cost Savings"} title="tooltip" />
					<Space className="flex justify-center">
						<Coal label="Coal" min={0} />
						<Oil label="Oil" min={0} />
						<Electricity label="Electricity" min={0} />
						<Gas label="Gas" min={0} />
						<Residual label="Residual" min={0} />
					</Space>
					<Space className="flex justify-center mt-5">
						<Total label="Total" min={0} status="error" />
					</Space>

					<DividerComp heading={"Contract Term"} title="tooltip" />
					<Space className="flex justify-center">
						<ContractStartDate placeholder="Start Date" />
						<ContractTermDuration min={0} addOn={"years"} className="w-28" />
					</Space>

					<DividerComp heading={"Social Cost of Carbon Assumptions"} title="tooltip" />
					<Space className="flex justify-center">
						<SocialCostCarbon placeholder="Select Social Cost of Carbon" />
					</Space>

					<DividerComp heading={"Annual Inflation Rate"} title="tooltip" />
					<AnnualInflationRate min={0} defaultValue={2.9} />

					<DividerComp heading={"Annual Energy Escalation Rate"} title="tooltip" />
					<Space className="flex justify-center">
						<RealRate label="Real" readOnly />
						<NominalRate label="Nominal" readOnly />
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
