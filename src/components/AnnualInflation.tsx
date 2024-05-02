import { Space } from "antd";
import NumberInput from "./NumberInput";

function AnnualInflation() {
	return (
		<Space className="flex justify-center py-5">
			<NumberInput label="" addOn="%" />
		</Space>
	);
}

export default AnnualInflation;
