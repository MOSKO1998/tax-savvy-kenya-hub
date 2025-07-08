
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loaded - starting app initialization');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}

console.log('Root element found, creating React root');
const root = createRoot(rootElement);

try {
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback rendering
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Tax Compliance Hub</h1>
      <p>Application failed to load. Please check the console for errors.</p>
      <p>Error: ${error}</p>
    </div>
  `;
}
