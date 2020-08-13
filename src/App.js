import React from 'react';
import Box from '@material-ui/core/Box';
import './App.css';
import EercForm from './components/EercForm';

function App() {
  return (
    <div className="App">
      <Box p={2} bgcolor="background.paper">
        <h2>
          NIST Energy Escalation Rate Calculator
        </h2>
        <EercForm />
      </Box>
    </div>
  );
}

export default App;
