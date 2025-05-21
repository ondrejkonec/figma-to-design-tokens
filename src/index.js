// src/index.js
const { checkForUpdates } = require('./watcher');

// Update interval settings in milliseconds (default 1 hour)
const updateInterval = process.env.UPDATE_INTERVAL ? 
                       parseInt(process.env.UPDATE_INTERVAL) * 1000 : 
                       60 * 60 * 1000;

// Check and generate tokens on startup
async function main() {
  console.log('Starting design tokens extraction process from Figma...');
  
  try {
    // First check and generation
    await checkForUpdates();
    
    // Decide whether to start watching or one-time extraction
    const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');
    
    if (watchMode) {
      console.log(`Periodic change monitoring set - interval ${updateInterval/1000/60} minutes`);
      setInterval(checkForUpdates, updateInterval);
    } else {
      console.log('One-time extraction completed. For continuous monitoring, run with --watch parameter');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();