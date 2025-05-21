const fs = require('fs');
const path = require('path');
const { callFigmaAPI, FILE_KEY } = require('./api');
const { extractDesignTokens } = require('./extractors');
const { convertToW3CFormat } = require('./converter');
const { saveFormattedOutput } = require('./formatters');

let lastVersionId = null;

async function checkForUpdates() {
  try {
    console.log('Checking for Figma file updates...');
    
    // Try to get version information
    let fileInfo;
    let currentVersionId;
    
    try {
      fileInfo = await callFigmaAPI(`designs/${FILE_KEY}`);
      currentVersionId = fileInfo.version;
      console.log(`Successfully retrieved version via designs/ endpoint: ${currentVersionId}`);
    } catch (designError) {
      console.log("Failed to get information via designs endpoint, trying files endpoint...");
      try {
        fileInfo = await callFigmaAPI(`files/${FILE_KEY}`);
        currentVersionId = fileInfo.version;
        console.log(`Successfully retrieved version via files/ endpoint: ${currentVersionId}`);
      } catch (fileError) {
        // If we can't get the version, use timestamp
        currentVersionId = new Date().toISOString();
        console.log(`Failed to get version, using timestamp: ${currentVersionId}`);
      }
    }
    
    if (lastVersionId && lastVersionId !== currentVersionId) {
      console.log('Change detected in Figma library!');
      console.log(`Previous version: ${lastVersionId}, new version: ${currentVersionId}`);
      
      // Get updated tokens and save them
      const tokens = await extractDesignTokens();
      const w3cTokens = convertToW3CFormat(tokens);
      saveTokensToFiles(w3cTokens);
    } else if (!lastVersionId) {
      // First run
      console.log('First run, generating tokens...');
      const tokens = await extractDesignTokens();
      const w3cTokens = convertToW3CFormat(tokens);
      saveTokensToFiles(w3cTokens);
    } else {
      console.log('No changes detected.');
      console.log(`Current version: ${currentVersionId}`);
    }
    
    lastVersionId = currentVersionId;
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

function saveTokensToFiles(tokens) {
  const outputDir = path.join(__dirname, '..', 'output');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save JSON format
  const outputPath = path.join(outputDir, 'design-tokens.json');
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
  console.log(`Design tokens have been saved to ${outputPath}`);
  
  // Save CSS and Sass formats
  saveFormattedOutput(tokens, outputDir);
}

module.exports = {
  checkForUpdates
};