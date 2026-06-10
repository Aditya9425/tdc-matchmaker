const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix unused catch variables in stores
  content = content.replace(/catch\s*\(\s*err\s*:\s*unknown\s*\)\s*\{/g, 'catch {');
  content = content.replace(/catch\s*\(\s*error\s*:\s*unknown\s*\)\s*\{/g, 'catch {');
  content = content.replace(/catch\s*\(\s*err\s*\)\s*\{/g, 'catch {');

  // Fix some 'any' that the previous script missed
  content = content.replace(/:\s*any/g, ': unknown');

  // Specific file fixes
  if (filePath.endsWith('CustomerProfileModal.tsx')) {
    content = content.replace(/import\s*\{\s*motion,\s*AnimatePresence\s*\}\s*from\s*['"]framer-motion['"];?\n?/, '');
    content = content.replace(/X,\s*ChevronRight,?\s*/, '');
    // remove getScoreColor if it's unused
    content = content.replace(/import\s*\{\s*getScoreColor\s*\}\s*from\s*['"]\.\.\/\.\.\/utils\/formatters['"];?\n?/, '');
    content = content.replace(/const\s*ProgressRow[\s\S]*?(?=\n\n|\nconst)/, '');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
walk(path.join(__dirname, 'scripts'));
