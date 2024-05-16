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
import { Model } from "../data/Model";
import Disclaimer from "./Disclaimer";
import DividerComp from "./Divider";
import { Dropdown } from "./Dropdown";
import Navigation from "./Navigation";
import inputNumber from "./NumberInput";

const { Content, Footer } = Layout;
const { Title } = Typography;

const { onChange$: coalChange$, component: Coal } = inputNumber(Model.coal$);
const { onChange$: oilChange$, component: Oil } = inputNumber(Model.oil$);
const { onChange$: electricityChange$, component: Electricity } = inputNumber(Model.electricity$);
const { onChange$: gasChange$, component: Gas } = inputNumber(Model.gas$);
const { onChange$: residualChange$, component: Residual } = inputNumber(Model.residual$);
const { onChange$: totalChange$, component: Total } = inputNumber(Model.total$);

const { onChange$: contractTermChange$, component: ContractTermDuration } = inputNumber(Model.contractTermDuration$);

const { onChange$: inflationRateChange$, component: AnnualInflationRate } = inputNumber(Model.annualInflationRate$);

const { onChange$: realRateChange$, component: RealRate } = inputNumber(Model.realRate$);
const { onChange$: nominalRateChange$, component: NominalRate } = inputNumber(Model.nominalRate$);

const dataYearChange$ = new Subject<typeof DataYearType>();
const sectorChange$ = new Subject<SectorType>();
const stateChange$ = new Subject<StateType>();
const zipCodeChange$ = new Subject<SocialCostType>();

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
	const [sectorType, setSectorType] = useState<"Industrial" | "">("Industrial");
	useEffect(() => {
		sectorChange$.subscribe((sector) => {
			setSectorType(sector === "Industrial" ? "Industrial" : "");
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
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select Sector"
							options={Object.values(SectorType)}
							value$={sectorChange$}
							wire={sectorChange$}
							showSearch
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select State"
							options={Object.values(StateType)}
							value$={stateChange$}
							wire={stateChange$}
							showSearch
						/>
						<Dropdown
							className={"w-64"}
							placeholder="Select Zipcode"
							options={Object.values(SocialCostType)}
							value$={zipCodeChange$}
							wire={zipCodeChange$}
							showSearch
						/>
					</Space>

					<DividerComp heading={"Percent of Energy Cost Savings"} title="tooltip" />
					<Space className="flex justify-center">
						{sectorType === "Industrial" ? <Coal label="Coal" min={0} /> : ""}
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
						<Dropdown
							className={"w-64"}
							placeholder="Start Date"
							options={Object.values(ContractStartDateType)}
							value$={contractStartDateChange$}
							wire={contractStartDateChange$}
							showSearch
						/>
						<ContractTermDuration min={0} addOn={"years"} className="w-28" />
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
						/>
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
