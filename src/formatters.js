const fs = require('fs');
const path = require('path');

function formatToCSSVariables(tokens) {
  let css = `:root {\n`;
  
  // Colors
  if (tokens.tokens.colors) {
    Object.entries(tokens.tokens.colors).forEach(([key, token]) => {
      if (key !== 'type') {
        css += `  --color-${key}: ${token.value};\n`;
      }
    });
  }
  
  // Typography
  if (tokens.tokens.typography) {
    Object.entries(tokens.tokens.typography).forEach(([key, token]) => {
      if (key !== 'type') {
        if (token.fontFamily) css += `  --font-family-${key}: ${token.fontFamily.value};\n`;
        if (token.fontSize) css += `  --font-size-${key}: ${token.fontSize.value};\n`;
        if (token.fontWeight) css += `  --font-weight-${key}: ${token.fontWeight.value};\n`;
        if (token.lineHeight) css += `  --line-height-${key}: ${token.lineHeight.value};\n`;
        if (token.letterSpacing) css += `  --letter-spacing-${key}: ${token.letterSpacing.value};\n`;
      }
    });
  }
  
  // Shadows
  if (tokens.tokens.shadows) {
    Object.entries(tokens.tokens.shadows).forEach(([key, token]) => {
      if (key !== 'type') {
        css += `  --shadow-${key}: ${token.value};\n`;
      }
    });
  }
  
  // Border Radius
  if (tokens.tokens.borderRadius) {
    Object.entries(tokens.tokens.borderRadius).forEach(([key, token]) => {
      if (key !== 'type') {
        css += `  --border-radius-${key}: ${token.value};\n`;
      }
    });
  }
  
  css += `}\n`;
  return css;
}

function formatToSassVariables(tokens) {
  let scss = `// Design Tokens generated from Figma\n\n`;
  
  // Colors
  if (tokens.tokens.colors) {
    scss += `// Colors\n`;
    Object.entries(tokens.tokens.colors).forEach(([key, token]) => {
      if (key !== 'type') {
        scss += `$color-${key}: ${token.value};\n`;
      }
    });
    scss += `\n`;
  }
  
  // Typography
  if (tokens.tokens.typography) {
    scss += `// Typography\n`;
    Object.entries(tokens.tokens.typography).forEach(([key, token]) => {
      if (key !== 'type') {
        if (token.fontFamily) scss += `$font-family-${key}: ${token.fontFamily.value};\n`;
        if (token.fontSize) scss += `$font-size-${key}: ${token.fontSize.value};\n`;
        if (token.fontWeight) scss += `$font-weight-${key}: ${token.fontWeight.value};\n`;
        if (token.lineHeight) scss += `$line-height-${key}: ${token.lineHeight.value};\n`;
        if (token.letterSpacing) scss += `$letter-spacing-${key}: ${token.letterSpacing.value};\n`;
      }
    });
    scss += `\n`;
  }
  
  // Shadows
  if (tokens.tokens.shadows) {
    scss += `// Shadows\n`;
    Object.entries(tokens.tokens.shadows).forEach(([key, token]) => {
      if (key !== 'type') {
        scss += `$shadow-${key}: ${token.value};\n`;
      }
    });
    scss += `\n`;
  }
  
  // Border Radius
  if (tokens.tokens.borderRadius) {
    scss += `// Border Radius\n`;
    Object.entries(tokens.tokens.borderRadius).forEach(([key, token]) => {
      if (key !== 'type') {
        scss += `$border-radius-${key}: ${token.value};\n`;
      }
    });
  }
  
  return scss;
}

function saveFormattedOutput(tokens, outputDir) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save CSS variables
  const cssOutput = formatToCSSVariables(tokens);
  fs.writeFileSync(path.join(outputDir, 'design-tokens.css'), cssOutput);
  console.log(`CSS variables have been saved to ${path.join(outputDir, 'design-tokens.css')}`);
  
  // Save Sass variables
  const sassOutput = formatToSassVariables(tokens);
  fs.writeFileSync(path.join(outputDir, 'design-tokens.scss'), sassOutput);
  console.log(`Sass variables have been saved to ${path.join(outputDir, 'design-tokens.scss')}`);
}

module.exports = {
  formatToCSSVariables,
  formatToSassVariables,
  saveFormattedOutput
};