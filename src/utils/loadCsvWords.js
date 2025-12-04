export async function loadCsvWords(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Falha ao carregar ' + path);
  const txt = await res.text();
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const start = (lines[0] && lines[0].toLowerCase().startsWith('word')) ? 1 : 0;
  return lines.slice(start).map(l => {
    // pega primeira coluna (no caso de CSV com colunas)
    const first = l.split(',')[0].trim();
    return first;
  });
}

// util: embaralhar array (Fisher-Yates)
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
