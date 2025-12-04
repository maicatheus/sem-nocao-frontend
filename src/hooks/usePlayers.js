import { useEffect, useState, useRef } from "react";

/**
 * usePlayers - hook para gerenciar lista de jogadores com persistência localStorage.
 * Retorna também `ready` que indica que o load inicial foi finalizado.
 */
export default function usePlayers(storageKey = "sem-nocao-players") {
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);
  const initedRef = useRef(false);

  function genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  function normalize(raw) {
    if (!raw) return [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((p) => {
        if (!p) return null;
        if (typeof p === "string") return { id: genId(), name: p.trim() };
        if (typeof p === "object" && p.name)
          return { id: p.id ?? genId(), name: String(p.name).trim() };
        return null;
      })
      .filter(Boolean);
  }

  // carregar do localStorage na inicialização
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setPlayers([]);
        setReady(true);
        return;
      }
      const parsed = JSON.parse(raw);
      setPlayers(normalize(parsed));
    } catch {
      setPlayers([]);
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // salvar sempre que players mudar
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(players));
    } catch {
      // ignore
    }
  }, [players, storageKey]);

  function addPlayer(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return null;
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase()))
      return null;
    const p = { id: genId(), name: trimmed };
    setPlayers((prev) => [...prev, p]);
    return p;
  }

  function removePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePlayer(id, newName) {
    const trimmed = (newName || "").trim();
    if (!trimmed) return false;
    if (
      players.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.id !== id
      )
    )
      return false;
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p))
    );
    return true;
  }

  function moveUp(id) {
    setPlayers((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  }

  function moveDown(id) {
    setPlayers((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return arr;
    });
  }

  function clearPlayers() {
    setPlayers([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }

  function loadPlayers() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setPlayers(normalize(parsed));
    } catch {}
  }

  return {
    players,
    ready,
    addPlayer,
    removePlayer,
    updatePlayer,
    moveUp,
    moveDown,
    clearPlayers,
    loadPlayers,
  };
}
