import { InputNumber, Select, Typography } from "antd";
import React from "react";

const { Title } = Typography;

function SocialCostCarbon() {
	const onChange = (value: string) => {
		console.log(`selected ${value}`);
	};

	const onSearch = (value: string) => {
		console.log("search:", value);
	};

	// Filter `option.label` match the user type `input`
	const filterOption = (input: string, option?: { label: string; value: string }) =>
		(option?.label ?? "").toLowerCase().includes(input.toLowerCase());

	const sccOptions = [
		{ value: "none", label: "No carbon price" },
		{ value: "low", label: "Low - $20 in 2024" },
		{ value: "medium", label: "Medium - $66 in 2024" },
		{ value: "high", label: "High - $198 in 2024" },
	];

	return (
		<div>
			<Title level={4}>Social Cost of Carbon Assumptions</Title>
			<Select
				showSearch
				placeholder="Start Date"
				optionFilterProp="children"
				onChange={onChange}
				onSearch={onSearch}
				filterOption={filterOption}
				options={sccOptions}
			/>
			<InputNumber addonAfter={"years"} min={15} max={40} defaultValue={15} className="w-25" />
		</div>
	);
}

export default SocialCostCarbon;
