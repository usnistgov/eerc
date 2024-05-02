import { Select, Space } from "antd";
import NumberInput from "./NumberInput";

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
		<Space className="flex justify-center py-5">
			<Select
				showSearch
				placeholder="Start Date"
				optionFilterProp="children"
				onChange={onChange}
				onSearch={onSearch}
				filterOption={filterOption}
				options={sccOptions}
			/>
			<NumberInput addOn="years" min={15} max={40} />
		</Space>
	);
}

export default SocialCostCarbon;
