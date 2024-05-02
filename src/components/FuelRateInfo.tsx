import { Select, Space } from "antd";

const onChange = (value: string) => {
	console.log(`selected ${value}`);
};

const onSearch = (value: string) => {
	console.log("search:", value);
};

// Filter `option.label` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
	(option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const current_year: number = new Date().getFullYear();
const prev_year: number = current_year - 1;

function FuelRateInfo() {
	return (
		<Space className="flex justify-center py-5">
			<Space>
				<Select
					showSearch
					placeholder="Year of Data"
					optionFilterProp="children"
					onChange={onChange}
					onSearch={onSearch}
					filterOption={filterOption}
					options={[
						{
							value: `${current_year}`,
							label: `${current_year}`,
						},
						{
							value: `${prev_year}`,
							label: `${prev_year}`,
						},
					]}
				/>
				<Select
					showSearch
					placeholder="Select a sector"
					optionFilterProp="children"
					onChange={onChange}
					onSearch={onSearch}
					filterOption={filterOption}
					options={[
						{
							value: "commercial",
							label: "Commercial",
						},
						{
							value: "industrial",
							label: "Industrial",
						},
					]}
				/>
			</Space>
			<Space>
				<Select
					showSearch
					placeholder="Select State"
					optionFilterProp="children"
					onChange={onChange}
					onSearch={onSearch}
					filterOption={filterOption}
					options={[
						{
							value: "commercial",
							label: "Commercial",
						},
						{
							value: "industrial",
							label: "Industrial",
						},
					]}
				/>
				<Select
					showSearch
					placeholder="Select Zipcode"
					optionFilterProp="children"
					onChange={onChange}
					onSearch={onSearch}
					filterOption={filterOption}
					options={[
						{
							value: "commercial",
							label: "Commercial",
						},
						{
							value: "industrial",
							label: "Industrial",
						},
					]}
				/>
			</Space>
		</Space>
	);
}

export default FuelRateInfo;
