import { Layout, Menu, Space, Typography } from "antd";
import Disclaimer from "./Disclaimer";
import "./assets/nist-header-footer-v-2.0";
import "./assets/styles/nist-combined.css";
import AnnualEscalationRate from "./components/AnnualEscalationRate";
import AnnualInflation from "./components/AnnualInflation";
import ContractTerm from "./components/ContractTerm";
import EnergyCostSavings from "./components/EnergyCostSavings";
import FuelRateInfo from "./components/FuelRateInfo";
import Navigation from "./components/Navigation";
import SocialCostCarbon from "./components/SocialCostCarbon";
import "./index.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const menuItems = [
	{ key: "home", label: "Home" },
	{ key: "blcc", label: "BLCC" },
];

function App() {
	return (
		<>
			<Navigation />
			<Title level={2}>NIST Energy Escalation Rate Calculator</Title>
			<Title level={5}>(Loaded 2024 dataset) </Title>
			<Title level={4}>
				To use, complete all form fields. Computed results are shown immedately at the bottom of the page.
			</Title>
			<Content className="p-5" style={{ padding: 50 }}>
				<FuelRateInfo />
				<EnergyCostSavings />
				<ContractTerm />
				<SocialCostCarbon />
				<AnnualInflation />
				<AnnualEscalationRate />
			</Content>
			<Footer style={{ backgroundColor: "rgb(46, 46, 46)" }}>
				<Disclaimer />
			</Footer>
		</>
	);
}

export default App;
