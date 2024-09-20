const { exec } = require('child_process');
const path = require('path');

const frontendPath = path.join(__dirname, '../frontend');

exec('npm start', { cwd: frontendPath }, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error starting frontend: ${err}`);
    return;
  }
  console.log(`Frontend stdout: ${stdout}`);
  console.error(`Frontend stderr: ${stderr}`);
});
