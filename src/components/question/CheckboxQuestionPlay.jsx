import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ReactPlayer from "react-player";

const CheckboxQuestionPlay = ({ question, socket, matchId, userId, timer }) => {
  const [selected, setSelected] = useState([]); // Array of selected indices
  const [isCorrect, setIsCorrect] = useState(null);
  const [isWrong, setIsWrong] = useState(false);
  const [explode, setExplode] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Reset states when a new question is received
    setSelected([]);
    setIsCorrect(null);
    setIsWrong(null);
    setExplode(false);
  }, [question.id]);

  useEffect(() => {
    socket.on("answerSubmitted", ({ questionId }) => {
      if (questionId === question.id) {
        console.log(`Submitted checkbox answer`);
      }
    });

    socket.on("answerResult", ({ userId: resUserId, isCorrect: resCorrect, questionId }) => {
      if (resUserId === userId && questionId === question.id) {
        setIsCorrect(resCorrect);
        if (resCorrect) {
          setExplode(true);
          setTimeout(() => setExplode(false), 5000);
        } else {
          setIsWrong(true);
          setTimeout(() => setIsWrong(false), 600)
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

  const handleSelect = (idx) => {
    if (selected.includes(idx)) {
      setSelected(selected.filter(i => i !== idx));
    } else {
      setSelected([...selected, idx]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0 || timer <= 0) return;
    const answer = question.options.map((_, idx) => selected.includes(idx)); // Boolean array
    socket.emit("submitAnswer", {
      matchId,
      userId,
      questionId: question.id,
      answer,
    });
    setSelected([]); // Lock after submit
  };

  const media = question.media?.[0];
  const isVideo = media?.type === "VIDEO";
  
  // For shake animation
  const wrapperClass = `flex flex-row gap-8 p-6 relative transition ${isWrong ? "bg-red-500/30 shake rounded-2xl" : ""}`;
  return (
    <div className={wrapperClass}>
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
                height="350px"
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
              <div className="w-[500px] aspect-[16/9] overflow-hidden rounded-lg">
                <img
                  src={media.url}
                  alt="Question media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg text-black flex-1 flex flex-col justify-between">
        <div>
          <h2 className="min-w-[250px] text-xl font-bold mb-4">
            {question.text}
          </h2>
          <div className="space-y-4 flex flex-col gap-4 mb-4">
            {question.options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${idx}`}
                  checked={selected.includes(idx)}
                  onCheckedChange={() => handleSelect(idx)}
                  disabled={isCorrect !== null || timer <= 0}
                />
                <Label htmlFor={`option-${idx}`}>{opt.text}</Label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={selected.length === 0 || isCorrect !== null || timer <= 0}>
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

export default CheckboxQuestionPlay;