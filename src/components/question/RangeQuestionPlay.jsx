import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ReactPlayer from "react-player";

const RangeQuestionPlay = ({ question, socket, matchId, userId, timer }) => {
  const [value, setValue] = useState([question.range.minValue]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [explode, setExplode] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Reset states when a new question is received
    setValue([question.range.minValue]);
    setIsCorrect(null);
    setExplode(false);
  }, [question.id]);

  useEffect(() => {
    socket.on("answerSubmitted", ({ questionId }) => {
      if (questionId === question.id) {
        console.log(`Submitted range answer`);
      }
    });

    socket.on("answerResult", ({ userId: resUserId, isCorrect: resCorrect, questionId }) => {
      if (resUserId === userId && questionId === question.id) {
        setIsCorrect(resCorrect);
        if (resCorrect) {
          setExplode(true);
          setTimeout(() => setExplode(false), 3000);
        }
      }
    });

    socket.on("error", (message) => {
      console.log("Error:", message);
    });

    return () => {
      socket.off("answerSubmitted");
      socket.off("answerResult");
      socket.off("error");
    };
  }, [socket, userId, question.id]);

  const handleSubmit = () => {
    if (timer <= 0) return;
    const answer = value[0]; // Single value from slider
    socket.emit("submitAnswer", {
      matchId,
      userId,
      questionId: question.id,
      answer,
    });
  };

  const media = question.media?.[0];
  const isVideo = media?.type === "VIDEO";

  return (
    <div className="flex flex-row gap-8 p-6 relative">
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
                width="500px"
                height="300px"
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

      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg text-black flex-1 flex flex-col justify-between">
        <div>
          <h2 className="min-w-[250px] text-2xl font-bold mb-4">
            {question.text}
          </h2>
          <Slider
            min={question.range.minValue}
            max={question.range.maxValue}
            step={1}
            value={value}
            onValueChange={setValue}
            disabled={isCorrect !== null || timer <= 0}
          />
          <p className="text-center mt-2">Giá trị: {value[0]}</p>
        </div>
        <Button onClick={handleSubmit} disabled={isCorrect !== null || timer <= 0}>
          Submit
        </Button>
      </div>

      {explode && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={500}
          initialVelocityX={{ min: -10, max: 10 }}
          initialVelocityY={10}
          recycle={false}
          run={explode}
        />
      )}
    </div>
  );
};

export default RangeQuestionPlay;