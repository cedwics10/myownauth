// Lance l'API (port 3000) et le front Vue (Vite) en une seule commande : `npm run dev`.
const { spawn } = require('node:child_process');

const tasks = [
  { name: 'api', cwd: 'app', cmd: 'npm start' },
  { name: 'front', cwd: 'front', cmd: 'npm run dev' },
];

const children = tasks.map(({ name, cwd, cmd }) => {
  const child = spawn(cmd, { cwd: `${__dirname}/${cwd}`, shell: true });
  const prefix = (chunk) => chunk.toString().replace(/^(?=.)/gm, `[${name}] `);
  child.stdout.on('data', (chunk) => process.stdout.write(prefix(chunk)));
  child.stderr.on('data', (chunk) => process.stderr.write(prefix(chunk)));
  child.on('exit', (code) => {
    console.log(`[${name}] arrêté (code ${code}).`);
    children.forEach((other) => other.kill());
    process.exit(code ?? 0);
  });
  return child;
});

process.on('SIGINT', () => children.forEach((child) => child.kill()));
