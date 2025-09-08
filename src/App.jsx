import { LoginForm } from "@/components/auth/login-form.jsx";
import Navbar from "@/components/ui/Navbar.jsx"
import QuizEditor from "@/pages/QuizEditor.jsx";
import Home from "@/pages/Home.jsx";
import MatchLobby from "./pages/MatchLobby";
import MatchPlay from "./pages/MatchPlay";
import CreateQuizForm from "@/components/quiz/CreateQuizForm.jsx"
import { SignUpForm } from "@/components/auth/signup-form.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Galaxy from "@/components/ui/bg-galaxy.jsx";

function App() {
  return (
    <BrowserRouter>
<div className="flex justify-center items-center w-full h-full py-[60px] min-h-screen
  bg-[radial-gradient(ellipse_at_top_left,theme(colors.red.300),theme(colors.yellow.200),theme(colors.orange.300))]">
      <AuthProvider>
        <Navbar/>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/sign-up" element={<SignUpForm />} />
          <Route path="/quiz/:id/editor" element={<QuizEditor />} />
          <Route path="/home" element={<Home/>} />
          <Route path="/match/:id/lobby" element={<MatchLobby/>} />
          <Route path="/match/:id/play" element={<MatchPlay/>} />
          <Route path="/quiz" element={<CreateQuizForm/>}/>
        </Routes>
      </AuthProvider>
    </div>
    </BrowserRouter>
  );
}

export default App;
