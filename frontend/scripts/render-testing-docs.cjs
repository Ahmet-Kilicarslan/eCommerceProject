const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const repoRoot = path.resolve(__dirname, '..', '..');
const docsDir = path.join(repoRoot, 'docs', 'testing');
const htmlDir = path.join(docsDir, 'html');
const pdfDir = path.join(docsDir, 'pdf');

const documents = [
  'PrimeStack_TestPlan.md',
  'PrimeStack_TestCaseDesign.md',
  'PrimeStack_TestExecutionReport.md',
  'PrimeStack_DefectReport.md',
];

fs.mkdirSync(htmlDir, { recursive: true });
fs.mkdirSync(pdfDir, { recursive: true });

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return output;
}

function tableToHtml(lines) {
  const rows = lines
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim()));
  const header = rows[0] || [];
  const body = rows.slice(2);
  return [
    '<div class="table-wrap"><table>',
    '<thead><tr>',
    ...header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`),
    '</tr></thead>',
    '<tbody>',
    ...body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`),
    '</tbody></table></div>',
  ].join('');
}

function markdownToHtml(markdown, baseName) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map((line) => inlineMarkdown(line.replace(/\s+$/, ''))).join('<br>')}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    list = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*)]\((.*)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      const alt = escapeHtml(imageMatch[1]);
      const src = imageMatch[2];
      html.push(`<figure><img src="../${src}" alt="${alt}"><figcaption>${alt}</figcaption></figure>`);
      continue;
    }

    if (trimmed.startsWith('|') && lines[index + 1]?.trim().startsWith('| ---')) {
      flushParagraph();
      flushList();
      const tableLines = [trimmed, lines[index + 1].trim()];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      index -= 1;
      html.push(tableToHtml(tableLines));
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      flushList();
      const items = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      index -= 1;
      html.push(`<ol>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ol>`);
      continue;
    }

    const bullet = trimmed.match(/^-\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(baseName)}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      color: #172033;
      background: #f4f7fb;
      line-height: 1.55;
      font-size: 11px;
    }
    .page {
      background: white;
      max-width: 1000px;
      margin: 0 auto;
      padding: 34px 42px;
      border-top: 8px solid #2454a6;
    }
    h1 {
      margin: 0 0 14px;
      color: #123366;
      font-size: 28px;
      line-height: 1.15;
      letter-spacing: 0;
    }
    h2 {
      margin: 28px 0 10px;
      padding-top: 12px;
      border-top: 1px solid #d7e0ee;
      color: #2454a6;
      font-size: 18px;
      letter-spacing: 0;
    }
    h3 {
      margin: 20px 0 8px;
      color: #172033;
      font-size: 14px;
      letter-spacing: 0;
    }
    p { margin: 8px 0; }
    code {
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 10px;
      background: #eef3fa;
      color: #0e326a;
      padding: 1px 4px;
      border-radius: 4px;
    }
    ul, ol { margin: 8px 0 12px 20px; padding: 0; }
    li { margin: 3px 0; }
    .table-wrap {
      width: 100%;
      overflow: visible;
      margin: 10px 0 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
      font-size: 9.5px;
    }
    tr { page-break-inside: avoid; }
    th {
      background: #2454a6;
      color: white;
      text-align: left;
      font-weight: 700;
      padding: 7px 8px;
      border: 1px solid #1a4389;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #d7e0ee;
      vertical-align: top;
    }
    th:first-child,
    td:first-child {
      white-space: nowrap;
    }
    tbody tr:nth-child(even) td { background: #f7f9fd; }
    figure {
      margin: 14px 0 20px;
      page-break-inside: avoid;
      border: 1px solid #d7e0ee;
      padding: 8px;
      background: #fbfcff;
    }
    img {
      display: block;
      width: 100%;
      max-height: 430px;
      object-fit: contain;
    }
    figcaption {
      margin-top: 6px;
      color: #5b6678;
      font-size: 9px;
    }
    @media print {
      body { background: white; }
      .page { padding: 0; border-top: none; }
    }
  </style>
</head>
<body>
  <main class="page">
    ${html.join('\n')}
  </main>
</body>
</html>`;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    chromiumSandbox: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const documentName of documents) {
      const markdownPath = path.join(docsDir, documentName);
      const baseName = path.basename(documentName, '.md');
      const htmlPath = path.join(htmlDir, `${baseName}.html`);
      const pdfPath = path.join(pdfDir, `${baseName}.pdf`);
      const markdown = fs.readFileSync(markdownPath, 'utf8');
      fs.writeFileSync(htmlPath, markdownToHtml(markdown, baseName));

      const page = await browser.newPage();
      await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="font-size:8px;color:#667085;width:100%;padding:0 14mm;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
        margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
      });
      await page.close();
      console.log(`Rendered ${pdfPath}`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
