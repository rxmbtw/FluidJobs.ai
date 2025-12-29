// Script to clear theme-related localStorage items
// Run this in the browser console to clear any cached theme data

console.log('Clearing theme-related localStorage items...');

// Clear theme data
localStorage.removeItem('theme');
localStorage.removeItem('fluidjobs_theme');

// Clear any other theme-related keys
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('theme') || key.toLowerCase().includes('dark')) {
    console.log(`Removing localStorage item: ${key}`);
    localStorage.removeItem(key);
  }
});

console.log('Theme localStorage cleared successfully!');
console.log('Please refresh the page to see the changes.');