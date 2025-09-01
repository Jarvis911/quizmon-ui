import { LoginForm } from "@/components/auth/login-form.jsx";
import QuizEditor from "@/pages/QuizEditor.jsx";
import { SignUpForm } from "@/components/auth/signup-form.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div
          className="min-h-[110vh] flex items-center justify-center 
  bg-[radial-gradient(ellipse_at_top_left,black,orange,orange,yellow,red)]"
        >
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/sign-up" element={<SignUpForm />} />
            <Route
              path="/quiz/:id/editor"
              element={<QuizEditor />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
