// useQuestionSocket.js (Custom hook để tối ưu hóa xử lý WebSocket chung)
import { useEffect, useState } from "react";

const useQuestionSocket = (socket, userId, questionId, onCorrect = () => {}, onIncorrect = () => {}) => {
  const [isCorrect, setIsCorrect] = useState(null);
  const [isWrong, setIsWrong] = useState(false);

  useEffect(() => {
    const handleAnswerSubmitted = ({ questionId: qId }) => {
      if (qId === questionId) {
        console.log(`Submitted answer for question ${questionId}`);
      }
    };

    const handleAnswerResult = ({ userId: resUserId, isCorrect: resCorrect, questionId: qId }) => {
      if (resUserId === userId && qId === questionId) {
        setIsCorrect(resCorrect);
        if (resCorrect) {
          onCorrect();
        } else {
          setIsWrong(true);
          setTimeout(() => setIsWrong(false), 600);
          onIncorrect();
        }
      }
    };

    const handleError = (message) => {
      console.log("Error:", message);
    };

    socket.on("answerSubmitted", handleAnswerSubmitted);
    socket.on("answerResult", handleAnswerResult);
    socket.on("error", handleError);

    return () => {
      socket.off("answerSubmitted", handleAnswerSubmitted);
      socket.off("answerResult", handleAnswerResult);
      socket.off("error", handleError);
    };
  }, [socket, userId, questionId, onCorrect, onIncorrect]);

  return { isCorrect, isWrong, setIsWrong }; // Trả về thêm setIsWrong nếu cần tùy chỉnh
};

export default useQuestionSocket;