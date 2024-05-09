import { List, Select, Space, Tooltip } from "antd";
import React, { useState } from "react";
import { sccOptions } from "../data/Constants";

function SocialCostCarbon() {
	// eslint-disable-next-line
	const [socialCost, setSocialCost] = useState<string>("none");
	const onChange = (value: string) => {
		setSocialCost(value);
		console.log(`selected ${value}`);
	};

	const data = [
		{
			title: "No Carbon Price assumes that no carbon policy is enacted (status quo)",
		},
		{
			title: "Low - $20 in 2024 - 5% DR (average)= average social cost of GHG assuming a 5% real discount rate",
		},
		{
			title:
				"Medium - $66 in 2024 - 3% DR (average) = average social cost of GHG assuming a 3% real discount rate.Best match to DOE and OMB real discount rates.",
		},
		{
			title:
				"High - $198 in 2024 - 3% DR (95th percentile) = 95th Percentile social cost of GHG assuming a 3% real discount rate",
		},
	];

	return (
		<Space className="flex justify-center py-5">
			<Tooltip
				className="text-white w-100"
				title={
					<React.Fragment>
						Determines the social cost of GHG emissions projection to use from the Interagency Working Group on Social
						Cost of Greenhouse Gasses Interim Estimates under Executive Order 13990. The scenarios are based on the
						assumed discount rate (DR) and projection percentile:
						<List
							className="text-white"
							// itemLayout="horizontal"
							dataSource={data}
							renderItem={(item) => (
								<List.Item className="text-white">
									<List.Item.Meta className="text-white" title={item.title} style={{ color: "white" }} />
								</List.Item>
							)}
						/>
					</React.Fragment>
				}
				// open={true}
			>
				<Select className="w-64" placeholder="Social Cost" onChange={onChange} options={sccOptions} />
			</Tooltip>
		</Space>
	);
}

export default SocialCostCarbon;
