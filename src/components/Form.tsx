import { Divider, Layout, Space, Typography } from "antd";

import { SectorType, SocialCostType } from "../data/Formats";
import { Model } from "../data/Model";
import Disclaimer from "./Disclaimer";
import dropdown from "./Dropdown";
import Navigation from "./Navigation";
import inputNumber from "./NumberInput";

const { Content, Footer } = Layout;
const { Title } = Typography;

const { change$: dataYearChange$, component: DataYear } = dropdown(
	Object.values(SocialCostType),
	Model.socialCostCarbonType$,
);
const { change$: sectorChange$, component: Sector } = dropdown(Object.values(SectorType), Model.sectorType$);
const { change$: stateChange$, component: State } = dropdown(
	Object.values(SocialCostType),
	Model.socialCostCarbonType$,
);
const { change$: zipcodeChange$, component: Zipcode } = dropdown(
	Object.values(SocialCostType),
	Model.socialCostCarbonType$,
);

const { onChange$: coalChange$, component: Coal } = inputNumber(Model.coal$);
const { onChange$: oilChange$, component: Oil } = inputNumber(Model.oil$);
const { onChange$: electricityChange$, component: Electricity } = inputNumber(Model.electricity$);
const { onChange$: gasChange$, component: Gas } = inputNumber(Model.gas$);
const { onChange$: residualChange$, component: Residual } = inputNumber(Model.residual$);

const { change$: contractStartDateChange$, component: ContractStartDate } = dropdown(
	Object.values(SocialCostType),
	Model.socialCostCarbonType$,
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
	zipcodeChange$,
};

function Form() {
	return (
		<>
			<Navigation />
			<Space direction="vertical" className="py-12 px-36 w-full">
				<Space className="flex justify-center flex-col">
					<Title level={2}>NIST Energy Escalation Rate Calculator</Title>
					<Title level={5}>(Loaded 2024 dataset) </Title>
					<Title level={4}>
						To use, complete all form fields. Computed results are shown immedately at the bottom of the page.
					</Title>
				</Space>
				<Content>
					<Divider>Data & Fuel Rate Information</Divider>
					<Space className="flex justify-center">
						<DataYear placeholder="Year of Data" />
						<Sector placeholder="Select Sector" />
						<State placeholder="Select State" />
						<Zipcode placeholder="Select Zipcode" />
					</Space>

					<Divider>Percent of Energy Cost Savings</Divider>
					<Space className="flex justify-center">
						<Coal label="Coal" min={0} />
						<Oil label="Oil" min={0} />
						<Electricity label="Electricity" min={0} />
						<Gas label="Gas" min={0} />
						<Residual label="Resicual" min={0} />
					</Space>

					<Divider>Contract Term</Divider>
					<Space className="flex justify-center">
						<ContractStartDate placeholder="Start Date" />
						<ContractTermDuration min={0} />
					</Space>

					<Divider>Social Cost of Carbon Assumptions</Divider>
					<Space className="flex justify-center">
						<SocialCostCarbon placeholder="Select Social Cost of Carbon" />
					</Space>

					<Divider>Annual Inflation Rate</Divider>
					<AnnualInflationRate min={0} defaultValue={2.9} />

					<Divider>Annual Energy Escalation Rate</Divider>
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
