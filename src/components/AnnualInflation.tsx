import { InputNumber, Typography } from "antd";
import React from "react";

const { Title } = Typography;

function AnnualInflation() {
	return (
		<div>
			<Title level={4}>Annual Inflation Rate</Title>
			<InputNumber addonAfter={"%"} defaultValue={2} className="w-25" />
		</div>
	);
}

export default AnnualInflation;
