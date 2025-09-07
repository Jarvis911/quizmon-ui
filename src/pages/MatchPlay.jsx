import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "@/services/socket.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ButtonQuestionPlay from "@/components/question/ButtonQuestionPlay";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const MatchPlay = () => {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  // Set question 
  const [question, setQuestion] = useState(null);
  // Point of each questions
  const [timer, setTimer] = useState(30);
  // Point of Scores 
  const [scores, setScores] = useState([]);
  // Check if this question is correct
  const [isCorrect, setIsCorrect] = useState(null);
  const [explode, setExplode] = useState(false);
  const { width, height } = useWindowSize();
  // Save question to Ref
  const questionRef = useRef(null);


  useEffect(() => {   
    socket.emit('startMatch', { matchId });
 
    const handleNextQuestion = ({question, timer}) => {
      console.log("⚡ [Client] nextQuestion received:", question);
      setQuestion(question);
      setTimer(timer);
      setIsCorrect(null);
      setExplode(false);
    }

    socket.on("nextQuestion", handleNextQuestion);

    return () => {
      socket.off("nextQuestion");
    }
  }, []);

 useEffect(() => {
    // === Listener: timeUp ===
    const handleTimeUp = () => {
      console.log("⚡ [Client] timeUp");      
      socket.emit("submitAnswer", {
        matchId,
        userId: user.id,
        questionId: questionRef.current?.id, 
        answer: null,
      });
    };


    // === Listener: answerResult ===
    const handleAnswerResult = ({ userId: resUserId, isCorrect: resCorrect, questionId }) => {
      if (resUserId === user.id && questionRef.current?.id === questionId) {
        setIsCorrect(resCorrect);
        if (resCorrect) {
          setExplode(true);
          setTimeout(() => setExplode(false), 3000);
        }
      }
    };

    // === Listener: updateScores ===
    const handleUpdateScores = (newScores) => {
      setScores(newScores);
    };

    // === Listener: gameOver ===
    const handleGameOver = ({ leaderboard }) => {
      alert(`Game over! Leaderboard: ${JSON.stringify(leaderboard)}`);
    };

    socket.on("answerResult", handleAnswerResult);
    socket.on("updatedScores", handleUpdateScores);
    socket.on("gameOver", handleGameOver);

    return () => {
      socket.off("answerResult", handleAnswerResult);
      socket.off("updatedScores", handleUpdateScores);
      socket.off("gameOver", handleGameOver);
    };

  }, [matchId, user.id]);

  // Handle when submit the answer
  // const handleSubmit = (answer) => {
  //   if (points > 0) {
  //     socket.emit("submitAnswer", { matchId, userId: user.id, questionId: question.id, answer });
  //   }
  // };

    // Render the right question
  const renderQuestion = () => {
    if (!question) return <p className="text-center text-gray-500">Đang chờ câu hỏi...</p>;

    switch (question.type) {
      case "BUTTONS":
        return (
          <ButtonQuestionPlay
            question={question}
            // onSubmit={handleSubmit}
            socket={socket}
            matchId={matchId}
            userId={user.id}
            timer={timer}
          />
        );

      default:
        return <p className="text-red-500">Loại câu hỏi không hỗ trợ</p>;
    }
  };

  return (
    <div className="p-6 absolute top-30 text-white left-[50%] -translate-x-1/2">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Phòng thi đấu: {matchId}</h2>
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Bảng điểm</CardTitle>
          </CardHeader>
          <CardContent>
            {scores.map((p) => (
              <div key={p.userId} className="flex justify-between">
                <span>{p.username}</span>
                <span>{p.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="relative">
        {renderQuestion()}

        {explode && (
          <Confetti
            width={width}
            height={height}
            numberOfPieces={200}
            initialVelocityX={{ min: -10, max: 10 }}
            initialVelocityY={10}
            recycle={false}
            run={explode}
          />
        )}
      </div>
    </div>
  );
};

export default MatchPlay;
