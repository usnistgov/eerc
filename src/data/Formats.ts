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
