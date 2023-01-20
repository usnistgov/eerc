import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
//import html2canvas from 'html2canvas';
import './App.css';
import EercForm from './components/EercForm';

//import makeStyles from '@mui/styles/makeStyles';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Box p={2} minWidth={310} maxWidth={750} mx="auto" bgcolor="background.paper" id="PrintMe">
            <Typography variant="h6" gutterBottom>
              NIST Energy Escalation Rate Calculator
            </Typography>
            <EercForm />
          </Box>
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
