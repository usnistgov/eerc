import { Select, Space } from "antd";
import NumberInput from "./NumberInput";

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
		<Space className="flex justify-center py-5">
			<Select
				showSearch
				placeholder="Start Date"
				optionFilterProp="children"
				onChange={onChange}
				onSearch={onSearch}
				filterOption={filterOption}
				options={options(2024)}
			/>
			<NumberInput addOn="years" min={15} max={40} />
		</Space>
	);
}

export default ContractTerm;
