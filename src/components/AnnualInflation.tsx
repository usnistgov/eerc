import { Space } from "antd";
import { useState } from "react";
import NumberInput from "./NumberInput";

function AnnualInflation() {
	// eslint-disable-next-line
	const [inflationRate, setInflationRate] = useState<number>(2.9);
	return (
		<Space className="flex justify-center py-5">
			<NumberInput label="" addOn="%" onChange={(val) => setInflationRate(val)} defaultValue={2.9} />
		</Space>
	);
}

export default AnnualInflation;
