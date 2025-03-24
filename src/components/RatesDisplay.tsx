import { Statistic } from "antd";
import React, { useEffect, useState } from "react";
import { Observable } from "rxjs";

interface RatesDisplayProps {
	title: string;
	displayValue$: Observable<number>;
}

const RatesDisplay: React.FC<RatesDisplayProps> = React.memo(({ title, displayValue$ }) => {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		const subscription = displayValue$.subscribe(setDisplayValue); // Subscribe to totalSum observable
		return () => subscription.unsubscribe(); // Cleanup subscription on unmount
	}, [displayValue$]);
	return (
		<Statistic
			className="p-1 mr-2 rounded-md text-center ring-offset-2 w-24 blue"
			title={title}
			value={displayValue.toFixed(2)}
			suffix="%"
		/>
	);
});

export default RatesDisplay;
