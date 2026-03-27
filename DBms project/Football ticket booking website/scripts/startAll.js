const { exec } = require("child_process");

console.log("🚀 Starting Backend...");
exec("cd server && npm run dev", (err) => {
  if (err) console.error(err);
});

setTimeout(() => {
  console.log("🚀 Starting Frontend...");
  exec("cd client && npm run dev", (err) => {
    if (err) console.error(err);
  });
}, 3000);

setTimeout(() => {
  console.log("🌐 Opening Website...");
  exec("xdg-open http://localhost:5173"); // Explicit xdg-open for linux execution
}, 8000);
