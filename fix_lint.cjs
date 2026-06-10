const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Fix unused vars and any in catch blocks
  content = content.replace(/catch\s*\(\s*(err|error|e)\s*:\s*any\s*\)\s*\{/g, (match, p1) => {
    // We will just change it to catch (err) for now. If it's unused, typescript-eslint will complain about unused. 
    // Wait, let's just use catch { } if it's unused, but it's hard to know if it's used.
    // Let's just remove the `: any` part, and if the variable is unused, we can replace it with `_` or `_err` maybe? Or just ignore unused vars for now.
    // Let's change it to `catch (error: unknown)` or `catch (err: unknown)`
    // Wait, if it's unused, the error is 'err' is defined but never used. We can prefix with underscore if we update eslint rules, but let's change to `catch` if it's not used.
    return `catch (${p1}: unknown) {`;
  });

  // Actually, replacing unused catch variables:
  // if err is unused, replace `catch (err: any)` with `catch`
  // We can just replace `catch (err: any)` with `catch` everywhere because they usually just console.error or do nothing? No, sometimes they do console.error(err).
  
  // Let's do string replacement for the common store patterns:
  content = content.replace(/catch \((err|error|e)(: any)?\) {\s*set\(\{/g, 'catch {\n        set({');
  content = content.replace(/catch \((err|error|e)(: any)?\) {\n\s*set\(\{/g, 'catch {\n        set({');
  content = content.replace(/catch \(err: any\) {\n\s*return null;/g, 'catch {\n      return null;');
  
  // Specific replacements for any
  content = content.replace(/err: any/g, 'err: unknown');
  content = content.replace(/error: any/g, 'error: unknown');
  content = content.replace(/e: any/g, 'e: unknown');
  content = content.replace(/profile: any/g, 'profile: Record<string, unknown>');
  content = content.replace(/value: any/g, 'value: unknown');

  // Fix react-hooks/set-state-in-effect
  // Not easy with regex, let's just add eslint-disable-next-line before useEffect
  
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
