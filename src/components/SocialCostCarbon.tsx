import { Select, Space } from "antd";
import { useState } from "react";
import { sccOptions } from "../data/Constants";

function SocialCostCarbon() {
	// eslint-disable-next-line
	const [socialCost, setSocialCost] = useState<string>("none");
	const onChange = (value: string) => {
		setSocialCost(value);
		console.log(`selected ${value}`);
	};

	return (
		<Space className="flex justify-center py-5">
			<Select className="w-64" placeholder="Social Cost" onChange={onChange} options={sccOptions} />
		</Space>
	);
}

export default SocialCostCarbon;
