import React from 'react';
import ReactDOM from 'react-dom';

import App from './features/app/App';
import './firebase';
import './index.css';

import { Buffer } from 'buffer';

// Unfortunately, we have to set Buffer as a global here in order to get
// @confuzzle/puz-crossword, built for Node.js, to work properly in the browser
window.Buffer = Buffer;

ReactDOM.render(<App />, document.getElementById('root'));
