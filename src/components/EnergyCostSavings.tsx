import { Space } from "antd";
import NumberInput from "./NumberInput";

function EnergyCostSavings() {
	return (
		<Space direction="vertical" className="flex flex-col py-5">
			<Space className="flex justify-around">
				<NumberInput label="Coal" min={0} max={100} addOn="%" />
				<NumberInput label="Distillate Oil" min={0} max={100} addOn="%" />
				<NumberInput label="Electricity" min={0} max={100} addOn="%" />
				<NumberInput label="Natural Gas" min={0} max={100} addOn="%" />
				<NumberInput label="Residual" min={0} max={100} addOn="%" />
			</Space>
			<br />
			<Space className="flex justify-center">
				<NumberInput label="Total" addOn="%" readOnly={true} />
			</Space>
		</Space>
	);
}

export default EnergyCostSavings;
