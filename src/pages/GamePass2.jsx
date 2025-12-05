import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";
import { loadTxtWords, shuffle } from "../utils/loadTxtWords";

function makeDerangementIndices(n) {
  if (n <= 1) return null;
  const base = Array.from({ length: n }, (_, i) => i);
  let attempts = 0;
  while (attempts < 2000) {
    const arr = base.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    let ok = true;
    for (let i = 0; i < n; i++) {
      if (arr[i] === i) {
        ok = false;
        break;
      }
    }
    if (ok) return arr;
    attempts++;
  }
  if (n === 2) return [1, 0];
  return base.map((_, i) => (i + 1) % n);
}

export default function GamePass2() {
  const navigate = useNavigate();
  const { players, ready } = usePlayers();
  const category = localStorage.getItem("selectedCategory");
  const storedRoundWord = sessionStorage.getItem("round_word") || null;
  const storedSem = sessionStorage.getItem("sem_index");
  const storedStart = sessionStorage.getItem("start_index");

  const semIndex = storedSem != null ? Number(storedSem) : null;
  const startIndex = storedStart != null ? Number(storedStart) : null;

  const [turnIndex, setTurnIndex] = useState(0);
  const [qaPairs, setQaPairs] = useState([]);
  const [mapping, setMapping] = useState(null);
  const [questionsPool, setQuestionsPool] = useState([]);
  const [questionsAll, setQuestionsAll] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState(null);
  const [generating, setGenerating] = useState(false);

  const playersInOrder = useMemo(() => {
    if (!players || players.length === 0 || startIndex == null) return [];
    const out = [];
    for (let i = 0; i < players.length; i++)
      out.push(players[(startIndex + i) % players.length]);
    return out;
  }, [players, startIndex]);

  const semIndexInOrder = useMemo(() => {
    if (!players || players.length === 0 || semIndex == null) return null;
    const semPlayerId = players[semIndex]?.id;
    if (!semPlayerId) return null;
    return playersInOrder.findIndex((p) => p.id === semPlayerId);
  }, [players, semIndex, playersInOrder]);

  useEffect(() => {
    if (!ready) return;

    if (!storedRoundWord) {
      alert("Palavra da rodada não encontrada. Voltando às categorias.");
      navigate("/categorias");
      return;
    }
    if (!players || players.length < 2) {
      alert(
        "É necessário pelo menos 3 jogadores. Volte e adicione mais jogadores."
      );
      navigate("/");
      return;
    }

    try {
      const raw = sessionStorage.getItem("qa_pairs");
      if (raw) {
        const parsed = JSON.parse(raw);
        setQaPairs(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setQaPairs([]);
    }

    try {
      const rawMap = sessionStorage.getItem("ask_mapping");
      if (rawMap) {
        const parsed = JSON.parse(rawMap);
        if (Array.isArray(parsed)) {
          setMapping(parsed);
        }
      }
    } catch {}

    async function loadQuestions() {
      setLoadingQuestions(true);
      setErrorLoadingQuestions(null);
      try {
        const path = `/words/perguntas_${category}.txt`;
        const arr = await loadTxtWords(path);
        const cleaned = arr.filter(Boolean).map((s) => String(s).trim());
        if (cleaned.length === 0) throw new Error("Arquivo de perguntas vazio");
        setQuestionsAll(cleaned.slice());
        setQuestionsPool(shuffle(cleaned.slice()));
      } catch (err) {
        console.error(err);
        setErrorLoadingQuestions(err.message || "Erro carregando perguntas");
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadQuestions();

    if (!sessionStorage.getItem("ask_mapping")) {
      const n = playersInOrder.length;
      const der = makeDerangementIndices(n);
      setMapping(der);
      try {
        sessionStorage.setItem("ask_mapping", JSON.stringify(der));
      } catch {}
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, players, playersInOrder, category, navigate, storedRoundWord]);

  useEffect(() => {
    try {
      sessionStorage.setItem("qa_pairs", JSON.stringify(qaPairs));
    } catch {}
  }, [qaPairs]);

  function pickQuestionFromPool() {
    setQuestionsPool((curr) => {
      let pool = Array.isArray(curr) ? curr.slice() : [];
      if (pool.length === 0) {
        pool = shuffle(questionsAll.slice());
      }
      const q = pool.pop();
      setTimeout(() => {}, 0);
      return pool;
    });

    let picked = null;
    if (questionsPool && questionsPool.length > 0) {
      picked = questionsPool[questionsPool.length - 1];
    } else if (questionsAll && questionsAll.length > 0) {
      picked = questionsAll[Math.floor(Math.random() * questionsAll.length)];
    }
    return picked;
  }

  const asker = playersInOrder[turnIndex];
  const responderIndex = mapping ? mapping[turnIndex] : null;
  const responder =
    responderIndex != null ? playersInOrder[responderIndex] : null;
  const existingPair = qaPairs.find(
    (q) => q.askerId === asker?.id && q.responderId === responder?.id
  );

  useEffect(() => {
    if (
      !mapping ||
      !questionsPool ||
      questionsPool.length === 0 ||
      !asker ||
      !responder
    )
      return;
    if (existingPair) return; // já tem
    setGenerating(true);
    const q = pickQuestionFromPool();
    const questionText =
      q ||
      (questionsAll.length
        ? questionsAll[Math.floor(Math.random() * questionsAll.length)]
        : "Qual sua opinião sobre isto?");
    const newPair = {
      askerId: asker.id,
      responderId: responder.id,
      question: questionText,
      askerName: asker.name,
      responderName: responder.name,
    };
    setQaPairs((prev) => {
      const others = prev.filter(
        (p) =>
          !(
            p.askerId === newPair.askerId &&
            p.responderId === newPair.responderId
          )
      );
      return [...others, newPair];
    });
    setGenerating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnIndex, mapping, questionsPool, asker?.id, responder?.id]);

  function handleNext() {
    const next = turnIndex + 1;
    if (next >= playersInOrder.length) {
      navigate("/discussion");
      return;
    }
    setTurnIndex(next);
  }

  if (!ready) return <div style={{ padding: 18 }}>Carregando jogadores...</div>;
  if (!playersInOrder || playersInOrder.length === 0)
    return <div style={{ padding: 18 }}>Inicializando...</div>;
  if (!mapping)
    return <div style={{ padding: 18 }}>Preparando perguntas...</div>;
  if (loadingQuestions)
    return (
      <div style={{ padding: 18 }}>Carregando perguntas da categoria...</div>
    );
  if (errorLoadingQuestions)
    return (
      <div style={{ padding: 18, color: "red" }}>
        Erro: {errorLoadingQuestions}
      </div>
    );

  const currentPair = qaPairs.find(
    (q) => q.askerId === asker.id && q.responderId === responder.id
  );

  return (
    <div
      style={{
        padding: 18,
        fontFamily: "Arial, sans-serif",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>
        Fase de perguntas — Categoria: {category}
      </h1>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 10,
          border: "1px solid #eee",
          background: "#fff",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: "#777", fontSize: 14 }}>
            Pergunta {turnIndex + 1} de {playersInOrder.length}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>
            {asker.name} pergunta para {responder.name}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8, color: "#666" }}>Pergunta gerada:</div>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "#f9fafb",
              border: "1px solid #eee",
              minHeight: 56,
            }}
          >
            {currentPair
              ? currentPair.question
              : generating
              ? "Gerando..."
              : "Gerando pergunta..."}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: "12px 14px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              background: "#2f80ed",
              color: "#fff",
            }}
          >
            próximo →
          </button>
        </div>
      </div>

      {/* <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Perguntas já geradas</h3>
        {qaPairs.length === 0 && (
          <p style={{ color: "#777" }}>Nenhuma pergunta gerada ainda.</p>
        )}
        <ul style={{ paddingLeft: 18 }>
          {qaPairs.map((q, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {q.askerName} → {q.responderName}
              </div>
              <div style={{ color: "#444" }}>{q.question}</div>
            </li>
          ))}
        </ul>
      </div> */}

      <div style={{ marginTop: 18 }}>
        <button
          onClick={() => {
            setTurnIndex((t) => Math.max(0, t - 1));
          }}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
            enabled: turnIndex > 0,
            show: turnIndex > 0,
          }}
        >
          ← Voltar para pergunta anterior"
        </button>
      </div>
    </div>
  );
}
