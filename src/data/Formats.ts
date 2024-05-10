export type Form = {
	dataYear: number;
	sector: SectorType;
	state: string;
	zipcode: string;
	coal?: number;
	oil: number;
	electricity: number;
	gas: number;
	residual: number;
	contractStartDate: number;
	contractTerm: number;
	socialCost: SocialCostType;
	inflationRate: number;
};

export type DataFuelRateInfo = {
	year: string;
	sector: string;
	state: string;
	zipcode: string;
};

export type EnergySavings = {
	coal: number;
	oil: number;
	electricity: number;
	gas: number;
	residual: number;
};

export type Contract = {
	startDate: string;
	term: number;
};

export enum SocialCostType {
	NONE = "No carbon price",
	LOW = "Low - $20 in 2024",
	MEDIUM = "Medium - $66 in 2024",
	HIGH = "High - $198 in 2024",
}

export enum SectorType {
	COMMERCIAL = "Commercial",
	INDUSTRIAL = "Industrial",
}
