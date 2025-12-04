import { BrowserRouter, Routes, Route } from "react-router-dom";
import NameScreen from "./pages/NameScreen";
import CategoryScreen from "./pages/CategoryScreen";
import GameScreen from "./pages/GameScreen"; // pass 1
import RoundStartScreen from "./pages/RoundStartScreen";
import GamePass2 from "./pages/GamePass2";
import DiscussionScreen from "./pages/DiscussionScreen";
import VotingScreen from "./pages/VotingScreen";
import RevealScreen from "./pages/RevealScreen";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NameScreen />} />
        <Route path="/categorias" element={<CategoryScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/iniciando" element={<RoundStartScreen />} />
        <Route path="/game2" element={<GamePass2 />} />
        <Route path="/discussion" element={<DiscussionScreen />} />
        <Route path="/voting" element={<VotingScreen />} />
        <Route path="/reveal" element={<RevealScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
