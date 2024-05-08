import { Select, Space, Tooltip } from "antd";
import { useState } from "react";
import { sectors, states } from "../data/Constants";
import { DataFuelRateInfo } from "../data/Formats";

// Filter `option.label` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
	(option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const current_year: number = new Date().getFullYear();
const prev_year: number = current_year - 1;

function FuelRateInfo() {
	const [fuelRateInfo, setFuelRateInfo] = useState<DataFuelRateInfo>({
		year: "",
		sector: "",
		state: "",
		zipcode: "",
	});

	const onChange = (value: string, key: string) => {
		setFuelRateInfo({ ...fuelRateInfo, [key]: value });
	};

	return (
		<Space className="flex justify-center py-5">
			<Space>
				<Tooltip title="prompt text">
					<Select
						placeholder="Year of Data"
						onChange={(val) => onChange(val, "year")}
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
				</Tooltip>
				<Tooltip title="Selection of commercial sector or industrial sector determines the escalation rate schedule applied to the energy cost calculation.">
					<Select placeholder="Select Sector" onChange={(val) => onChange(val, "sector")} options={sectors} />
				</Tooltip>
			</Space>
			<Space>
				<Tooltip title="Selecting the state in which the project is located is needed to select the associated energy price escalation rates (by census region) and CO2 pricing and emission rates (currently by state).">
					<Select
						showSearch
						placeholder="Select State"
						optionFilterProp="children"
						onChange={(val) => onChange(val, "state")}
						filterOption={filterOption}
						options={states}
					/>
				</Tooltip>

				<Tooltip title="prompt text">
					<Select
						showSearch
						placeholder="Select Zipcode"
						optionFilterProp="children"
						onChange={(val) => onChange(val, "zipcode")}
						filterOption={filterOption}
						options={sectors}
					/>
				</Tooltip>
			</Space>
		</Space>
	);
}

export default FuelRateInfo;
