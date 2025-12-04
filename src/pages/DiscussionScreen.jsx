import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlayers from "../hooks/usePlayers";

export default function DiscussionScreen() {
  const navigate = useNavigate();
  const { players, ready } = usePlayers();
  const [qaPairs, setQaPairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    try {
      const raw = sessionStorage.getItem("qa_pairs");
      if (!raw) {
        setQaPairs([]);
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      const normalized = (Array.isArray(parsed) ? parsed : []).map((p) => ({
        askerId: p.askerId,
        responderId: p.responderId,
        question: p.question,
        askerName: p.askerName || "",
        responderName: p.responderName || "",
        answer: p.answer ?? ""
      }));
      setQaPairs(normalized);
    } catch (err) {
      console.error(err);
      setQaPairs([]);
    } finally {
      setLoading(false);
    }
  }, [ready]);

  const byResponder = qaPairs.reduce((acc, item) => {
    const rid = item.responderId || "__unknown__";
    if (!acc[rid]) acc[rid] = [];
    acc[rid].push(item);
    return acc;
  }, {});

  function handleFinish() {
    sessionStorage.removeItem("qa_pairs");
    sessionStorage.removeItem("ask_mapping");
    sessionStorage.removeItem("round_word");
    sessionStorage.removeItem("pass_phase");
    navigate("/voting");
  }

  if (!ready) return <div style={{ padding: 18 }}>Carregando jogadores...</div>;
  if (loading) return <div style={{ padding: 18 }}>Carregando perguntas e respostas...</div>;

  const respondersOrder = (players || []).map((p) => p.id);

  return (
    <div style={{ padding: 18, fontFamily: "Arial, sans-serif", maxWidth: 880, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Discussão — perguntas e respostas</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Aqui estão as perguntas que cada jogador recebeu — digite as respostas (ou revise) e depois clique em "Finalizar".
      </p>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {respondersOrder.map((responderId) => {
          const items = byResponder[responderId] || [];
          // se o player id não tem items, pode não ter recebido pergunta (cobertura de segurança)
          if (items.length === 0) return null;
          // mostrar todas as perguntas que esse respondedor teve (em geral 1)
          return items.map((item, idx) => (
            <div key={`${item.responderId}_${idx}`} style={{ padding: 14, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <div style={{ color: "#777", fontSize: 13 }}>Respondeu</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{item.responderName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#777", fontSize: 13 }}>Perguntou</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{item.askerName}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ color: "#666", marginBottom: 6 }}>Pergunta:</div>
                <div style={{ padding: 12, borderRadius: 8, background: "#f9fafb", border: "1px solid #eee" }}>
                  {item.question}
                </div>
              </div>
            </div>
          ));
        })}
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>

        <button onClick={handleFinish} style={{ marginLeft: "auto", padding: "10px 12px", fontSize: 16, borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
          Ir para Votação →
        </button>
      </div>
    </div>
  );
}
