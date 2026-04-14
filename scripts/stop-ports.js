import { execSync } from 'child_process';

const PORTS = [3005, 5176, 5177, 5178, 5179, 5180];

function killPort(port) {
  try {
    const output = execSync(`netstat -ano`, { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const localAddr = parts[1];
        const state = parts[3];
        const pid = parts[4];
        if (localAddr && localAddr.includes(`:${port}`) && state === 'LISTENING' && /^\d+$/.test(pid)) {
          pids.add(pid);
        }
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill //F //PID ${pid}`, { stdio: 'ignore' });
        console.log(`Killed process ${pid} on port ${port}`);
      } catch {}
    }
  } catch {}
}

try {
  execSync('taskkill //F //IM node.exe', { stdio: 'ignore' });
  console.log('Killed all node processes');
} catch {}

for (const port of PORTS) killPort(port);
console.log('Ports cleared');