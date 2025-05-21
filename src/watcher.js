const fs = require('fs');
const path = require('path');
const { callFigmaAPI, FILE_KEY } = require('./api');
const { extractDesignTokens } = require('./extractors');
const { convertToW3CFormat } = require('./converter');
const { saveFormattedOutput } = require('./formatters');

let lastVersionId = null;

async function checkForUpdates() {
  try {
    console.log('Kontrola aktualizací Figma souboru...');
    
    // Zkusíme získat informace o verzi
    let fileInfo;
    let currentVersionId;
    
    try {
      fileInfo = await callFigmaAPI(`designs/${FILE_KEY}`);
      currentVersionId = fileInfo.version;
      console.log(`Úspěšně získána verze přes designs/ endpoint: ${currentVersionId}`);
    } catch (designError) {
      console.log("Nepodařilo se získat informace přes designs endpoint, zkouším files endpoint...");
      try {
        fileInfo = await callFigmaAPI(`files/${FILE_KEY}`);
        currentVersionId = fileInfo.version;
        console.log(`Úspěšně získána verze přes files/ endpoint: ${currentVersionId}`);
      } catch (fileError) {
        // Pokud nemůžeme získat verzi, použijeme timestamp
        currentVersionId = new Date().toISOString();
        console.log(`Nepodařilo se získat verzi, používám timestamp: ${currentVersionId}`);
      }
    }
    
    if (lastVersionId && lastVersionId !== currentVersionId) {
      console.log('Detekována změna v knihovně Figma!');
      console.log(`Předchozí verze: ${lastVersionId}, nová verze: ${currentVersionId}`);
      
      // Získání aktualizovaných tokenů a jejich uložení
      const tokens = await extractDesignTokens();
      const w3cTokens = convertToW3CFormat(tokens);
      saveTokensToFiles(w3cTokens);
    } else if (!lastVersionId) {
      // První spuštění
      console.log('První spuštění, generuji tokeny...');
      const tokens = await extractDesignTokens();
      const w3cTokens = convertToW3CFormat(tokens);
      saveTokensToFiles(w3cTokens);
    } else {
      console.log('Žádné změny nebyly detekovány.');
      console.log(`Aktuální verze: ${currentVersionId}`);
    }
    
    lastVersionId = currentVersionId;
  } catch (error) {
    console.error('Chyba při kontrole aktualizací:', error);
  }
}

function saveTokensToFiles(tokens) {
  const outputDir = path.join(__dirname, '..', 'output');
  
  // Vytvoření adresáře, pokud neexistuje
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Uložení JSON formátu
  const outputPath = path.join(outputDir, 'design-tokens.json');
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
  console.log(`Design tokeny byly uloženy do souboru ${outputPath}`);
  
  // Uložení CSS a Sass formátů
  saveFormattedOutput(tokens, outputDir);
}

module.exports = {
  checkForUpdates
};