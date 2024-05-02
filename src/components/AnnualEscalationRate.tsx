import { FilePdfOutlined } from "@ant-design/icons";
import { Button, InputNumber, Typography } from "antd";
import React from "react";

const { Title } = Typography;

function AnnualEscalationRate() {
	return (
		<div>
			<Title level={4}>Annual Inflation Rate</Title>
			<InputNumber addonAfter={"%"} defaultValue={2} className="w-25" />
			<InputNumber addonAfter={"%"} defaultValue={2} className="w-25" />
			<Button type="primary" size={"large"} icon={<FilePdfOutlined />}>
				Save to PDF
			</Button>
		</div>
	);
}

export default AnnualEscalationRate;
