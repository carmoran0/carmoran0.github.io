#!/usr/bin/env node
/**
 * update-readme.js
 * Descarga el README del perfil (carmoran0/carmoran0), lo convierte a HTML sencillo
 * y reemplaza el bloque entre marcadores en: linkarlos.html, en/linkarlos.html, es/linkarlos.html
 *
 * No requiere dependencias externas (Node >= 18 recomendado por fetch nativo).
 */

const fs = require('fs');
const path = require('path');

const RAW_URL = 'https://raw.githubusercontent.com/carmoran0/carmoran0/refs/heads/main/README.md';
const TARGET_FILES = [
  'linkarlos.html',
  path.join('en', 'linkarlos.html'),
  path.join('es', 'linkarlos.html'),
];
const BEGIN_MARK = '<!-- README:BEGIN'; // coincide con comentarios con metadatos
const END_MARK = '<!-- README:END -->';

function convertMarkdownToHTML(markdown) {
  // Conversión básica (similar a js/github-readme.js)
  let html = markdown;

  // Proteger bloques HTML existentes del procesamiento Markdown
  const htmlBlocks = [];
  html = html.replace(/(<[^>]+>)/g, (match) => {
    const placeholder = `§HTML§${htmlBlocks.length}§`;
    htmlBlocks.push(match);
    return placeholder;
  });

  // Code blocks (```...```)
  const codeBlocks = [];
  html = html.replace(/```[\s\S]*?```/gim, (match) => {
    const code = match.slice(3, -3).trim();
    // Escapar HTML dentro del code block
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const placeholder = `§CODE§${codeBlocks.length}§`;
    codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
    return placeholder;
  });

  // Images ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;height:auto;">');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Headers
  html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');

  // Bold/Italic (order matters) - evitar procesar placeholders
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Solo __ que NO sean parte de placeholders
  html = html.replace(/(?<!§)__(?!.*§)(.+?)__(?!§)/g, '<strong>$1</strong>');
  // Guiones bajos: evitar dentro de palabras o placeholders
  html = html.replace(/(?<![a-zA-Z0-9_§])_(?!§)([^_\s§][^_§]*)_(?![a-zA-Z0-9_§])/g, '<em>$1</em>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, (m, p1) => {
    const esc = p1.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code>${esc}</code>`;
  });

  // Lists (li)
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Paragraphs (blank lines)
  html = html
    .split('\n\n')
    .map((paragraph) => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      if (/^<(h[1-6]|pre|ul|ol|blockquote|div)/i.test(paragraph)) return paragraph;
      if (/^§(HTML|CODE)§/.test(paragraph)) return paragraph; // No envolver placeholders solos
      return `<p>${paragraph.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');

  // Restaurar code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(new RegExp(`§CODE§${i}§`, 'g'), block);
  });

  // Restaurar bloques HTML
  htmlBlocks.forEach((block, i) => {
    html = html.replace(new RegExp(`§HTML§${i}§`, 'g'), block);
  });

  return html;
}

async function fetchReadme() {
  const res = await fetch(RAW_URL, { headers: { 'User-Agent': 'update-readme-script' } });
  if (!res.ok) throw new Error(`Fetch README failed: ${res.status} ${res.statusText}`);
  return await res.text();
}

function replaceBetweenMarkers(source, replacementHTML) {
  const beginIdx = source.indexOf(BEGIN_MARK);
  const endIdx = source.indexOf(END_MARK);
  if (beginIdx === -1 || endIdx === -1) {
    return { updated: false, content: source };
  }
  // Encontrar el cierre real del comentario de BEGIN
  const beginClose = source.indexOf('-->', beginIdx);
  if (beginClose === -1) return { updated: false, content: source };

  const before = source.slice(0, beginClose + 3);
  const after = source.slice(endIdx);
  const newBlock = `\n${replacementHTML}\n`;
  return { updated: true, content: before + newBlock + after };
}

async function main() {
  try {
    const md = await fetchReadme();
    const html = convertMarkdownToHTML(md);

    let changed = false;

    for (const rel of TARGET_FILES) {
      const filePath = path.join(process.cwd(), rel);
      if (!fs.existsSync(filePath)) continue;
      const original = fs.readFileSync(filePath, 'utf8');
      const { updated, content } = replaceBetweenMarkers(original, html);
      if (updated && content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed = true;
        console.log(`Actualizado: ${rel}`);
      } else {
        console.log(`Sin cambios o marcadores no encontrados: ${rel}`);
      }
    }

    if (!changed) {
      console.log('No hubo cambios en los archivos de destino.');
    }
  } catch (err) {
    console.error('Error en update-readme:', err);
    process.exitCode = 1;
  }
}

main();
