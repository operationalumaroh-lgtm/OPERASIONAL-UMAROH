import fs from 'fs';

let content = fs.readFileSync('src/data/hotels.ts', 'utf8');

// We need to parse the defaultHotels array.
// Since it's a TS file, we can extract the JSON part if it's strictly JSON.
// The array starts at `export const defaultHotels: Hotel[] = [` and ends at `];\n\nexport const getHotels`

const startIndex = content.indexOf('export const defaultHotels: Hotel[] = [');
const endIndex = content.indexOf('];\n\nexport const getHotels');

if (startIndex !== -1 && endIndex !== -1) {
  const arrayStr = content.substring(startIndex + 'export const defaultHotels: Hotel[] = '.length, endIndex + 1);
  
  try {
    // It might not be strict JSON (e.g. trailing commas, single quotes).
    // But let's try to evaluate it.
    const hotels = eval('(' + arrayStr + ')');
    
    const uniqueHotels = [];
    const seenIds = new Set();
    
    // Iterate backwards to keep the latest updates
    for (let i = hotels.length - 1; i >= 0; i--) {
      const h = hotels[i];
      if (!seenIds.has(h.id)) {
        seenIds.add(h.id);
        uniqueHotels.unshift(h);
      }
    }
    
    const newArrayStr = JSON.stringify(uniqueHotels, null, 2);
    
    const newContent = content.substring(0, startIndex + 'export const defaultHotels: Hotel[] = '.length) + 
                       newArrayStr + 
                       content.substring(endIndex + 1);
                       
    fs.writeFileSync('src/data/hotels.ts', newContent);
    console.log('Deduplicated successfully. Total unique hotels:', uniqueHotels.length);
  } catch (e) {
    console.error('Failed to parse or evaluate array:', e);
  }
} else {
  console.error('Could not find array boundaries.');
}

