import React from 'react';
import ReactDOM from 'react-dom';

import App from './features/app/App';
import './firebase';
import './index.css';

import { Buffer } from 'buffer';

window.Buffer = Buffer;

ReactDOM.render(<App />, document.getElementById('root'));
