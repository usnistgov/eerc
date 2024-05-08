import { Select, Space } from "antd";
import { useState } from "react";
import { Contract } from "../data/Formats";
import NumberInput from "./NumberInput";

function ContractTerm() {
	const [contract, setContract] = useState<Contract>({ startDate: "", term: 15 });
	const onChange = (value: string) => {
		setContract({ ...contract, startDate: value });
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
	console.log(contract);
	return (
		<Space className="flex justify-center py-5">
			<Select
				showSearch
				placeholder="Start Date"
				optionFilterProp="children"
				onChange={onChange}
				// onSearch={onSearch}
				// filterOption={filterOption}
				options={options(2024)}
			/>
			<NumberInput addOn="years" min={15} max={40} onChange={(val) => setContract({ ...contract, term: val })} />
		</Space>
	);
}

export default ContractTerm;
