import { spawn } from 'child_process';

const javaBin = 'C:\\Program Files\\Microsoft\\jdk-21.0.12.8-hotspot\\bin';
const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Program Files\\Microsoft\\jdk-21.0.12.8-hotspot',
  PATH: `${javaBin};${process.env.PATH || ''}`
};

console.log('🚀 Iniciando Firebase Emulator Suite con Java 21...');
const child = spawn('npx.cmd', ['firebase', 'emulators:start', '--only', 'firestore,auth'], {
  env,
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
