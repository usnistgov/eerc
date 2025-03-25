import { Text, View } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

const Title = (props: { title: string }) => {
	const { title } = props;
	return (
		<>
			<hr style={styles.titleDivider} />
			<View style={styles.titleWrapper}>
				<Text style={{ ...styles.title, marginBottom: 5 }}>{title}</Text>
			</View>
			<hr style={styles.titleDivider} />
			<br />
		</>
	);
};

export default Title;
