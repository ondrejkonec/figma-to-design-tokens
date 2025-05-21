const fetch = require('node-fetch');
require('dotenv').config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FILE_KEY;

console.log("Using FIGMA_TOKEN:", FIGMA_TOKEN ? "Token set" : "Token missing");
console.log("Using FILE_KEY:", FILE_KEY);

async function callFigmaAPI(endpoint) {
  const url = `https://api.figma.com/v1/${endpoint}`;
  console.log(`API Call: ${url}`);
  
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

// Get all styles in Figma file
async function getFileStyles() {
  try {
    // Try new design format
    const fileData = await callFigmaAPI(`designs/${FILE_KEY}`);
    console.log("Successfully retrieved data via designs/ endpoint");
    return fileData.styles || {};
  } catch (designError) {
    console.log("Failed to use designs/ endpoint, trying files/ endpoint...");
    try {
      // Try old file format
      const fileData = await callFigmaAPI(`files/${FILE_KEY}`);
      console.log("Successfully retrieved data via files/ endpoint");
      return fileData.styles || {};
    } catch (fileError) {
      console.error("Failed to get styles through either endpoint");
      throw fileError;
    }
  }
}

module.exports = {
  callFigmaAPI,
  getFileStyles,
  FILE_KEY
};