const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app/(admin)/admin', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix invalid tailwind classes caused by previous double-replace
    content = content.replace(/dark:bg-cyan-950\/20\/50/g, 'dark:bg-cyan-950/20');
    
    // Specifically fix ParticipantManager background color error
    // In ParticipantManager.tsx line 87 it's bg-white dark:bg-[#080d1a]
    // line 88 it's bg-slate-50 dark:bg-cyan-950/20
    // wait, if we replace /20/50 with /20, it fixes it globally.
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
    }
  }
});
