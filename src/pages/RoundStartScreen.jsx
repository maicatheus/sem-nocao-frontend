// src/pages/RoundStartScreen.jsx
import { useNavigate } from "react-router-dom";

export default function RoundStartScreen() {
  const navigate = useNavigate();

  function startSecondPass() {
    sessionStorage.setItem("pass_phase", "2");
    navigate("/game2");
  }

  return (
    <div style={{ padding: 30, maxWidth: 720, margin: "0 auto", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1>Preparar próxima fase</h1>

      <p style={{ marginTop: 12, color: "#444", fontSize: 18 }}>
        Lembre-se da palavra!
      </p>

      <div style={{ marginTop: 28 }}>
        <button
          onClick={startSecondPass}
          style={{
            padding: "18px 24px",
            fontSize: 22,
            borderRadius: 12,
            border: "none",
            background: "#2f80ed",
            color: "white",
            cursor: "pointer",
            width: "100%",
            maxWidth: 480
          }}
        >
          Iniciar jogo
        </button>
      </div>
    </div>
  );
}
