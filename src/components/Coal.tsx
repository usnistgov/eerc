import { useEffect, useState } from "react";
import { Observable } from "rxjs";
import { SectorType } from "../data/Formats";
import NumberInput from "./NumberInput";

export const Coal: React.FC<{
	coal$: Observable<number>;
	sector$: Observable<SectorType>;
}> = ({ coal$, sector$ }) => {
	const [sector, setSector] = useState<SectorType>(SectorType.NONE); // Initialize state for sector

	useEffect(() => {
		const subscription = sector$.subscribe(setSector); // Subscribe to sector observable
		return () => subscription.unsubscribe(); // Cleanup subscription on unmount
	}, [sector$]);
	return (
		<>
			{sector === SectorType.INDUSTRIAL ? (
				<NumberInput
					value$={coal$}
					wire={coal$}
					label="Coal"
					min={0}
					tooltip="Percentage of energy cost savings in dollars that is attributable to coal used in the project. This input is used to weight the escalation rate."
				/>
			) : (
				""
			)}
		</>
	);
};
