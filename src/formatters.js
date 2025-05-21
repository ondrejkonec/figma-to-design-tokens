const fs = require('fs');
const path = require('path');

function formatToCSSVariables(tokens) {
  let css = `:root {\n`;
  
  // Barvy
  if (tokens.tokens.colors) {
    Object.entries(tokens.tokens.colors).forEach(([key, token]) => {
      if (key !== 'type') {
        css += `  --color-${key}: ${token.value};\n`;
      }
    });
  }
  
  // Typografie
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
  
  // Stíny
  if (tokens.tokens.shadows) {
    Object.entries(tokens.tokens.shadows).forEach(([key, token]) => {
      if (key !== 'type') {
        css += `  --shadow-${key}: ${token.value};\n`;
      }
    });
  }
  
  // Zaoblení
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
  let scss = `// Design Tokens vygenerované z Figmy\n\n`;
  
  // Barvy
  if (tokens.tokens.colors) {
    scss += `// Barvy\n`;
    Object.entries(tokens.tokens.colors).forEach(([key, token]) => {
      if (key !== 'type') {
        scss += `$color-${key}: ${token.value};\n`;
      }
    });
    scss += `\n`;
  }
  
  // Typografie
  if (tokens.tokens.typography) {
    scss += `// Typografie\n`;
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
  
  // Stíny
  if (tokens.tokens.shadows) {
    scss += `// Stíny\n`;
    Object.entries(tokens.tokens.shadows).forEach(([key, token]) => {
      if (key !== 'type') {
        scss += `$shadow-${key}: ${token.value};\n`;
      }
    });
    scss += `\n`;
  }
  
  // Zaoblení
  if (tokens.tokens.borderRadius) {
    scss += `// Zaoblení\n`;
    Object.entries(tokens.tokens.borderRadius).forEach(([key, token]) => {
      if (key !== 'type') {
        scss += `$border-radius-${key}: ${token.value};\n`;
      }
    });
  }
  
  return scss;
}

function saveFormattedOutput(tokens, outputDir) {
  // Vytvoření adresáře, pokud neexistuje
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Uložení CSS proměnných
  const cssOutput = formatToCSSVariables(tokens);
  fs.writeFileSync(path.join(outputDir, 'design-tokens.css'), cssOutput);
  console.log(`CSS proměnné byly uloženy do souboru ${path.join(outputDir, 'design-tokens.css')}`);
  
  // Uložení Sass proměnných
  const sassOutput = formatToSassVariables(tokens);
  fs.writeFileSync(path.join(outputDir, 'design-tokens.scss'), sassOutput);
  console.log(`Sass proměnné byly uloženy do souboru ${path.join(outputDir, 'design-tokens.scss')}`);
}

module.exports = {
  formatToCSSVariables,
  formatToSassVariables,
  saveFormattedOutput
};