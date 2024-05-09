import { FilePdfOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import NumberInput from "./NumberInput";

function AnnualEscalationRate() {
	return (
		<Space direction="vertical" className="flex justify-center items-center">
			<Space className="flex justify-around py-5">
				<NumberInput
					addOn="%"
					label="Real"
					title="The calculated average escalation rate in real terms (excluding the rate of inflation). Estimated using the energy prices for the sector, fuel mix, and location."
					readOnly
				/>
				<NumberInput
					addOn="%"
					label="Nominal"
					title="The calculated average escalation rate in nominal terms (including the rate of inflation). Calculated using the real escalation rate and input inflation rate."
					readOnly
				/>
			</Space>
			<Space className="flex justify-center py-5">
				<Button
					className="text-white"
					size={"large"}
					icon={<FilePdfOutlined />}
					style={{ backgroundColor: "#005fa3ff" }}
				>
					Save to PDF
				</Button>
			</Space>
		</Space>
	);
}

export default AnnualEscalationRate;
