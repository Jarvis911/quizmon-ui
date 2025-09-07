import { LoginForm } from "@/components/auth/login-form.jsx";
import QuizEditor from "@/pages/QuizEditor.jsx";
import Home from "@/pages/Home.jsx";
import MatchLobby from "./pages/MatchLobby";
import MatchPlay from "./pages/MatchPlay";
import { SignUpForm } from "@/components/auth/signup-form.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Galaxy from "@/components/ui/bg-galaxy.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1}
          glowIntensity={0.3}
          saturation={0.7}
          hueShift={140}
        />
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/sign-up" element={<SignUpForm />} />
          <Route path="/quiz/:id/editor" element={<QuizEditor />} />
          <Route path="/home" element={<Home/>} />
          <Route path="/match/:id/lobby" element={<MatchLobby/>} />
          <Route path="/match/:id/play" element={<MatchPlay/>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
