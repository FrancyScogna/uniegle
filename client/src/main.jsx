import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import RouterApp from './router.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <RouterApp />
    </BrowserRouter>
)
