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
	value$: Observable<number>;
	wire?: Subject<T>;
	step?: number;
	tooltipPlacement?: "top" | "bottom" | "left" | "right";
};

const { Title } = Typography;

export default function NumberInput<T extends number>({
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
	step,
	tooltipPlacement,
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
			<Tooltip placement={tooltipPlacement || "top"} title={tooltip}>
				{label ? <Title level={5}>{label}</Title> : ""}
				<InputNumber
					{...inputProps}
					className={"w-24 " + className}
					addonAfter={addOn || "%"}
					min={min}
					max={max}
					readOnly={readOnly || false}
					value={useValue()}
					onChange={(value) => change(value as T)}
					defaultValue={defaultValue}
					status={status}
					step={step || 1}
				/>
			</Tooltip>
		</Space>
	);
}
