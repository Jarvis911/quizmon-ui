import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom";


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleJoinCode = async () => {
    if (code) {
      navigate(`/match/${code}/lobby`);
    }
  };

  const handleCreateQuiz = () => {
    if (token) {
      navigate(`/quiz`);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-16 flex items-center justify-between px-6 z-50 transition-all 
        bg-white/70 backdrop-blur-md ${scrolled ? "shadow-md" : ""}`}
    >
      {/* Left - Logo */}
      <div className="text-2xl font-bold text-orange-600">Quizmon</div>

      {/* Middle - Search */}
      <div className="flex-1 flex flex-row gap-4 mx-6 max-w-xl">
        <Input
          type="text"
          placeholder="Nhập mã phòng để tham gia..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border-2 border-orange-400 focus:border-red-500 focus:ring-0"
        />
        <Button className="bg-orange-600" onClick={handleJoinCode}>Tham gia</Button>
      </div>

      {/* Right - Avatar + New Quiz */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="rounded-full p-2 bg-orange-500 hover:bg-orange-600 cursor-pointer text-white"
          onClick={handleCreateQuiz}
        >
          Create quiz now!
        </Button>

        <Avatar className="cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}
