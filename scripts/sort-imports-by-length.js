const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);

function getScriptKind(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.ts':
      return ts.ScriptKind.TS;
    default:
      return ts.ScriptKind.JS;
  }
}

function getImportSource(node) {
  return node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
    ? node.moduleSpecifier.text
    : '';
}

function getGroup(source) {
  if (source === 'react') return 0;
  if (source.startsWith('./') || source.startsWith('../')) return 1;
  return 2;
}

function compareImports(a, b) {
  const sourceA = getImportSource(a.node);
  const sourceB = getImportSource(b.node);
  const groupDifference = getGroup(sourceA) - getGroup(sourceB);

  if (groupDifference !== 0) return groupDifference;
  if (sourceA.length !== sourceB.length) return sourceA.length - sourceB.length;
  return sourceA.localeCompare(sourceB) || a.index - b.index;
}

function sortImports(filePath) {
  if (!supportedExtensions.has(path.extname(filePath).toLowerCase())) return;

  const absolutePath = path.resolve(filePath);
  const originalText = fs.readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    absolutePath,
    originalText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(absolutePath),
  );
  const statements = sourceFile.statements;
  let index = 0;

  // Keep leading directives such as 'use client' before imports.
  while (
    index < statements.length &&
    ts.isExpressionStatement(statements[index]) &&
    ts.isStringLiteral(statements[index].expression)
  ) {
    index += 1;
  }

  const imports = [];
  while (
    index < statements.length &&
    ts.isImportDeclaration(statements[index])
  ) {
    imports.push({ node: statements[index], index: imports.length });
    index += 1;
  }

  if (imports.length < 2) return;

  // Don't risk detaching or deleting comments placed between imports.
  for (let i = 1; i < imports.length; i += 1) {
    const gap = originalText.slice(
      imports[i - 1].node.end,
      imports[i].node.getStart(sourceFile),
    );
    if (/\/\/|\/\*/.test(gap)) return;
  }

  const sorted = [...imports].sort(compareImports);
  const changed = sorted.some((item, i) => item.node !== imports[i].node);
  if (!changed) return;

  const eol = originalText.includes('\r\n') ? '\r\n' : '\n';
  const replacement = sorted
    .map(({ node }) => originalText.slice(node.getStart(sourceFile), node.end))
    .join(eol);
  const firstStart = imports[0].node.getStart(sourceFile);
  const lastEnd = imports[imports.length - 1].node.end;
  const updatedText =
    originalText.slice(0, firstStart) +
    replacement +
    originalText.slice(lastEnd);

  fs.writeFileSync(absolutePath, updatedText, 'utf8');
}

for (const filePath of process.argv.slice(2)) {
  try {
    sortImports(filePath);
  } catch (error) {
    console.error(`Failed to sort imports in ${filePath}:`, error.message);
    process.exitCode = 1;
  }
}
