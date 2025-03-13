import { Document, Image, Page, Text, View } from "@react-pdf/renderer";

import NISTHeader from "./pdf-components/NISTHeader";
// import PageNumber from "./pdf-components/PageNumber";
// import PdfDisclaimer from "./pdf-components/PdfDisclaimer";
import { styles } from "./pdf-components/pdfStyles";

const Pdf = (props: {
	dataYear: string;
	sector: string;
	location: { state: string; zipcode: string };
	sources: { coal: string; oil: string; electricity: string; gas: string; residual: string };
	contract: { contractDate: string; contractTerm: string };
	socialCost: string;
	inflationRate: number;
}) => {
	const { dataYear, sector, location, sources, contract, socialCost, inflationRate } = props;

	console.log(dataYear, sector, location, sources, contract, socialCost, inflationRate);

	return (
		<Document>
			<Page style={styles.page} size="LETTER">
				<NISTHeader />
				<View style={styles.blccHeader}>
					<Image style={styles.logo} src="../public/logo.png" />
					<Text style={styles.date}>
						Report Generated: {`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
					</Text>
				</View>
				<View style={styles.section}>
					<View style={styles.key}>
						<Text style={styles.text}>Year of Data:&nbsp;</Text>
						<Text style={styles.value}>{dataYear}</Text>
					</View>
					<View style={styles.key}>
						<Text style={styles.text}>Sector:&nbsp;</Text>
						<Text style={styles.value}>{sector}</Text>
					</View>
					<View style={styles.key}>
						<Text style={styles.text}>State:&nbsp;</Text>
						<Text style={styles.value}>{location.state}</Text>
					</View>
					<br />
					{location.zipcode ? (
						<View style={styles.key}>
							<Text style={styles.text}>Zipcode:&nbsp;</Text>
							<Text style={styles.value}>{location.zipcode}</Text>
							<br />
						</View>
					) : null}
					<br />
					<View style={{ ...styles.container, margin: 0 }}>
						<View style={styles.key}>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Coal:&nbsp;</Text>
								<Text style={styles.value}>{sources.coal} %</Text>
							</View>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Distillate Oil:&nbsp;</Text>
								<Text style={styles.value}>{sources.oil} %</Text>
							</View>
						</View>
						<View style={styles.row}>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Electricity:&nbsp;</Text>
								<Text style={styles.value}>{sources.electricity} %</Text>
							</View>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Natural Gas:&nbsp;</Text>
								<Text style={styles.value}>{sources.gas} %</Text>
							</View>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Residual:&nbsp;</Text>
								<Text style={styles.value}>{sources.residual} %</Text>
							</View>
						</View>
					</View>
					<View style={{ ...styles.container, margin: 0 }}>
						<View style={styles.key}>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Contract Start Date:&nbsp;</Text>
								<Text style={styles.value}>{contract.contractDate} year(s)</Text>
							</View>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Contract Term:&nbsp;</Text>
								<Text style={styles.value}>{contract.contractTerm} year(s)</Text>
							</View>
						</View>
						<View style={styles.row}>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Carbon Market Rate Assumptions:&nbsp;</Text>
								<Text style={styles.value}>{socialCost}</Text>
							</View>
							<View style={{ ...styles.item, ...styles.key }}>
								<Text style={styles.text}>Annual Inflation Rate:&nbsp;</Text>
								<Text style={styles.value}>{inflationRate}</Text>
							</View>
						</View>
					</View>
					{/* <PdfDisclaimer /> */}
				</View>
			</Page>
		</Document>
	);
};

export default Pdf;
