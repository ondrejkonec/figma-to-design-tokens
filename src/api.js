const fetch = require('node-fetch');
require('dotenv').config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FILE_KEY;

console.log("Použití FIGMA_TOKEN:", FIGMA_TOKEN ? "Token nastaven" : "Token chybí");
console.log("Použití FILE_KEY:", FILE_KEY);

async function callFigmaAPI(endpoint) {
  const url = `https://api.figma.com/v1/${endpoint}`;
  console.log(`Volání API: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN
    }
  });
  
  if (!response.ok) {
    const responseText = await response.text();
    console.error(`API Response: ${responseText}`);
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Získání všech stylů ve Figma souboru
async function getFileStyles() {
  try {
    // Zkusíme nový formát designu
    const fileData = await callFigmaAPI(`designs/${FILE_KEY}`);
    console.log("Úspěšně získána data přes designs/ endpoint");
    return fileData.styles || {};
  } catch (designError) {
    console.log("Nepovedlo se použít designs/ endpoint, zkouším files/ endpoint...");
    try {
      // Zkusíme starý formát souboru
      const fileData = await callFigmaAPI(`files/${FILE_KEY}`);
      console.log("Úspěšně získána data přes files/ endpoint");
      return fileData.styles || {};
    } catch (fileError) {
      console.error("Nepodařilo se získat styly ani přes jeden z endpointů");
      throw fileError;
    }
  }
}

module.exports = {
  callFigmaAPI,
  getFileStyles,
  FILE_KEY
};