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

export enum StateType {
	State = "None Selected",
	AK = "AK",
	AL = "AL",
	AZ = "AZ",
	AR = "AR",
	CA = "CA",
	CO = "CO",
	CT = "CT",
	DC = "DC",
	DE = "DE",
	FL = "FL",
	GA = "GA",
	HI = "HI",
	ID = "ID",
	IL = "IL",
	IN = "IN",
	IA = "IA",
	KS = "KS",
	KY = "KY",
	LA = "LA",
	ME = "ME",
	MD = "MD",
	MA = "MA",
	MI = "MI",
	MN = "MN",
	MS = "MS",
	MO = "MO",
	MT = "MT",
	NE = "NE",
	NV = "NV",
	NH = "NH",
	NJ = "NJ",
	NM = "NM",
	NY = "NY",
	NC = "NC",
	ND = "ND",
	OH = "OH",
	OK = "OK",
	OR = "OR",
	PA = "PA",
	RI = "RI",
	SC = "SC",
	SD = "SD",
	TN = "TN",
	TX = "TX",
	UT = "UT",
	VT = "VT",
	VA = "VA",
	WA = "WA",
	WV = "WV",
	WI = "WI",
	WY = "WY",
	// AS = "AS",
	// BI = "BI",
	// GU = "GU",
	// JI = "JI",
	// JA = "JA",
	// KR = "KR",
	// MW = "MW",
	// NI = "NI",
	// PI = "PI",
	// WK = "WK",
	// NO = "NO",
	// PR = "PR",
	// VI = "VI",
	// no data available for above states
}

export const currentYear = 2024;

export const DataYearType = {
	PREVIOUS: currentYear - 1,
	CURRENT: currentYear,
};

export const ContractStartDateType = {
	CURRENT: currentYear,
	CURRENT1: currentYear + 1,
	CURRENT2: currentYear + 2,
	CURRENT3: currentYear + 3,
};
