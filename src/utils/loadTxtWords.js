export async function loadTxtWords(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error("Arquivo não encontrado: " + path);

    const text = await resp.text();

    return text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch (err) {
    console.error("Erro ao carregar TXT:", err);
    return [];
  }
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}