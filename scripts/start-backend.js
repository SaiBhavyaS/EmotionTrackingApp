const { exec } = require('child_process');
const path = require('path');

const backendPath = path.join(__dirname, '../backend');

exec('python app.py', { cwd: backendPath }, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error starting backend: ${err}`);
    return;
  }
  console.log(`Backend stdout: ${stdout}`);
  console.error(`Backend stderr: ${stderr}`);
});
