// src/index.js
const { checkForUpdates } = require('./watcher');

// Nastavení intervalu aktualizace v milisekundách (výchozí 1 hodina)
const updateInterval = process.env.UPDATE_INTERVAL ? 
                       parseInt(process.env.UPDATE_INTERVAL) * 1000 : 
                       60 * 60 * 1000;

// Při spuštění zkontrolovat a vygenerovat tokeny
async function main() {
  console.log('Spouštím proces extrakce design tokenů z Figma...');
  
  try {
    // První kontrola a generování
    await checkForUpdates();
    
    // Rozhodnutí, zda spustit sledování nebo jednorázovou extrakci
    const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');
    
    if (watchMode) {
      console.log(`Nastaveno periodické sledování změn - interval ${updateInterval/1000/60} minut`);
      setInterval(checkForUpdates, updateInterval);
    } else {
      console.log('Jednorázová extrakce dokončena. Pro kontinuální sledování spusťte s parametrem --watch');
    }
  } catch (error) {
    console.error('Došlo k chybě:', error);
    process.exit(1);
  }
}

main();