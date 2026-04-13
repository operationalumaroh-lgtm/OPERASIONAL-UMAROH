const fs = require('fs');

let content = fs.readFileSync('src/data/hotels.ts', 'utf8');

// The incorrectly inserted hotels start right after `const merged = [...parsed, ...missingHotels`
// Let's find `const merged = [...parsed, ...missingHotels,`
const badInsertStart = content.indexOf('const merged = [...parsed, ...missingHotels,\n  {');
if (badInsertStart !== -1) {
  const badInsertEnd = content.indexOf('];\n        localStorage.setItem', badInsertStart);
  if (badInsertEnd !== -1) {
    // Extract the hotels JSON
    const hotelsJsonStr = '[' + content.substring(badInsertStart + 'const merged = [...parsed, ...missingHotels,\n'.length, badInsertEnd) + ']';
    
    // Fix the getHotels function
    content = content.substring(0, badInsertStart) + 'const merged = [...parsed, ...missingHotels];\n' + content.substring(badInsertEnd + '];\n'.length);
    
    // Now insert the hotels at the end of defaultHotels
    // We need to find the actual end of defaultHotels array.
    // It's right before `export const getHotels`
    const defaultHotelsEnd = content.indexOf('];\n\nexport const getHotels');
    if (defaultHotelsEnd !== -1) {
      // The hotelsJsonStr is an array, we want the inside of it.
      const innerHotels = hotelsJsonStr.substring(1, hotelsJsonStr.length - 1);
      content = content.substring(0, defaultHotelsEnd) + ',\n' + innerHotels + '\n' + content.substring(defaultHotelsEnd);
      fs.writeFileSync('src/data/hotels.ts', content);
      console.log('Fixed hotels.ts');
    } else {
      console.log('Could not find defaultHotels end');
    }
  } else {
    console.log('Could not find bad insert end');
  }
} else {
  console.log('Could not find bad insert start');
}
