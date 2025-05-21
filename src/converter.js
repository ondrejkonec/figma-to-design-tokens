function convertToW3CFormat(tokens) {
  const w3cTokens = {
    $schema: "https://design-tokens.github.io/design-tokens/tokens.schema.json",
    tokens: {}
  };
  
  // Typografie
  if (Object.keys(tokens.typography).length > 0) {
    w3cTokens.tokens.typography = {
      type: "typography",
      ...Object.entries(tokens.typography).reduce((acc, [key, value]) => {
        acc[key] = {
          type: "typography",
          ...value
        };
        return acc;
      }, {})
    };
  }
  
  // Barvy
  if (Object.keys(tokens.colors).length > 0) {
    w3cTokens.tokens.colors = {
      type: "color",
      ...Object.entries(tokens.colors).reduce((acc, [key, value]) => {
        acc[key] = {
          type: "color",
          ...value
        };
        return acc;
      }, {})
    };
  }
  
  // Stíny
  if (Object.keys(tokens.shadows).length > 0) {
    w3cTokens.tokens.shadows = {
      type: "shadow",
      ...Object.entries(tokens.shadows).reduce((acc, [key, value]) => {
        acc[key] = {
          type: "shadow",
          ...value
        };
        return acc;
      }, {})
    };
  }
  
  // Zaoblení
  if (Object.keys(tokens.borderRadius).length > 0) {
    w3cTokens.tokens.borderRadius = {
      type: "dimension",
      ...Object.entries(tokens.borderRadius).reduce((acc, [key, value]) => {
        acc[key] = {
          type: "dimension",
          ...value
        };
        return acc;
      }, {})
    };
  }
  
  return w3cTokens;
}

module.exports = {
  convertToW3CFormat
};