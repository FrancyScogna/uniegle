import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import RouterApp from './router.jsx';
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme"; // Importa il tema

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            <RouterApp />
        </ThemeProvider>
    </BrowserRouter>
)
