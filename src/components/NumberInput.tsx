import { InputNumber, Space, Typography } from "antd";
const { Title } = Typography;

function NumberInput(props: {
	label?: string;
	addOn: string;
	min?: number;
	max?: number;
	readOnly?: boolean;
	value?: number;
	onChange?: (value: number) => void;
	// InputNumberProps["onChange"];
	// ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
	status?: "error" | "warning" | undefined;
	defaultValue?: number;
}) {
	const { label, addOn, min, max, readOnly, value, onChange, status, defaultValue } = props;
	return (
		<Space>
			<Title level={5}>{label}</Title>
			<InputNumber
				addonAfter={addOn}
				min={min}
				max={max}
				readOnly={readOnly || false}
				className="w-28"
				value={value}
				onChange={onChange}
				status={status}
				defaultValue={defaultValue}
			/>
		</Space>
	);
}

export default NumberInput;
