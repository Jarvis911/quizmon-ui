import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem"; 
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ReactPlayer from "react-player";

const ReorderQuestionPlay = ({ question, socket, matchId, userId, timer }) => {
  const [isCorrect, setIsCorrect] = useState(null);
  const [explode, setExplode] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const { width, height } = useWindowSize();
  const colors = ["bg-red-500/60", "bg-blue-500/60", "bg-green-500/60", "bg-yellow-500/60"];

  const [items, setItems] = useState(
    question.options.map((opt, idx) => ({
      id: idx,
      text: opt.text,
      color: colors[idx % colors.length], 
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Reset states when a new question is received
    setItems(question.options.map((opt, idx) => ({ id: idx, text: opt.text, color: colors[idx % colors.length] })));
    setIsCorrect(null);
    setExplode(false);
    setIsWrong(false);
  }, [question.id]);

  useEffect(() => {
    socket.on("answerSubmitted", ({ questionId }) => {
      if (questionId === question.id) {
        console.log(`Submitted reorder answer`);
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
          setTimeout(() => setIsWrong(false), 600);
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    if (timer <= 0) return;
    const answer = items.map(item => item.id); // Array of orders
    socket.emit("submitAnswer", {
      matchId,
      userId,
      questionId: question.id,
      answer,
    });
  };

  const media = question.media?.[0];
  const isVideo = media?.type === "VIDEO";
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} color={item.color}>
                  {item.text}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <Button onClick={handleSubmit} disabled={isCorrect !== null || timer <= 0}>
          Submit
        </Button>
      </div>

      {explode && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={600}
          initialVelocityX={{ min: -10, max: 10 }}
          initialVelocityY={10}
          recycle={false}
          run={explode}
        />
      )}
    </div>
  );
};

export default ReorderQuestionPlay;