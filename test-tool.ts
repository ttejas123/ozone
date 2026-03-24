import { toolRegistry } from './src/tools/toolRegistry';
toolRegistry.forEach(t => {
  if (!t.icon) console.log(`${t.id} icon is undefined!`);
  else if (typeof t.icon !== 'object' && typeof t.icon !== 'function') console.log(`${t.id} icon is ${typeof t.icon}`);
});
console.log('Done checking icons.');
