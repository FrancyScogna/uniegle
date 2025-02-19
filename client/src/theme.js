import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff6600",
    },
    secondary: {
        main: "#ffcb6d",
    },
    error: {
      main: "#d32f2f",
    },
    success: {
      main: "#2e7d32",
    },
  },
  components: {
    MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            fontSize: "16px",
          },
          containedPrimary: {
            color: "white"
          },
          containedSecondary: {
            color: "#ff6600"
          }
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundColor: "#ffebc7",
            }
        }
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                backgroundColor: "#ffc865",
                color: "rgb(195, 78, 0)"
            },
        },
    },
  },
});

export default theme;
