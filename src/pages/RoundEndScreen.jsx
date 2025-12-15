import { useNavigate } from "react-router-dom";

export default function RoundEndScreen() {
  const navigate = useNavigate();

  function startNewRound() {
    sessionStorage.setItem("start_new_round", "1");

    navigate("/jogo");
  }

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1>Fim da rodada!</h1>

      <p style={{ marginTop: 10, fontSize: 18, color: "#444" }}>
        Lembre-se da palavra!
      </p>

      <button
        onClick={startNewRound}
        style={{
          marginTop: 40,
          padding: "18px 28px",
          fontSize: 22,
          borderRadius: 12,
          border: "none",
          background: "#2f80ed",
          color: "white",
          cursor: "pointer",
          width: "100%",
          maxWidth: 400,
        }}
      >
        Iniciar nova rodada
      </button>
    </div>
  );
}
