console.clear();
const { spawn } = require("child_process");
const express = require("express");
const app = express();
const chalk = require('chalk');
const logger = require("./IMRANC.js");
const path = require('path'); 
const PORT = process.env.PORT || 5000;
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/website/ryuko.html'));
});
console.clear();
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

function startServer(retryCount = 0) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.loader(`app deployed on port ${chalk.blueBright(PORT)}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retryCount < 5) {
      console.log(chalk.yellow(`Port ${PORT} is busy, retrying in 3 seconds... (attempt ${retryCount + 1})`));
      setTimeout(() => startServer(retryCount + 1), 3000);
    } else {
      console.error('Server error:', err);
    }
  });
}

let serverStarted = false;
let currentChild = null;

function killChild() {
  if (currentChild && !currentChild.killed) {
    try { currentChild.kill('SIGTERM'); } catch (e) {}
  }
}

process.on('SIGTERM', () => { killChild(); process.exit(0); });
process.on('SIGINT',  () => { killChild(); process.exit(0); });

function startBot(message) {
  (message) ? logger(message, "starting") : "";
  console.log(chalk.blue('DEPLOYING MAIN SYSTEM'));
  if (!serverStarted) {
    logger.loader(`deploying app on port ${chalk.blueBright(PORT)}`);
    startServer();
    serverStarted = true;
  }

  currentChild = spawn("node", ["--unhandled-rejections=warn", "--trace-warnings", "--async-stack-traces", "IMRANB.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  currentChild.on("close", (codeExit) => {
    currentChild = null;
    if (codeExit != 0) {
      console.log(chalk.yellow(`Bot exited with code ${codeExit}, restarting in 5s...`));
      setTimeout(() => startBot(), 5000);
    }
  });

  currentChild.on("error", function(error) {
    currentChild = null;
    logger("an error occurred : " + JSON.stringify(error), "error");
    setTimeout(() => startBot(), 5000);
  });
}

startBot();
