import { InfoCircleOutlined } from "@ant-design/icons";
import { Divider, Tooltip } from "antd";

function DividerComp(props: { heading: string; title: string }) {
	const { heading, title } = props;

	return (
		<Divider>
			{heading}{" "}
			<Tooltip title={title}>
				<InfoCircleOutlined />
			</Tooltip>
		</Divider>
	);
}

export default DividerComp;
