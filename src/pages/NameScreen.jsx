import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";

export default function NameScreen() {
  const navigate = useNavigate();
  const {
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    moveUp,
    moveDown,
    clearPlayers,
  } = usePlayers();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (editingId) setTimeout(() => editRef.current?.focus(), 40);
  }, [editingId]);

  function handleAdd() {
    const p = addPlayer(name);
    if (p) {
      setName("");
      inputRef.current?.focus();
    } else {
      setName("");
      inputRef.current?.focus();
    }
  }

  function handleStartEdit(player) {
    setEditingId(player.id);
    setEditingValue(player.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingValue("");
  }

  function saveEdit() {
    const ok = updatePlayer(editingId, editingValue);
    if (!ok) {
      alert("Erro ao salvar (nome vazio ou duplicado).");
      return;
    }
    setEditingId(null);
    setEditingValue("");
  }

  function handleNext() {
    if (players.length < 2) return;
    // navegar para categorias
    navigate("/categorias");
  }

  return (
    <div
      style={{
        padding: 18,
        fontFamily: "Arial, sans-serif",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>Adicionar jogadores</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Adicione os nomes das pessoas que vão jogar (mínimo 3).
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Nome do jogador"
          style={{
            flex: 1,
            padding: "12px 10px",
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "10px 14px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: "#2f80ed",
            color: "white",
            cursor: "pointer",
          }}
        >
          Adicionar
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Jogadores ({players.length})</h3>
        {players.length === 0 && (
          <p style={{ color: "#777" }}>Nenhum jogador ainda. Adicione nomes!</p>
        )}

        <ul style={{ paddingLeft: 18 }}>
          {players.map((p, index) => (
            <li
              key={p.id}
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                {editingId === p.id ? (
                  <div style={{ flex: 1, display: "flex", gap: 8 }}>
                    <input
                      ref={editRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: 16,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: "#27ae60",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 16 }}>{p.name}</span>
                  </>
                )}
              </div>

              {editingId === p.id ? null : (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginLeft: 12,
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => moveUp(p.id)}
                    title="Mover para cima"
                    style={{
                      padding: "6px 8px",
                      fontSize: 14,
                      borderRadius: 6,
                      border: "1px solid #eee",
                      background: "#fff",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      opacity: index === 0 ? 0.5 : 1,
                    }}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(p.id)}
                    title="Mover para baixo"
                    style={{
                      padding: "6px 8px",
                      fontSize: 14,
                      borderRadius: 6,
                      border: "1px solid #eee",
                      background: "#fff",
                      cursor:
                        index === players.length - 1
                          ? "not-allowed"
                          : "pointer",
                      opacity: index === players.length - 1 ? 0.5 : 1,
                    }}
                    disabled={index === players.length - 1}
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => handleStartEdit(p)}
                    style={{
                      padding: "6px 10px",
                      fontSize: 14,
                      borderRadius: 6,
                      border: "1px solid #eee",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("Remover esse jogador?")) return;
                      removePlayer(p.id);
                    }}
                    style={{
                      padding: "6px 10px",
                      fontSize: 14,
                      borderRadius: 6,
                      border: "1px solid #eee",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            if (!confirm("Deseja limpar todos os nomes?")) return;
            clearPlayers();
          }}
          style={{
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Limpar
        </button>

        <button
          onClick={handleNext}
          disabled={players.length < 2}
          style={{
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: players.length >= 2 ? "#27ae60" : "#9bd5b6",
            color: "white",
            cursor: players.length >= 2 ? "pointer" : "not-allowed",
            marginLeft: "auto",
          }}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
