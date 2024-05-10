import { form$ } from "./data/Model";

import { Subscribe } from "@react-rxjs/core";
import "./assets/nist-header-footer-v-2.0";
import "./assets/styles/nist-combined.css";
import Form from "./components/Form";
import "./index.css";

form$.subscribe(console.log);

function App() {
	return (
		<Subscribe>
			<Form />
		</Subscribe>
	);
}

export default App;
