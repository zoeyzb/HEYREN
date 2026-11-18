import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './experience.css';
import './polish.css';

const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;

if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
