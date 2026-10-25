const fs = require('fs');
const html = fs.readFileSync('plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/assets/handbook-shell.html', 'utf8');
const searchString = "function filterFormat(){const q=$('format-search').value.trim().toLowerCase();let shown=0;$('format-page-sections').querySelectorAll('.format-card').forEach(card=>{card.hidden=!!q&&!card.dataset.formatName.includes(q);if(!card.hidden)shown++});$('format-empty').hidden=shown>0}";
console.log("has original filterFormat:", html.includes(searchString));
