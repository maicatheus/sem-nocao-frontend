// src/pages/RevealScreen.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";

export default function RevealScreen() {
  const navigate = useNavigate();
  const { players, ready } = usePlayers();
  const storedStart = sessionStorage.getItem("start_index");
  const startIndex = storedStart != null ? Number(storedStart) : 0;
  const storedSem = sessionStorage.getItem("sem_index");
  const semIndex = storedSem != null ? Number(storedSem) : null;

  const playersInOrder = useMemo(() => {
    if (!players || players.length === 0) return [];
    const out = [];
    for (let i = 0; i < players.length; i++) out.push(players[(startIndex + i) % players.length]);
    return out;
  }, [players, startIndex]);

  const votesRaw = (() => {
    try {
      const raw = sessionStorage.getItem("votes");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const tally = useMemo(() => {
    const counts = {};
    playersInOrder.forEach(p => { counts[p.id] = 0; });
    Object.values(votesRaw).forEach(votedId => {
      if (counts[votedId] != null) counts[votedId] += 1;
      else counts[votedId] = (counts[votedId] || 0) + 1;
    });
    return counts;
  }, [votesRaw, playersInOrder]);

  const maxVotes = Math.max(0, ...Object.values(tally));
  const topIds = Object.keys(tally).filter(id => tally[id] === maxVotes && maxVotes > 0);

  const semPlayerId = players[semIndex]?.id;

  function handleRestart() {
    sessionStorage.removeItem("round_word");
    sessionStorage.removeItem("sem_index");
    sessionStorage.removeItem("start_index");
    sessionStorage.removeItem("pass_phase");
    sessionStorage.removeItem("ask_mapping");
    sessionStorage.removeItem("qa_pairs");
    sessionStorage.removeItem("votes");
    sessionStorage.removeItem("qa_pairs");
    navigate("/categorias");
  }

  if (!ready) return <div style={{ padding: 18 }}>Carregando jogadores...</div>;
  if (!playersInOrder || playersInOrder.length === 0) return <div style={{ padding: 18 }}>Inicializando...</div>;

  return (
    <div style={{ padding: 18, fontFamily: "Arial, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Revelação — resultados da votação</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Veja quantos votos cada jogador recebeu e descubra quem era o Sem Noção.</p>

      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {playersInOrder.map((p) => {
          const c = tally[p.id] ?? 0;
          const isTop = topIds.includes(p.id);
          const isSem = p.id === semPlayerId;
          return (
            <div key={p.id} style={{ padding: 12, borderRadius: 10, border: isTop ? "2px solid #2f80ed" : "1px solid #eee", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name} {isSem ? <span style={{ color: "#e05555", fontWeight: 800, marginLeft: 8 }}>(Sem Noção)</span> : null}</div>
                <div style={{ color: "#666", fontSize: 13 }}>Votos recebidos: {c}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                {isTop ? <div style={{ color: "#2f80ed", fontWeight: 800 }}>{c} votos — mais votado</div> : <div style={{ color: "#444" }}>{c} votos</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 22, display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/discussion")} style={{ padding: "10px 12px", fontSize: 16, borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
          Voltar à discussão
        </button>

        <button onClick={handleRestart} style={{ marginLeft: "auto", padding: "10px 12px", fontSize: 16, borderRadius: 8, border: "none", background: "#27ae60", color: "white" }}>
          nova rodada
        </button>
      </div>
    </div>
  );
}
