import { Divider, Layout, Space, Typography } from "antd";
import Disclaimer from "./Disclaimer";
import AnnualEscalationRate from "./components/AnnualEscalationRate";
import AnnualInflation from "./components/AnnualInflation";
import ContractTerm from "./components/ContractTerm";
import EnergyCostSavings from "./components/EnergyCostSavings";
import FuelRateInfo from "./components/FuelRateInfo";
import Navigation from "./components/Navigation";
import SocialCostCarbon from "./components/SocialCostCarbon";

import "./assets/nist-header-footer-v-2.0";
import "./assets/styles/nist-combined.css";
import "./index.css";

const { Content, Footer } = Layout;
const { Title } = Typography;

function App() {
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
					<Divider>Date & Fuel Rate Information</Divider>
					<FuelRateInfo />
					<Divider>Percent of Energy Cost Savings</Divider>
					<EnergyCostSavings />
					<Divider>Contract Term</Divider>
					<ContractTerm />
					<Divider>Social Cost of Carbon Assumptions</Divider>
					<SocialCostCarbon />
					<Divider>Annual Inflation Rate</Divider>
					<AnnualInflation />
					<Divider>Annual Energy Escalation Rate</Divider>
					<AnnualEscalationRate />
				</Content>
			</Space>
			<Footer style={{ backgroundColor: "rgb(46, 46, 46)" }}>
				<Disclaimer />
			</Footer>
		</>
	);
}

export default App;
