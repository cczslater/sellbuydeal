// index.js - GUI-friendly startup for cPanel Passenger
const { spawn } = require("child_process");

const child = spawn("npm", ["run", "build"], {
  stdio: "inherit",
  shell: true
});

child.on("close", (code) => {
  if(code === 0) {
    const start = spawn("npm", ["start"], {
      stdio: "inherit",
      shell: true
    });
    start.on("close", (c) => console.log(`Next.js exited with code ${c}`));
  } else {
    console.log(`Build failed with code ${code}`);
  }
});
