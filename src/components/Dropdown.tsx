import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Select, Tooltip, Typography, type SelectProps } from "antd";
import { PropsWithChildren, useEffect, useMemo, type Key } from "react";
import { Observable, of, type Subject } from "rxjs";

const { Title } = Typography;

type DropdownProps<T extends Key> = {
	className?: string;
	label?: string;
	options: Observable<T[]> | T[];
	value$: Observable<T>;
	wire: Subject<T>;
	placeholder?: string;
	tooltip?: string;
};

/**
 * Creates a dropdown component and its associated change stream.
 */

export default function Dropdown<T extends Key>({
	options,
	value$,
	wire,
	tooltip,
	label,
	...selectProps
}: PropsWithChildren<DropdownProps<T>> & Omit<SelectProps, "onChange" | "value" | "options">) {
	const { change$, change, useValue, useOptions } = useMemo(() => {
		const [change$, change] = createSignal<T>();
		const [useValue] = bind(value$, undefined);

		const [useOptions] = bind(Array.isArray(options) ? of(options) : options, []);

		return { change$, change, useValue, useOptions };
	}, [value$, options]);

	useEffect(() => {
		const sub = change$.subscribe(wire);
		return () => sub.unsubscribe();
	}, [wire, change$]);

	return (
		<Tooltip title={tooltip}>
			{label && <Title level={5}>{label}</Title>}
			<Select onChange={(value) => change(value)} value={useValue()} {...selectProps}>
				{useOptions().map((option) => (
					<Select.Option key={option} value={option}>
						{option.toString()}
					</Select.Option>
				))}
			</Select>
		</Tooltip>
	);
}
