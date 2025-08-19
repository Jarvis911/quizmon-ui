import { LoginForm } from "@/components/login-form.jsx";
import Navbar from "@/components/Navbar.jsx";
import { AuthProvider } from "./components/AuthContext";

function App() {


  return (
    <AuthProvider>
      <Navbar></Navbar>
      <div className="min-h-[110vh] flex items-center justify-center 
  bg-[radial-gradient(ellipse_at_top_left,black,orange,red,yellow)]">
        <LoginForm/>
      </div>
    </AuthProvider>
  )
};

export default App;