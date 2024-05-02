import { InputNumber, Select, Typography } from "antd";
import React from "react";

const { Title } = Typography;

function ContractTerm() {
	const onChange = (value: string) => {
		console.log(`selected ${value}`);
	};

	const onSearch = (value: string) => {
		console.log("search:", value);
	};

	// Filter `option.label` match the user type `input`
	const filterOption = (input: string, option?: { label: string; value: string }) =>
		(option?.label ?? "").toLowerCase().includes(input.toLowerCase());

	const options = (date: number) => {
		return Array.from({ length: 4 }, (_, index: number) => {
			const year = date + index;
			return { value: `${year}`, label: `${year}` };
		});
	};

	return (
		<div>
			<Title level={4}>Contract Term</Title>
			<Select
				showSearch
				placeholder="Start Date"
				optionFilterProp="children"
				onChange={onChange}
				onSearch={onSearch}
				filterOption={filterOption}
				options={options(2024)}
			/>
			<InputNumber addonAfter={"years"} min={15} max={40} defaultValue={15} className="w-25" />
		</div>
	);
}

export default ContractTerm;
