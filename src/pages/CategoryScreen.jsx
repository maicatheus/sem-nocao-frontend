import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CategoryScreen() {
  const categories = [
    { id: "comidas", label: "Comidas" },
    { id: "animais", label: "Animais" },
    { id: "objetos", label: "Objetos" },
    { id: "profissoes", label: "Profissões" },
  ];

  const navigate = useNavigate();
  const [selected, setSelected] = useState(
    () => localStorage.getItem("selectedCategory") || null
  );

  useEffect(() => {
    if (selected) localStorage.setItem("selectedCategory", selected);
    else localStorage.removeItem("selectedCategory");
  }, [selected]);

  function chooseCategory(cat) {
    setSelected(cat);
  }

  function handleStart() {
    if (!selected) return alert("Escolha uma categoria primeiro.");
    navigate("/game");
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
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 12px",
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ddd",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        ← Voltar para jogadores
      </button>

      <h1 style={{ marginBottom: 6 }}>Escolha a categoria</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Selecione um tema para gerar as palavras do jogo.
      </p>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {categories.map((c) => {
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => chooseCategory(c.id)}
              style={{
                padding: "14px 16px",
                fontSize: 17,
                borderRadius: 10,
                border: active ? "2px solid #2f80ed" : "1px solid #ddd",
                background: active ? "#f0f7ff" : "#fff",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: active
                  ? "0 2px 6px rgba(47,128,237,0.12)"
                  : "0 1px 2px rgba(0,0,0,0.03)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{c.label}</span>
              {active && (
                <span style={{ color: "#2f80ed", fontWeight: 600 }}>
                  Selecionada
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 22, display: "flex", gap: 8 }}>
        <button
          onClick={() => setSelected(null)}
          style={{
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Limpar seleção
        </button>

        <button
          onClick={handleStart}
          style={{
            marginLeft: "auto",
            padding: "10px 14px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: selected ? "#27ae60" : "#9bd5b6",
            color: "white",
            cursor: selected ? "pointer" : "not-allowed",
          }}
          disabled={!selected}
        >
          Começar →
        </button>
      </div>
    </div>
  );
}
