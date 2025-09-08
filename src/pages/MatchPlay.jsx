import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "@/services/socket.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ButtonQuestionPlay from "@/components/question/ButtonQuestionPlay";
import CheckboxQuestionPlay from "@/components/question/CheckboxQuestionPlay";
import RangeQuestionPlay from "@/components/question/RangeQuestionPlay";
import ReorderQuestionPlay from "@/components/question/ReorderQuestionPlay";
import TypeAnswerQuestionPlay from "@/components/question/TypeAnswerQuestionPlay";
import LocationQuestionPlay from "@/components/question/LocationQuestionPlay";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Alert, AlertDescription } from "@/components/ui/alert";


const MatchPlay = () => {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(30);
  const [scores, setScores] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [notification, setNotification] = useState(null);
  const [explode, setExplode] = useState(false);
  const [error, setError] = useState(null);
  const { width, height } = useWindowSize();
  // Save question to Ref
  const questionRef = useRef(null);

  useEffect(() => {
    socket.emit("requestCurrentQuestion", { matchId });
  }, [matchId, user.id]);

  useEffect(() => {    
    const handleNextQuestion = ({question, timer}) => {
      console.log("⚡ [Client] nextQuestion received:", question);
      setQuestion(question);
      setTimer(timer);
      setIsCorrect(null);
      setExplode(false);
      questionRef.current = question;
      setError(null);
    }

    const handleTimeUpdate = (remainingTime) => {
      setTimer(remainingTime);
    }

    const handleAnswerResult = ({ userId, isCorrect, questionId }) => {
      if (userId === user.id && questionRef.current?.id === questionId) {
        setIsCorrect(isCorrect);
        if (isCorrect) {
          setExplode(true);
          setTimeout(() => setExplode(false), 3000);
        }
      }
    }

    const handleUpdateScores = (newScores) => {
      setScores(newScores);
    }

    const handleGameOver = ({ leaderboard }) => {
      setNotification(`Game over! Leaderboard: ${JSON.stringify(leaderboard)}`);
    }

    const handleError = ({message}) => {
      setError(message);
    }

    const handleNotification = ({message}) => {
      setNotification(message);
      setTimeout(() => setNotification(null), 5000);
    }

    socket.on("nextQuestion", handleNextQuestion);
    socket.on("timeUpdate", handleTimeUpdate);
    socket.on("answerResult", handleAnswerResult);
    socket.on("updatedScores", handleUpdateScores);
    socket.on("gameOver", handleGameOver);
    socket.on("error", handleError);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("nextQuestion", handleNextQuestion);
      socket.off("timeUpdate", handleTimeUpdate);
      socket.off("answerResult", handleAnswerResult);
      socket.off("updatedScores", handleUpdateScores);
      socket.off("gameOver", handleGameOver);
      socket.off("error", handleError);
      socket.off("notification", handleNotification);
    }
  }, [matchId, user.id]);


  // Render the question
  const renderQuestion = () => {
    if (!question) return <p className="text-center text-gray-500">Đang chờ câu hỏi...</p>;

    switch (question.type) {
      case "BUTTONS":

        return (
          <ButtonQuestionPlay
            question={question}
            socket={socket}
            matchId={matchId}
            userId={user.id}
            timer={timer}
          />
        );
      case "CHECKBOXES":
        return (
          <CheckboxQuestionPlay
            question={question}
            socket={socket}
            matchId={matchId}
            userId={user.id}
            timer={timer}
          />
        );
      case "RANGE":
        return (
          <RangeQuestionPlay
            question={question}
            socket={socket}
            matchId={matchId}
            userId={user.id}
            timer={timer}
          />
        );
      case "REORDER":
        return (
          <ReorderQuestionPlay
            question={question}
            socket={socket}
            matchId={matchId}
            userId={user.id}
            timer={timer}
          />
        );
      case "TYPEANSWER":
        return (
          <TypeAnswerQuestionPlay
            question={question}
            socket={socket}
            matchId={matchId}
            userId={user.id}
            timer={timer}
          />
        );
      case "LOCATION":
        return (
          <LocationQuestionPlay
            question={question}
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
    <div className="p-6 top-30 flex flex-col">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notification && (
        <Alert>
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}
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
      <div>
        <Progress value={(timer / 30) * 100} className="mb-4"/>
        <p className="text-center mb-4">Điểm: {((timer / 30)*1000).toFixed(0)}</p>
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
