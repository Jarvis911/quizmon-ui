import { LoginForm } from "@/components/login-form.jsx";
import CreateQuizForm from "./components/CreateQuizForm";
import SelectQuestionType from "./components/SelectQuestionType";
import Navbar from "@/components/Navbar.jsx";
import ButtonQuestionForm from "./components/ButtonQuestionForm";
import CheckboxQuestionForm from "./components/CheckboxQuestionForm";
import RangeQuestion from "./components/RangeQuestion";
import LocationQuestionForm from "./components/LocationQuestionForm.jsx";
import ReorderQuestionForm from "./components/ReorderQuestionForm.jsx";
import TypeAnswerQuestionForm from "./components/TypeAnswerQuestionForm.jsx";
import QuizEditor from "./components/QuizEditor.jsx";
import { SignUpForm } from "./components/signup-form.jsx";
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
            <Route path="/login" element={<LoginForm />} />
            <Route path="/sign-up" element={<SignUpForm />} />
            <Route path="/quiz/" element={<CreateQuizForm />} />
            <Route
              path="/quiz/:id/add-slide"
              element={<SelectQuestionType />}
            />
            <Route
              path="/question-buttons/"
              element={<ButtonQuestionForm />}
            />
            <Route
              path="/question-checkboxes/"
              element={<CheckboxQuestionForm />}
            />
            <Route path="/question-range/" element={<RangeQuestion />} />
            <Route
              path="/question-location/"
              element={<LocationQuestionForm />}
            />
            <Route
              path="/question-reorder/"
              element={<ReorderQuestionForm />}
            />
            <Route
              path="/question-typeanswer/"
              element={<TypeAnswerQuestionForm />}
            />
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
