// src/polyfills.js
import { Buffer } from 'buffer'; // no slash!
import process from 'process';

window.Buffer = Buffer;
window.process = process;