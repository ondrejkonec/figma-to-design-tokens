const { callFigmaAPI, getFileStyles, FILE_KEY } = require('./api');

// Extract color values
async function extractColors() {
  console.log('Getting colors from Figma...');
  
  const colorTokens = {};
  
  try {
    // Try to get styles
    const stylesResponse = await callFigmaAPI(`files/${FILE_KEY}/styles`);
    
    // Check response structure
    console.log('Styles response structure:');
    console.log(JSON.stringify(Object.keys(stylesResponse), null, 2));
    
    // Get styles
    const styles = stylesResponse.meta?.styles || [];
    console.log(`Found ${styles.length} styles`);
    
    // Filter only color styles (FILL)
    const colorStyles = styles.filter(style => style.style_type === 'FILL');
    console.log(`Of which ${colorStyles.length} are color styles`);
    
    // Get details for each color style
    for (const style of colorStyles) {
      const styleName = style.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
      
      try {
        // If we have node_id, try to get the color
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
                console.log(`Extracted color: ${styleName}`);
              }
            }
          }
        }
      } catch (nodeError) {
        console.log(`Failed to get color details for style ${styleName}: ${nodeError.message}`);
      }
    }
    
    return colorTokens;
  } catch (error) {
    console.error('Error getting colors:', error);
    return {};
  }
}

// Get typography
async function extractTypography() {
  console.log('Getting typography from Figma...');
  
  const typographyTokens = {};
  
  try {
    // Get styles
    const stylesResponse = await callFigmaAPI(`files/${FILE_KEY}/styles`);
    const styles = stylesResponse.meta?.styles || [];
    
    // Filter only typography styles
    const textStyles = styles.filter(style => style.style_type === 'TEXT');
    console.log(`Found ${textStyles.length} typography styles`);
    
    // For each typography style get details
    for (const style of textStyles) {
      const styleName = style.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
      
      try {
        // If we have node_id, try to get typography
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
              
              console.log(`Extracted typography: ${styleName}`);
            }
          }
        }
      } catch (nodeError) {
        console.log(`Failed to get typography details for style ${styleName}: ${nodeError.message}`);
      }
    }
    
    return typographyTokens;
  } catch (error) {
    console.error('Error getting typography:', error);
    return {};
  }
}

// Get shadows
async function extractShadows() {
  console.log('Getting shadows from Figma...');
  
  const shadowTokens = {};
  
  try {
    // Get styles
    const stylesResponse = await callFigmaAPI(`files/${FILE_KEY}/styles`);
    const styles = stylesResponse.meta?.styles || [];
    
    // Filter only effect styles (shadows)
    const effectStyles = styles.filter(style => style.style_type === 'EFFECT');
    console.log(`Found ${effectStyles.length} effect styles`);
    
    // For each effect style get details
    for (const style of effectStyles) {
      const styleName = style.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase();
      
      try {
        // If we have node_id, try to get effect
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
                console.log(`Extracted shadow: ${styleName}`);
              }
            }
          }
        }
      } catch (nodeError) {
        console.log(`Failed to get shadow details for style ${styleName}: ${nodeError.message}`);
      }
    }
    
    return shadowTokens;
  } catch (error) {
    console.error('Error getting shadows:', error);
    return {};
  }
}

// Main function for design tokens extraction
async function extractDesignTokens() {
  console.log('Starting design tokens extraction...');
  
  // Token categorization
  const tokens = {
    typography: {},
    colors: {},
    shadows: {},
    borderRadius: {}
  };
  
  // Get colors
  try {
    tokens.colors = await extractColors();
    console.log(`Successfully extracted ${Object.keys(tokens.colors).length} colors`);
  } catch (error) {
    console.error('Error extracting colors:', error);
  }
  
  // Get typography
  try {
    tokens.typography = await extractTypography();
    console.log(`Successfully extracted ${Object.keys(tokens.typography).length} typography styles`);
  } catch (error) {
    console.error('Error extracting typography:', error);
  }
  
  // Get shadows
  try {
    tokens.shadows = await extractShadows();
    console.log(`Successfully extracted ${Object.keys(tokens.shadows).length} shadows`);
  } catch (error) {
    console.error('Error extracting shadows:', error);
  }
  
  return tokens;
}

module.exports = {
  extractDesignTokens
};