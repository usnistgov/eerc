import { Typography } from "antd";

const { Text } = Typography;

export default function Disclaimer() {
	return (
		<Text className="text-center p-10 text-white">
			This software was developed by employees of the National Institute of Standards and Technology (NIST), an agency
			of the Federal Government and is being made 105, works of NIST employees are not subject to copyright protection
			in the United States. This software may be subject to foreign copyright. Permission in the United States and in
			foreign countries, to the extent that NIST may hold copyright, to use, copy, modify, create derivative works, and
			distribute this software and its documentation without fee is hereby granted on a non-exclusive basis, provided
			that this notice and disclaimer of warranty appears in all copies. The software is provided 'as is' without any
			warranty of any kind, either expressed, implied, or statutory, including, but not limited to, any warranty that
			the software will conform to specifications, any implied warranties of merchantability, fitness for a particular
			purpose, and freedom from infringement, and any warranty that the documentation will conform to the software, or
			any warranty that the software will be error free. In no event shall NIST be liable for any damages, including,
			but not limited to, direct, indirect, special or consequential damages, arising out of, resulting from, or in any
			way connected with this software, whether or not based upon warranty, contract, tort, or otherwise, whether or not
			injury was sustained by persons or property or otherwise, and whether or not loss was sustained from, or arose out
			of the results of, or use of, the software or services provided hereunder.
		</Text>
	);
}
