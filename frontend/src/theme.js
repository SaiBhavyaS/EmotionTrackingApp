import { ThemeProvider, createTheme } from '@mui/material/styles';


const theme = createTheme({
  typography: {
    
    fontWeightBold:700
  },
  palette:
  {
    primary:
    {
      main:'#F96E61'
    }
  },
  overrides: {
    MuiButton: {
      raisedPrimary: {
        color: 'white',
      },
    },
  }
});

export default theme;