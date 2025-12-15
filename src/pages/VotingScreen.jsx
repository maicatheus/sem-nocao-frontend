import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";

export default function VotingScreen() {
  const navigate = useNavigate();
  const { players, ready } = usePlayers();

  const storedStart = sessionStorage.getItem("start_index");
  const startIndex = storedStart != null ? Number(storedStart) : 0;

  const [turnIndex, setTurnIndex] = useState(0); // quem vota
  const [selected, setSelected] = useState(null); // player slecionado
  const [votes, setVotes] = useState(() => {
    try {
      const raw = sessionStorage.getItem("votes");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const playersInOrder = useMemo(() => {
    if (!players || players.length === 0) return [];
    const out = [];
    for (let i = 0; i < players.length; i++)
      out.push(players[(startIndex + i) % players.length]);
    return out;
  }, [players, startIndex]);

  useEffect(() => {
    if (!ready) return;
    if (!playersInOrder || playersInOrder.length === 0) {
      navigate("/categorias");
    }
  }, [ready, playersInOrder, navigate]);

  // current voter
  const voter = playersInOrder[turnIndex];

  useEffect(() => {
    if (!voter) {
      setSelected(null);
      return;
    }
    const prev = votes[voter.id];
    setSelected(prev ?? null);
  }, [voter, votes]);

  function choose(votedId) {
    // desmarcar se clica no mesmo
    setSelected((cur) => (cur === votedId ? null : votedId));
  }

  function saveVoteAndNext() {
    if (!selected) {
      alert("Escolha alguém para votar antes de continuar.");
      return;
    }
    const nextVotes = { ...votes, [voter.id]: selected };
    setVotes(nextVotes);
    try {
      sessionStorage.setItem("votes", JSON.stringify(nextVotes));
    } catch {}

    try {
      if (document && document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
    } catch {}

    setSelected(null);

    const next = turnIndex + 1;
    if (next >= playersInOrder.length) {
      setTimeout(() => navigate("/reveal"), 80);
      return;
    }

    setTimeout(() => setTurnIndex(next), 80);
  }

  if (!ready) return <div style={{ padding: 18 }}>Carregando jogadores...</div>;
  if (!voter)
    return <div style={{ padding: 18 }}>Inicializando votação...</div>;

  return (
    <div
      style={{
        padding: 18,
        fontFamily: "Arial, sans-serif",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>Quem é o Sem Noção?</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Cara jogador vota em quem acha que é o Sem Noção. Votante:{" "}
        <strong>{voter.name}</strong>.
      </p>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 10,
          border: "1px solid #eee",
          background: "#fff",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "#777", fontSize: 14 }}>Votante</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{voter.name}</div>
          <div style={{ color: "#999", marginTop: 8 }}>
            Escolha um jogador (toque para selecionar — toque novamente para desmarcar)
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 12,
          }}
        >
          {playersInOrder.map((p) => {
            const disabled = p.id === voter.id;
            const isSelected = selected === p.id;

            return (
              <button
                key={p.id}
                onClick={() => !disabled && choose(p.id)}
                disabled={disabled}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: isSelected ? "2px solid #2f80ed" : "1px solid #ddd",
                  background: disabled
                    ? "#f5f5f5"
                    : isSelected
                    ? "#eef6ff"
                    : "#fff",
                  cursor: disabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  fontSize: 18,
                }}
              >
                <div style={{ fontWeight: 700 }}>{p.name}</div>

                {disabled && (
                  <div style={{ fontSize: 12, color: "#999" }}>
                    Você não pode votar em si mesmo
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={saveVoteAndNext}
            style={{
              marginLeft: "auto",
              padding: "10px 14px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              background: "#2f80ed",
              color: "#fff",
            }}
          >
            {turnIndex + 1 >= playersInOrder.length
              ? "Finalizar votação"
              : "Confirmar e próximo →"}
          </button>
        </div>
      </div>
    </div>
  );
}
