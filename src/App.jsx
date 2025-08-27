import { LoginForm } from "@/components/login-form.jsx";
import CreateQuizForm from "./components/CreateQuizForm";
import SelectQuestionType from "./components/SelectQuestionType";
import Navbar from "@/components/Navbar.jsx";
import ButtonQuestionForm from "./components/ButtonQuestionForm";
import { AuthProvider } from "./components/AuthContext";
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
            <Route path="/login" element={<LoginForm/>} />
            <Route
              path="/quiz/create"
              element={<CreateQuizForm/>}
            />
            <Route path="/quiz/:id/add-slide" 
              element={<SelectQuestionType/>}/>
            <Route path="/question/create" element={<ButtonQuestionForm/>}/>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
