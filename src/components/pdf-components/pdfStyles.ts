import { StyleSheet } from "@react-pdf/renderer";

const blue = "#005fa3ff";

export const styles = StyleSheet.create({
	page: {
		margin: 10,
	},
	section: {
		display: "flex",
		flexDirection: "column",
		padding: 25,
	},
	mainHeader: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "12.5 25 5 25",
	},
	headerNistLogo: {
		display: "flex",
		justifyContent: "flex-end",
		width: "80px",
		height: "20px",
		alignSelf: "flex-end",
	},
	header: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
	},
	logo: {
		display: "flex",
		justifyContent: "center",
		width: "500px",
		marginBottom: 10,
	},
	date: {
		display: "flex",
		justifyContent: "flex-end",
		fontSize: 14,
	},
	eerc: {
		display: "flex",
		justifyContent: "flex-end",
		fontSize: 20,
		marginBottom: 10,
	},

	titleDivider: {
		border: "1px solid black",
		margin: "4px 0 4px 0",
	},
	titleWrapper: {
		display: "flex",
		justifyContent: "space-between",
		textAlign: "center",
	},
	title: {
		fontSize: 16,
		color: blue,
		textAlign: "center",
	},

	key: {
		display: "flex",
		flexDirection: "row",
		marginBottom: 6,
		fontSize: 10,
	},
	text: {
		fontSize: 12,
		color: blue,
	},
	value: {
		fontSize: 12,
		marginBottom: 3,
	},
	container: {
		display: "flex",
	},
});
