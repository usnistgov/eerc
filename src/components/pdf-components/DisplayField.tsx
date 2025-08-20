import { Text, View } from "@react-pdf/renderer";
import { styles as pdfStyles } from "./pdfStyles";

const DisplayField = (props: { styles: { [key: string]: string | number }; label: string; value: string | number }) => {
	const { styles, label, value } = props;
	return (
		<View style={styles}>
			<Text style={pdfStyles.text}>{label}:&nbsp;</Text>
			<Text style={pdfStyles.value}>{value}</Text>
		</View>
	);
};

export default DisplayField;
