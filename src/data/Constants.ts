import * as CO2Factors from "../../public/CO2Factors.json";

export const sccOptions = [
	{ value: "none", label: "No carbon price" },
	{ value: "low", label: "Low - $20 in 2024" },
	{ value: "medium", label: "Medium - $66 in 2024" },
	{ value: "high", label: "High - $198 in 2024" },
];

export const sectors = [
	{
		value: "commercial",
		label: "Commercial",
	},
	{
		value: "industrial",
		label: "Industrial",
	},
];

export const states = [...new Set(Object.keys(CO2Factors).filter((s) => s.length === 2))]
	.sort()
	.map((item: string) => ({ value: item, label: item }));
