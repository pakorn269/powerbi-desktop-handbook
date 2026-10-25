const fs = require('fs');
const html = fs.readFileSync('plugins/powerbi-desktop-handbook/skills/powerbi-desktop-handbook/assets/handbook-shell.html', 'utf8');
const searchString = "function filter(){const q=$('catalog-search').value.trim().toLowerCase(),s=$('status-filter').value;let shown=0;catalog.querySelectorAll('.catalog-item').forEach(el=>{const yes=(!q||el.dataset.search.includes(q))&&(!s||el.dataset.status===s);el.hidden=!yes;if(yes)shown++});$('empty').hidden=shown>0;$('filter-count').textContent=`${shown} of ${data.catalog.length} catalog items`}";
console.log("has original filter:", html.includes(searchString));
