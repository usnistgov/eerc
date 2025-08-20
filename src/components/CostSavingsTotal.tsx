import { InputNumber, Space, Typography } from "antd";
import "./styles.css";

import { useEffect, useState } from "react";
import { Observable } from "rxjs";

const { Title } = Typography;

interface CostSavingsTotalProps {
	totalSum$: Observable<number>;
}

export const CostSavingsTotal: React.FC<CostSavingsTotalProps> = ({ totalSum$ }) => {
	const [total, setTotal] = useState<number>(0);

	useEffect(() => {
		const subscription = totalSum$.subscribe(setTotal); // Subscribe to totalSum observable
		return () => subscription.unsubscribe(); // Cleanup subscription on unmount
	}, [totalSum$]);

	return (
		<Space className="flex flex-col justify-center mt-5">
			<Title level={5}>Total</Title>
			<InputNumber
				className="w-24"
				addonAfter="%"
				min={0}
				max={100}
				readOnly={true}
				value={total}
				defaultValue={0}
				status={total !== 100 ? "error" : ""}
				disabled
			/>
			{total !== 100 ? <p className="text-red-500">The total must equal 100.</p> : ""}
		</Space>
	);
};
