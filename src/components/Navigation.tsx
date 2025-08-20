import type { MenuProps } from "antd";
import { Menu } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const leftMenuItems: MenuItem[] = [
	{
		key: "home",
		label: (
			<a href="#" rel="noopener noreferrer">
				Home
			</a>
		),
	},
	{
		key: "blcc",
		label: (
			<a href="https://blcc.nist.gov" target="_blank" rel="noopener noreferrer">
				BLCC
			</a>
		),
	},
	{
		key: "handbook",
		label: (
			<a
				href="https://nvlpubs.nist.gov/nistpubs/hb/2025/NIST.HB.135e2025.pdf"
				target="_blank"
				rel="noopener noreferrer"
			>
				Handbook 135
			</a>
		),
	},
	{
		key: "supplement",
		label: (
			<a
				href="https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.85-3273-40.pdf"
				target="_blank"
				rel="noopener noreferrer"
			>
				Annual Supplement
			</a>
		),
	},
];

const rightMenuItems: MenuItem[] = [
	{
		label: "User Guide",
		key: "SubMenu",
		children: [
			{
				label: (
					<a
						href="https://pages.nist.gov/eerc2025//EERC%20User%20Guide%20-%202025.htm"
						target="_blank"
						rel="noopener noreferrer"
					>
						HTML
					</a>
				),
				key: "html",
			},
			{
				label: (
					<a
						href="https://pages.nist.gov/eerc2025//EERC%20User%20Guide%20-%202025.pdf"
						target="_blank"
						rel="noopener noreferrer"
					>
						PDF
					</a>
				),
				key: "pdf",
			},
		],
	},
];

function Navigation() {
	return (
		<div className="flex justify-between blue">
			<Menu mode="horizontal" className="blue" items={leftMenuItems} />
			<Menu className="w-28 blue" mode="horizontal" items={rightMenuItems} />
		</div>
	);
}

export default Navigation;
