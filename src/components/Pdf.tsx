import { Document, Image, Page, Text, View } from "@react-pdf/renderer";

import DisplayField from "./pdf-components/DisplayField";
import NISTHeader from "./pdf-components/NISTHeader";
import PdfDisclaimer from "./pdf-components/PdfDisclaimer";
import { styles } from "./pdf-components/pdfStyles";
import Title from "./pdf-components/Title";

const Pdf = (props: {
	dataYear: number;
	sector: string;
	location: { state: string; zipcode: string };
	sources: { coal: number; oil: number; electricity: number; gas: number; residual: number };
	contract: { contractDate: number; contractTerm: number };
	// socialCost: string;
	inflationRate: number;
	rates: { real: number; nominal: number };
}) => {
	const { dataYear, sector, location, sources, contract, /*socialCost,*/ inflationRate, rates } = props;
	const nistLogo =
		"data:image/png;base64,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";

	return (
		<Document>
			<Page style={styles.page} size="LETTER">
				<NISTHeader />
				<View style={styles.header}>
					<Image style={styles.logo} src={nistLogo} />
					<Text style={styles.eerc}>NIST Energy Escalation Rate Calulator (EERC)</Text>
					<Text style={styles.date}>
						Report Generated: {`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
					</Text>
					<br />
				</View>
				<View style={styles.section}>
					<Title title={"Input Parameters"} />
					<View style={{ marginLeft: 75 }}>
						<DisplayField styles={{ ...styles.key, marginTop: 5 }} label={"Data Release Year"} value={dataYear} />
						<DisplayField styles={styles.key} label="Sector" value={sector} />
						<DisplayField styles={styles.key} label="State" value={location.state} />
						{/* uncomment when zipcode selection is added */}
						{/* <br />
						{location.zipcode ? (
							<DisplayField styles={styles.key} label="Zipcode" value={location.zipcode} />
						) : null} */}
						<br />
						<View style={{ ...styles.container, margin: 0 }}>
							<DisplayField styles={styles.key} label="Percent of Energy Cost Savings" value="" />
							<View style={{ ...styles.section, marginBottom: 0, paddingLeft: 25, paddingBottom: 0, paddingTop: 0 }}>
								{sources.coal && <DisplayField styles={styles.key} label="Coal" value={`${sources.coal}%`} />}
								{sources.oil && <DisplayField styles={styles.key} label="Distillate Oil" value={`${sources.oil}%`} />}
								{sources.electricity && (
									<DisplayField styles={styles.key} label="Electricity" value={`${sources.electricity}%`} />
								)}
								{sources.gas && <DisplayField styles={styles.key} label="Natural Gas" value={`${sources.gas}%`} />}
								{sources.residual && (
									<DisplayField styles={styles.key} label="Residual" value={`${sources.residual}%`} />
								)}
							</View>
						</View>
						<View style={{ ...styles.container, margin: 0 }}>
							<DisplayField styles={styles.key} label="Contract Start Date" value={contract.contractDate} />
							<br />
							<DisplayField styles={styles.key} label="Contract Term" value={`${contract.contractTerm} years(s)`} />
							<br />
							{/* uncomment when scc is added back */}
							{/* <DisplayField styles={styles.key} label="Carbon Market Rate Assumptions" value={socialCost} />
								<br/> */}
							<DisplayField styles={styles.key} label="Annual Inflation Rate" value={`${inflationRate}%`} />
						</View>
					</View>

					<Title title={"Results"} />
					<View style={{ marginLeft: 75 }}>
						<DisplayField
							styles={{ ...styles.key, marginTop: 5 }}
							label="Real Rate"
							value={`${rates.real.toFixed(2)}%`}
						/>
						<br />
						<DisplayField styles={styles.key} label="Nominal Rate" value={`${rates.nominal.toFixed(2)}%`} />
						<br />
					</View>
					<PdfDisclaimer />
				</View>
			</Page>
		</Document>
	);
};

export default Pdf;
