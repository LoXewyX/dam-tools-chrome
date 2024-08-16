import { render } from 'preact';
import App from './App';

console.info('DAM Tool State: %cRunning ⚡', 'color: lime;');

render(<App />, document.getElementById('dam-tools-root')!);
