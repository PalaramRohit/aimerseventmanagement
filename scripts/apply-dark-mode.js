const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  [/bg-white(?! dark:)/g, 'bg-white dark:bg-[#080d1a]'],
  [/text-slate-900(?! dark:)/g, 'text-slate-900 dark:text-white'],
  [/text-slate-800(?! dark:)/g, 'text-slate-800 dark:text-slate-100'],
  [/text-slate-700(?! dark:)/g, 'text-slate-700 dark:text-slate-200'],
  [/text-slate-600(?! dark:)/g, 'text-slate-600 dark:text-slate-300'],
  [/text-slate-500(?! dark:)/g, 'text-slate-500 dark:text-slate-400'],
  [/border-slate-200(?! dark:)/g, 'border-slate-200 dark:border-cyan-900/30'],
  [/border-slate-100(?! dark:)/g, 'border-slate-100 dark:border-cyan-900/20'],
  [/bg-slate-50(?! dark:)/g, 'bg-slate-50 dark:bg-cyan-950/20'],
  [/bg-slate-100(?! dark:)/g, 'bg-slate-100 dark:bg-cyan-900/20']
];

walkDir('src/app/(admin)/admin', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [regex, replacement] of replacements) {
      content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
