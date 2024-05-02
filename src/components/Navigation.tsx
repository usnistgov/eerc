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
			<a href="https://blcctest.el.nist.gov" target="_blank" rel="noopener noreferrer">
				BLCC
			</a>
		),
	},
	{
		key: "handbook",
		label: (
			<a href="#" target="_blank" rel="noopener noreferrer">
				Handbook 135
			</a>
		),
	},
	{
		key: "supplement",
		label: (
			<a href="#" target="_blank" rel="noopener noreferrer">
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
					<a href="#" rel="noopener noreferrer">
						HTML
					</a>
				),
				key: "html",
			},
			{
				label: (
					<a href="#" rel="noopener noreferrer">
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
		<div className="flex justify-between">
			<Menu mode="horizontal" items={leftMenuItems} />
			<Menu className="w-28" mode="horizontal" items={rightMenuItems} />
		</div>
	);
}

export default Navigation;
