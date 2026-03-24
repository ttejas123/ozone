import { toolRegistry } from './src/tools/toolRegistry.js';
console.log(toolRegistry.map(t => typeof t.icon));
