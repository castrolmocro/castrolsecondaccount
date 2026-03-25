const { spawn } = require('child_process');

/**
 * حل مشكلة الشايلد اوفرلود
 * - ايقاف اللوب للشايلد بعد الكراش
 * - استخدام الهاندلر مرة واحدة لعدم الضغط على الليستنر
 */

let currentChild = null;

function killChild() {
  if (currentChild && !currentChild.killed) {
    try { currentChild.kill('SIGTERM'); } catch (e) {}
  }
}

process.on('SIGINT',  () => { killChild(); process.exit(0); });
process.on('SIGTERM', () => { killChild(); process.exit(0); });

function start() {
    console.log('Starting Messenger Bot...');
    currentChild = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    currentChild.on('close', (code) => {
        currentChild = null;
        const delay = (code === 0 || code === 1) ? 2000 : 10000;
        console.log(`Bot process exited with code ${code}. Restarting in ${delay/1000}s...`);
        setTimeout(start, delay);
    });

    currentChild.on('error', (err) => {
        currentChild = null;
        console.error('Failed to start bot:', err);
        setTimeout(start, 20000); 
    });
}

start();
