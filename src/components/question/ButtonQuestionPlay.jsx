import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Shadcn progress
import { TypeAnimation } from "react-type-animation"; // Typing
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; // For confetti
import ReactPlayer from "react-player"; // For video, install npm install react-player

const ButtonQuestionPlay = ({ question, onSubmit, socket, userId, timer: timer }) => {
  const [selected, setSelected] = useState(null);
  const [points, setPoints] = useState(1000);
  const [typedComplete, setTypedComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [explode, setExplode] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const handleTimeUp = () => {
      console.log("⚡ [Client] timeUp");      
    };

    const step = 0.6;
    console.log(step);
    const interval = setInterval(() => {
      setPoints((prev) => Math.max(0, prev - step).toFixed(0));
    }, 10);

    if (points <= 0) {
      clearInterval(interval);
      onSubmit(null); // Time up, submit null
      socket.emit("timeUp", handleTimeUp);
    }

    return () => {
      clearInterval(interval);
    }

  }, [onSubmit, timer]);

  useEffect(() => {

    socket.on(
      "answerResult",
      ({ userId: resUserId, isCorrect: resCorrect, questionId }) => {
        if (resUserId === userId && questionId === question.id) {
          setIsCorrect(resCorrect);
          if (resCorrect) {
            setExplode(true);
            setTimeout(() => setExplode(false), 3000); // Tắt sau 3s
          }
        }
      }
    );

    return () => {
      socket.off("answerResult");
    };
  }, [points, socket, userId, question.id, onSubmit, timer]);

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    onSubmit(index);
  };

  const media = question.media?.[0];
  const isVideo = media?.type === "VIDEO";

  return (
    <div className="flex flex-row gap-8 p-6 relative">
      {/* Bên trái: Media (hình ảnh hoặc video) */}
      <div className="flex-1">
        {media && (
          <>
            {isVideo ? (
              <ReactPlayer
                url={media.url}
                controls={false}
                playing={true}
                muted={true}
                loop={true}
                width="100%"
                height="auto"
                config={{
                  youtube: {
                    playerVars: {
                      start: media.startTime,
                      end: media.startTime + media.duration,
                    },
                  },
                }}
              />
            ) : (
              <img
                src={media.url}
                alt="Question media"
                className="w-full h-auto rounded-lg"
              />
            )}
          </>
        )}
      </div>

      {/* Bên phải: Câu hỏi và đáp án */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            <TypeAnimation
              sequence={[question.text, 2000]} // Typing trong 2s
              wrapper="span"
              speed={50}
              cursor={false}
              onComplete={() => setTypedComplete(true)}
            />
          </h2>
          {typedComplete && (
            <div className="space-y-4">
              {question.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant={
                    selected === idx
                      ? isCorrect
                        ? "success"
                        : "destructive"
                      : "outline"
                  }
                  className="w-full"
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null || points <= 0}
                >
                  {opt.text}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Thanh điểm dưới cùng */}
        <Progress value={(points / 1000) * 100} className="mt-8" />
        <p className="text-center mt-2">Điểm: {points}</p>
      </div>

      {/* Confetti */}
      {explode && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          initialVelocityX={{ min: -10, max: 10 }} // Bắn từ 2 bên
          initialVelocityY={10}
          recycle={false}
          run={explode}
        />
      )}
    </div>
  );
};

export default ButtonQuestionPlay;
