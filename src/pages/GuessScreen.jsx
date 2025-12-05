// src/pages/GuessScreen.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";

async function loadTxtWords(path) {
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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GuessScreen() {
  const navigate = useNavigate();
  const { players, ready } = usePlayers();

  const category = localStorage.getItem("selectedCategory");
  const roundWord = sessionStorage.getItem("round_word") || null;
  const storedSem = sessionStorage.getItem("sem_index");
  const semIndex = storedSem != null ? Number(storedSem) : -1;

  const semPlayer = useMemo(() => {
    if (!players || players.length === 0) return null;
    if (semIndex < 0 || semIndex >= players.length) return null;
    return players[semIndex];
  }, [players, semIndex]);

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (!ready) return;

    if (!category || !roundWord) {
      alert("Dados da rodada não encontrados. Voltando às categorias.");
      navigate("/categorias");
      return;
    }

    let mounted = true;

    async function prepareOptions() {
      setLoading(true);
      setLoadError(null);
      try {
        const all =
          category === "jogadores"
            ? players.map((p) => p.name)
            : await loadTxtWords(`/words/${category}.txt`);
            
        if (!mounted) return;

        let unique = Array.from(
          new Set(all.map((s) => s.trim()).filter((s) => s.length > 0))
        );

        if (!unique.includes(roundWord)) {
          unique.push(roundWord);
        }

        let finalOptions = [];
        if (unique.length <= 6) {
          finalOptions = shuffle(unique);
        } else {
          const withoutCorrect = unique.filter((w) => w !== roundWord);
          const shuffled = shuffle(withoutCorrect);
          const distractors = shuffled.slice(0, 5);
          finalOptions = shuffle([roundWord, ...distractors]);
        }

        setOptions(finalOptions);
      } catch (err) {
        console.error(err);
        setLoadError(err.message || "Erro ao carregar palavras da categoria.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    prepareOptions();

    return () => {
      mounted = false;
    };
  }, [ready, category, roundWord, navigate]);

  function handleConfirm() {
    if (selected == null) {
      alert("Escolha uma opção antes de confirmar.");
      return;
    }
    const chosen = options[selected];
    const correct = chosen === roundWord;

    setAnswered(true);
    setIsCorrect(correct);

    try {
      sessionStorage.setItem(
        "sem_guess",
        JSON.stringify({
          guess: chosen,
          correct: roundWord,
          success: correct,
        })
      );
    } catch {}
  }

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
  if (loading) return <div style={{ padding: 18 }}>Carregando opções...</div>;
  if (loadError)
    return (
      <div style={{ padding: 18, color: "red" }}>
        Erro ao preparar a adivinhação: {loadError}
      </div>
    );
  if (!roundWord || !category)
    return <div style={{ padding: 18 }}>Dados da rodada ausentes.</div>;

  const titleName = semPlayer?.name || "Sem Noção";

  return (
    <div
      style={{
        padding: 18,
        fontFamily: "Arial, sans-serif",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>Adivinhe a palavra!</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Agora é a vez de <strong>{titleName}</strong> tentar descobrir qual era
        a palavra da rodada na categoria <strong>{category}</strong>.
      </p>
      <p style={{ marginTop: 4, color: "#777" }}>
        Uma das opções abaixo é a palavra correta. Escolha com sabedoria!
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = selected === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (answered) return;
                  setSelected(idx);
                }}
                style={{
                  padding: "12px 10px",
                  borderRadius: 10,
                  border: isSelected ? "2px solid #2f80ed" : "1px solid #ddd",
                  background: isSelected ? "#eef6ff" : "#fff",
                  cursor: answered ? "default" : "pointer",
                  fontSize: 16,
                  minHeight: 52,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {!answered ? (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleConfirm}
              style={{
                padding: "10px 14px",
                fontSize: 16,
                borderRadius: 8,
                border: "none",
                background: selected != null ? "#27ae60" : "#9bd5b6",
                color: "#fff",
                cursor: selected != null ? "pointer" : "not-allowed",
              }}
              disabled={selected == null}
            >
              Confirmar palpite →
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: isCorrect ? "#e6f8ec" : "#ffecec",
                border: isCorrect ? "1px solid #27ae60" : "1px solid #e05555",
                marginBottom: 12,
              }}
            >
              {isCorrect ? (
                <div style={{ fontSize: 16 }}>
                  🎉 <strong>Acertou!</strong> A palavra correta era{" "}
                  <strong>{roundWord}</strong>.
                </div>
              ) : (
                <div style={{ fontSize: 16 }}>
                  😅 <strong>Não foi dessa vez.</strong> A palavra correta era{" "}
                  <strong>{roundWord}</strong>.
                </div>
              )}
            </div>

            <button
              onClick={handleRestart}
              style={{
                padding: "10px 14px",
                fontSize: 16,
                borderRadius: 8,
                border: "none",
                background: "#2f80ed",
                color: "white",
                width: "100%",
                cursor: "pointer",
              }}
            >
              Novo Jogo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
