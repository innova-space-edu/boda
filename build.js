const fs = require('fs');
const path = require('path');
const root = process.cwd();
const out = path.join(root, 'out');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
['index.html', 'styles.css', 'confirmar.html', 'datos.html'].forEach((file) => {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
});
console.log('Build listo');
