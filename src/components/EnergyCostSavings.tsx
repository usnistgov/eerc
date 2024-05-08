import { Space, Typography } from "antd";
import { useState } from "react";
import { EnergySavings } from "../data/Formats";
import NumberInput from "./NumberInput";

const { Text } = Typography;

function EnergyCostSavings() {
	const [energySavings, setEnergySavings] = useState<EnergySavings>({
		coal: 0,
		oil: 0,
		electricity: 0,
		gas: 0,
		residual: 0,
	});

	const totalEnergy = Object.values(energySavings).reduce((acc, total) => acc + total, 0);
	return (
		<Space direction="vertical" className="flex flex-col py-5 text-center">
			<Space className="flex justify-around">
				<NumberInput
					label="Coal"
					min={0}
					max={100}
					addOn="%"
					onChange={(value: number) => setEnergySavings({ ...energySavings, coal: value })}
				/>
				<NumberInput
					label="Distillate Oil"
					min={0}
					max={100}
					addOn="%"
					onChange={(value: number) => setEnergySavings({ ...energySavings, oil: value })}
				/>
				<NumberInput
					label="Electricity"
					min={0}
					max={100}
					addOn="%"
					onChange={(value: number) => setEnergySavings({ ...energySavings, electricity: value })}
				/>
				<NumberInput
					label="Natural Gas"
					min={0}
					max={100}
					addOn="%"
					onChange={(value: number) => setEnergySavings({ ...energySavings, gas: value })}
				/>
				<NumberInput
					label="Residual"
					min={0}
					max={100}
					addOn="%"
					onChange={(value: number) => setEnergySavings({ ...energySavings, residual: value })}
				/>
			</Space>
			<br />
			<Space className="flex justify-center">
				<NumberInput
					label="Total"
					addOn="%"
					readOnly={true}
					value={totalEnergy}
					status={totalEnergy !== 100 ? "error" : undefined}
				/>
			</Space>
			{totalEnergy !== 100 ? (
				<Text className="text-red-500">The total percent of energy cost savings must be equal to 100%.</Text>
			) : (
				""
			)}
		</Space>
	);
}

export default EnergyCostSavings;
