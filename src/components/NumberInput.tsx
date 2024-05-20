import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Space, Tooltip, Typography, type InputNumberProps } from "antd";
import { PropsWithChildren, useEffect, useMemo, type Key } from "react";
import { Observable, type Subject } from "rxjs";

export type NumberInputProps<T extends Key> = {
	className?: string;
	min?: number;
	max?: number;
	defaultValue?: number;
	addOn?: JSX.Element | string;
	label?: string;
	readOnly?: boolean;
	tooltip?: string;
	status?: "" | "error" | "warning" | undefined;
	value$: Observable<T>;
	wire: Subject<T>;
};

const { Title } = Typography;

export default function NumberInput<T extends Key>({
	label,
	value$,
	wire,
	tooltip,
	className,
	addOn,
	min,
	max,
	readOnly,
	status,
	defaultValue,
	...inputProps
}: PropsWithChildren<NumberInputProps<T>> & Omit<InputNumberProps, "onChange" | "value" | "options">) {
	const { change$, change, useValue } = useMemo(() => {
		const [change$, change] = createSignal<T>();
		const [useValue] = bind(value$, undefined);

		return { change$, change, useValue };
	}, [value$]);

	useEffect(() => {
		const sub = change$.subscribe(wire);
		return () => sub.unsubscribe();
	}, [wire, change$]);

	return (
		<Space className="flex justify-center">
			<Tooltip title={tooltip}>
				{label ? <Title level={5}>{label}</Title> : ""}
				<InputNumber
					{...inputProps}
					className={"w-24 " + className}
					addonAfter={addOn || "%"}
					min={min}
					max={max}
					readOnly={readOnly || false}
					value={useValue()}
					onChange={(value) => change(value)}
					defaultValue={defaultValue}
					status={status}
				/>
			</Tooltip>
		</Space>
	);
}
