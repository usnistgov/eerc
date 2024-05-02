import { FilePdfOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import NumberInput from "./NumberInput";

function AnnualEscalationRate() {
	return (
		<Space direction="vertical" className="flex justify-center items-center">
			<Space className="flex justify-around py-5">
				<NumberInput addOn="%" label="Real" />
				<NumberInput addOn="%" label="Nominal" />
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
