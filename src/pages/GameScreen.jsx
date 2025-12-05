// src/pages/GameScreen.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";
import { loadTxtWords, shuffle } from "../utils/loadTxtWords";

export default function GameScreen() {
  const navigate = useNavigate();
  const { players, ready } = usePlayers();
  const category = localStorage.getItem("selectedCategory");
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startIndex, setStartIndex] = useState(null);
  const [semIndex, setSemIndex] = useState(null);

  const [turnIndex, setTurnIndex] = useState(0);
  const [roundWord, setRoundWord] = useState(null);

  const [revealed, setRevealed] = useState(false);

  const playersInOrder = useMemo(() => {
    if (!players || players.length === 0 || startIndex == null) return [];
    const out = [];
    for (let i = 0; i < players.length; i++) {
      out.push(players[(startIndex + i) % players.length]);
    }
    return out;
  }, [players, startIndex]);

  const semIndexInOrder = useMemo(() => {
    if (!players || players.length === 0 || semIndex == null || startIndex == null) return null;
    const semPlayerId = players[semIndex]?.id;
    if (!semPlayerId) return null;
    return playersInOrder.findIndex((p) => p.id === semPlayerId);
  }, [players, semIndex, startIndex, playersInOrder]);

  const currentPlayer = playersInOrder[turnIndex];

  function pickRoundWord(wordsArray) {
    if (!wordsArray || wordsArray.length === 0) return null;
    const s = shuffle(wordsArray.slice());
    return s[Math.floor(Math.random() * s.length)];
  }

  useEffect(() => {
    if (!ready) return;

    if (!category) {
      alert("Nenhuma categoria selecionada. Voltando...");
      navigate("/categorias");
      return;
    }
    if (!players || players.length < 3) {
      alert("É necessário pelo menos 3 jogadores. Volte e adicione mais jogadores.");
      navigate("/");
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const arr = await loadTxtWords(`/words/${category}.csv`);
        if (!mounted) return;
        const filtered = arr.filter(Boolean);
        if (filtered.length === 0) throw new Error("Categoria sem palavras.");
        const s = shuffle(filtered);
        setWords(s);
        const r = pickRoundWord(s);
        setRoundWord(r);
      } catch (err) {
        console.error(err);
        setError(err.message || "Erro ao carregar palavras");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const sem = Math.floor(Math.random() * players.length);
    const start = Math.floor(Math.random() * players.length);
    setSemIndex(sem);
    setStartIndex(start);
    setTurnIndex(0);
    setRevealed(false);

    sessionStorage.setItem("sem_index", String(sem));
    sessionStorage.setItem("start_index", String(start));

    return () => {
      mounted = false;
    };
  }, [category, players, ready, navigate]);

  function handleReveal() {
    setRevealed(true);
  }

  function handleNext() {
    setRevealed(false);
    const next = turnIndex + 1;
    if (next >= playersInOrder.length) {
      sessionStorage.setItem("round_word", String(roundWord ?? ""));
      sessionStorage.setItem("sem_index", String(semIndex ?? ""));
      sessionStorage.setItem("start_index", String(startIndex ?? ""));
      sessionStorage.setItem("pass_phase", "1");
      navigate("/iniciando");
      return;
    }
    setTurnIndex(next);
  }

  if (loading) return <div style={{ padding: 18 }}>Carregando palavras...</div>;
  if (error) return <div style={{ padding: 18, color: "red" }}>Erro: {error}</div>;
  if (!ready) return <div style={{ padding: 18 }}>Carregando jogadores...</div>;
  if (!currentPlayer) return <div style={{ padding: 18 }}>Inicializando...</div>;

  return (
    <div style={{ padding: 18, fontFamily: "Arial, sans-serif", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Rodada — Categoria: {category}</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Mostre o aparelho para o jogador atual e peça para ele clicar em revelar.</p>

      <div style={{ marginTop: 18, padding: 16, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#777", fontSize: 14 }}>Jogador atual</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{currentPlayer.name}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#777", fontSize: 14 }}>Turno</div>
            <div style={{ fontSize: 20 }}>{turnIndex + 1} / {playersInOrder.length}</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {!revealed ? (
            <button
              onClick={handleReveal}
              style={{
                padding: "12px 16px",
                fontSize: 18,
                borderRadius: 8,
                border: "none",
                background: "#2f80ed",
                color: "#fff",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Revelar palavra
            </button>
          ) : (
            <div>
              <div style={{ padding: 16, borderRadius: 8, background: "#f9fafb", border: "1px solid #eee", marginBottom: 12, minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {turnIndex === semIndexInOrder ? (
                  <div style={{ fontSize: 18, color: "#e05555", fontWeight: 700 }}>Você é o Sem Noção</div>
                ) : (
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{roundWord}</div>
                )}
              </div>

              <button
                onClick={handleNext}
                style={{
                  padding: "10px 14px",
                  fontSize: 16,
                  borderRadius: 8,
                  border: "none",
                  background: "#27ae60",
                  color: "white",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Próximo jogador →
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate("/categorias")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
          Voltar às categorias
        </button>
      </div>
    </div>
  );
}
