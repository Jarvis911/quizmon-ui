// src/pages/MatchLobby.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "@/services/socket";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import endpoints from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MatchLobby = () => {
  const { id: matchId } = useParams();
  const { user, token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(endpoints.match(matchId), { headers: { Authorization: token } }); // /api/matches/:id
        setQuiz(res.data.quiz);
        setIsHost(res.data.hostId === user.id);
      } catch (err) {
        console.error(err);
        setError("Cannot load match data!");
      }
    };
    fetchMatch();
        
    const updatePlayers = (value) => {
      setPlayers(value);
    }

    const updateError = (message) => {
      setError(message);
    }

    socket.on("playerJoined", updatePlayers);
    socket.on("playerLeft", updatePlayers);
    socket.on("error", updateError);

    socket.emit("joinMatch", { matchId, userId: user.id, username: user.username });

    return () => {
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("error");
    }
  }, [matchId, user.id, user.username, token]);

  const startGame = () => {
    navigate(`/match/${matchId}/play`);
  };

  return (
    <div className="p-6 flex gap-8 absolute left-[50%] -translate-x-1/2 top-30">
      {/* Left: Players and Room Code */}
      <div className="flex-1 space-y-6 text-gray-300">
        <h2 className="text-2xl font-bold">Phòng thi đấu: {matchId}</h2>
        <p className="">Mã phòng: {matchId} (chia sẻ để bạn bè tham gia)</p>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Người chơi ({players.length}/20)</h3>
          {players.map((p) => (
            <div key={p.userId} className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{p.username[0]}</AvatarFallback>
              </Avatar>
              <span>{p.username}</span>
              {p.userId === user.id && <span className="text-blue-500">(Bạn)</span>}
            </div>
          ))}
        </div>
        {isHost && (
          <Button onClick={startGame} className="mt-4">
            Bắt đầu game
          </Button>
        )}
      </div>

      {/* Right: Quiz Info */}
      {quiz && (
        <Card className="w-1/3 min-w-3xs bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{quiz.description}</CardDescription>
            {quiz.image && <img src={quiz.image} alt={quiz.title} className="w-full h-40 object-cover rounded mt-4" />}
            <p className="mt-2">Số câu hỏi: {quiz.questions?.length || "0"}</p>
            <p>Chủ đề: {quiz.category?.name || "N/A"}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchLobby;