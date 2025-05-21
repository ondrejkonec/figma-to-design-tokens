const { callFigmaAPI, getFileStyles, FILE_KEY } = require('./api');

// Extrakce barevných hodnot
async function extractColors() {
  console.log('Získávání barev z Figma...');
  
  const colorTokens = {};
  
  try {
    // Zkusíme získat styly
    const stylesResponse = await callFigmaAPI(`files/${FILE_KEY}/styles`);
    
    // Zkontrolujme strukturu odpovědi
    console.log('Struktura odpovědi styles:');
    console.log(JSON.stringify(Object.keys(stylesResponse), null, 2));
    
    // Získáme styly
    const styles = stylesResponse.meta?.styles || [];
    console.log(`Nalezeno ${styles.length} stylů`);
    
    // Filtrujeme jen barevné styly (FILL)
    const colorStyles = styles.filter(style => style.style_type === 'FILL');
    console.log(`Z toho ${colorStyles.length} barevných stylů`);
    
    // Pro každý barevný styl získáme detaily
    for (const style of colorStyles) {
      const styleName = style.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
      
      try {
        // Pokud máme node_id, pokusíme se získat barvu
        if (style.node_id) {
          const nodeData = await callFigmaAPI(`files/${FILE_KEY}/nodes?ids=${style.node_id}`);
          
          if (nodeData.nodes && nodeData.nodes[style.node_id]) {
            const node = nodeData.nodes[style.node_id].document;
            
            if (node && node.fills && node.fills.length > 0) {
              const fill = node.fills[0];
              
              if (fill.type === 'SOLID' && fill.color) {
                const { r, g, b, a } = fill.color;
                colorTokens[styleName] = {
                  value: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a || 1})`
                };
                console.log(`Extrahována barva: ${styleName}`);
              }
            }
          }
        }
      } catch (nodeError) {
        console.log(`Nepodařilo se získat detail barvy pro styl ${styleName}: ${nodeError.message}`);
      }
    }
    
    return colorTokens;
  } catch (error) {
    console.error('Chyba při získávání barev:', error);
    return {};
  }
}

// Získání typografie
async function extractTypography() {
  console.log('Získávání typografie z Figma...');
  
  const typographyTokens = {};
  
  try {
    // Získáme styly
    const stylesResponse = await callFigmaAPI(`files/${FILE_KEY}/styles`);
    const styles = stylesResponse.meta?.styles || [];
    
    // Filtrujeme jen typografické styly
    const textStyles = styles.filter(style => style.style_type === 'TEXT');
    console.log(`Nalezeno ${textStyles.length} typografických stylů`);
    
    // Pro každý typografický styl získáme detaily
    for (const style of textStyles) {
      const styleName = style.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
      
      try {
        // Pokud máme node_id, pokusíme se získat typografii
        if (style.node_id) {
          const nodeData = await callFigmaAPI(`files/${FILE_KEY}/nodes?ids=${style.node_id}`);
          
          if (nodeData.nodes && nodeData.nodes[style.node_id]) {
            const node = nodeData.nodes[style.node_id].document;
            
            if (node && node.style) {
              const { fontFamily, fontSize, fontWeight, lineHeightPercent, letterSpacing } = node.style;
              
              typographyTokens[styleName] = {
                fontFamily: { value: fontFamily },
                fontSize: { value: `${fontSize}px` },
                fontWeight: { value: fontWeight },
                lineHeight: { value: lineHeightPercent ? `${lineHeightPercent}%` : 'normal' },
                letterSpacing: { value: letterSpacing ? `${letterSpacing}px` : 'normal' }
              };
              
              console.log(`Extrahována typografie: ${styleName}`);
            }
          }
        }
      } catch (nodeError) {
        console.log(`Nepodařilo se získat detail typografie pro styl ${styleName}: ${nodeError.message}`);
      }
    }
    
    return typographyTokens;
  } catch (error) {
    console.error('Chyba při získávání typografie:', error);
    return {};
  }
}

// Získání stínů
async function extractShadows() {
  console.log('Získávání stínů z Figma...');
  
  const shadowTokens = {};
  
  try {
    // Získáme styly
    const stylesResponse = await callFigmaAPI(`files/${FILE_KEY}/styles`);
    const styles = stylesResponse.meta?.styles || [];
    
    // Filtrujeme jen styly efektů (stínů)
    const effectStyles = styles.filter(style => style.style_type === 'EFFECT');
    console.log(`Nalezeno ${effectStyles.length} stylů efektů`);
    
    // Pro každý styl efektu získáme detaily
    for (const style of effectStyles) {
      const styleName = style.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
      
      try {
        // Pokud máme node_id, pokusíme se získat efekt
        if (style.node_id) {
          const nodeData = await callFigmaAPI(`files/${FILE_KEY}/nodes?ids=${style.node_id}`);
          
          if (nodeData.nodes && nodeData.nodes[style.node_id]) {
            const node = nodeData.nodes[style.node_id].document;
            
            if (node && node.effects && node.effects.length > 0) {
              const shadows = node.effects
                .filter(effect => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')
                .map(shadow => {
                  const { offset, radius, color, type } = shadow;
                  const { x, y } = offset;
                  const { r, g, b, a } = color;
                  const inset = type === 'INNER_SHADOW' ? 'inset ' : '';
                  
                  return `${inset}${x}px ${y}px ${radius}px rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a || 1})`;
                });
              
              if (shadows.length > 0) {
                shadowTokens[styleName] = {
                  value: shadows.join(', ')
                };
                console.log(`Extrahován stín: ${styleName}`);
              }
            }
          }
        }
      } catch (nodeError) {
        console.log(`Nepodařilo se získat detail stínu pro styl ${styleName}: ${nodeError.message}`);
      }
    }
    
    return shadowTokens;
  } catch (error) {
    console.error('Chyba při získávání stínů:', error);
    return {};
  }
}

// Hlavní funkce pro extrakci design tokenů
async function extractDesignTokens() {
  console.log('Začínám extrakci design tokenů...');
  
  // Kategorizace tokenů
  const tokens = {
    typography: {},
    colors: {},
    shadows: {},
    borderRadius: {}
  };
  
  // Získání barev
  try {
    tokens.colors = await extractColors();
    console.log(`Úspěšně extrahováno ${Object.keys(tokens.colors).length} barev`);
  } catch (error) {
    console.error('Chyba při extrakci barev:', error);
  }
  
  // Získání typografie
  try {
    tokens.typography = await extractTypography();
    console.log(`Úspěšně extrahováno ${Object.keys(tokens.typography).length} typografických stylů`);
  } catch (error) {
    console.error('Chyba při extrakci typografie:', error);
  }
  
  // Získání stínů
  try {
    tokens.shadows = await extractShadows();
    console.log(`Úspěšně extrahováno ${Object.keys(tokens.shadows).length} stínů`);
  } catch (error) {
    console.error('Chyba při extrakci stínů:', error);
  }
  
  return tokens;
}

module.exports = {
  extractDesignTokens
};