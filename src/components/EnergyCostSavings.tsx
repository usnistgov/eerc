import { InputNumber, Select, Typography } from "antd";
import React from "react";
const { Title } = Typography;

function EnergyCostSavings() {
	return (
		<div className="flex justify-center items-center text-center">
			<Title level={4}>Percent of Energy Cost Savings</Title>
			<InputNumber addonAfter={"%"} defaultValue={100} className="w-25" />
			<InputNumber addonAfter={"%"} defaultValue={100} />
			<InputNumber addonAfter={"%"} defaultValue={100} />
			<InputNumber addonAfter={"%"} defaultValue={100} />
			<InputNumber addonAfter={"%"} defaultValue={100} />
			<InputNumber addonAfter={"%"} defaultValue={100} />
		</div>
	);
}

export default EnergyCostSavings;
