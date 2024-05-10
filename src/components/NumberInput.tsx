import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Space, Tooltip, Typography } from "antd";
import { PropsWithChildren } from "react";
import { EMPTY, Observable } from "rxjs";

export type NumberInputProps = {
	className?: string;
	min?: number;
	max?: number;
	defaultValue?: number;
	addOn?: JSX.Element | string;
	label?: string;
	readOnly?: boolean;
	title?: string;
};

export type NumberInput = {
	onChange$: Observable<number>;
	component: React.FC<PropsWithChildren & NumberInputProps>;
};

const { Title } = Typography;

export default function textInput(value$: Observable<number | undefined> = EMPTY): NumberInput {
	const [onChange$, onChange] = createSignal<number>();
	const [useValue] = bind(value$, undefined);

	return {
		onChange$,
		component: ({
			className,
			min,
			max,
			defaultValue,
			addOn,
			title,
			label,
			readOnly,
		}: PropsWithChildren & NumberInputProps) => {
			return (
				<Tooltip title={title}>
					<Space className="flex justify-center">
						<Title level={5}>{label}</Title>
						<InputNumber
							className={className + " w-24"}
							addonAfter={addOn || "%"}
							min={min}
							max={max}
							readOnly={readOnly || false}
							value={useValue()}
							onChange={(value) => {
								if (value !== null) onChange(value);
							}}
							defaultValue={defaultValue}
						/>
					</Space>
				</Tooltip>
			);
		},
	};
}
