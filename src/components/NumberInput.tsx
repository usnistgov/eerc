import { InputNumber, Space, Typography } from "antd";
const { Title } = Typography;

function NumberInput(props: { label?: string; addOn: string; min?: number; max?: number; readOnly?: boolean }) {
	const { label, addOn, min, max, readOnly } = props;
	return (
		<Space>
			<Title level={5}>{label}</Title>
			<InputNumber addonAfter={addOn} min={min} max={max} readOnly={readOnly || false} className="w-28" />
		</Space>
	);
}

export default NumberInput;
