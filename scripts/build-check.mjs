import { existsSync } from 'node:fs';
for (const file of ['index.html', 'app.js', 'styles.css', 'calc.mjs']) {
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
}
console.log('Static application build check passed.');
