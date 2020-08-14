import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import './App.css';
import EercForm from './components/EercForm';

function App() {
  return (
    <div className="App">
      <Box p={2} minWidth={310} maxWidth={750} mx="auto" bgcolor="background.paper">
        <Typography variant="h6" gutterBottom>
          NIST Energy Escalation Rate Calculator
        </Typography>
        <EercForm />
      </Box>
    </div>
  );
}

export default App;
