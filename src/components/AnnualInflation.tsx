import { Space } from "antd";
import { useState } from "react";
import NumberInput from "./NumberInput";

function AnnualInflation() {
	// eslint-disable-next-line
	const [inflationRate, setInflationRate] = useState<number>(2.9);
	return (
		<Space className="flex justify-center py-5">
			<NumberInput
				label=""
				addOn="%"
				onChange={(val) => setInflationRate(val)}
				defaultValue={2.9}
				title="The general rate of inflation for the nominal discount rate calculation. The default rate of inflation is the long-term inflation rate calculated annually by DOE/FEMP using data from CEA and the method described in 10 CFR 436 without consideration of the 3.0 % floor for the real discount rate."
			/>
		</Space>
	);
}

export default AnnualInflation;
