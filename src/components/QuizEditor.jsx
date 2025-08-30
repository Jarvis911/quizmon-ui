import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import axios from "axios";

import ButtonQuestionForm from "./ButtonQuestionForm";
import CheckboxQuestionForm from "./CheckboxQuestionForm";
import RangeQuestion from "./RangeQuestion";
import SelectQuestionType from "./SelectQuestionType";

const QuizEditor = () => {
  const { id } = useParams(); // quizId từ route
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectingType, setSelectingType] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🟢 Load quiz + câu hỏi từ backend
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/quiz/${id}`);
        // API trả về { id, title, description, questions: [...] }
        const normalized = (res.data.questions || []).map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type, // "BUTTONS", "CHECKBOXES", "RANGE"
          media: q.media || [],
          options: q.options || [],
          range: q.range,
          // có thể thêm các field đặc biệt khác
        }));
        setQuestions(normalized);
        setActiveIndex(normalized.length ? 0 : null);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const addQuestion = (type) => {
    const newQ = { id: Date.now(), type, text: "", media: [], options: [] };
    setQuestions([...questions, newQ]);
    setActiveIndex(questions.length);
    setSelectingType(false);
    // TODO: gọi API POST /quiz/:id/questions để lưu DB
  };

  const renderActiveQuestion = () => {
    if (loading) return <p className="text-gray-500">Đang tải quiz...</p>;

    if (selectingType) {
      return <SelectQuestionType onSelect={addQuestion} />;
    }

    const q = questions[activeIndex];
    if (!q) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>Chưa có câu hỏi nào</p>
          <Button className="mt-4" onClick={() => setSelectingType(true)}>
            + Thêm câu hỏi đầu tiên
          </Button>
        </div>
      );
    }

    switch (q.type) {
      case "BUTTONS":
        return (
          <ButtonQuestionForm
            question={q}
            onChange={(updated) => {
              const copy = [...questions];
              copy[activeIndex] = updated;
              setQuestions(copy);
            }}
          />
        );
      case "CHECKBOXES":
        return (
          <CheckboxQuestionForm
            question={q}
            onChange={(updated) => {
              const copy = [...questions];
              copy[activeIndex] = updated;
              setQuestions(copy);
            }}
          />
        );
      case "RANGE":
        return (
          <RangeQuestion
            question={q}
            onChange={(updated) => {
              const copy = [...questions];
              copy[activeIndex] = updated;
              setQuestions(copy);
            }}
          />
        );
      default:
        return <p className="text-red-500">Loại câu hỏi chưa được hỗ trợ</p>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto p-6">
        {renderActiveQuestion()}
      </main>

      {/* Navbar preview */}
      <footer className="fixed inset-x-0 bottom-0 overflow-x-auto border-t h-28 flex items-center gap-3 px-4 bg-white/80 backdrop-blur-md">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`min-w-20 h-20 rounded-xl border-2 cursor-pointer flex items-center justify-center overflow-hidden ${
              i === activeIndex ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => {
              setActiveIndex(i);
              setSelectingType(false);
            }}
          >
            {/* thumbnail (ảnh/video) */}
            {q.media.map((m) => {
              if (m.type === "IMAGE") {
                return <img className="w-16 h-16 rounded-md" src={m.url}></img>;
              }
              if (m.type === "VIDEO") {
                function getYoutubeThumbnail(url) {
                  const regex =
                    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                  const match = url.match(regex);
                  return match
                    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
                    : null;
                }

                const thumbnail = getYoutubeThumbnail(m.url);
                return (
                  <img
                    key={m.id}
                    src={thumbnail}
                    className="w-16 h-16 rounded-md"
                  />
                );
              }
            })}
          </div>
        ))}
        {/* nút thêm */}
        <Button
          onClick={() => setSelectingType(true)}
          className="w-20 h-20 rounded-xl flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </footer>
    </div>
  );
};

export default QuizEditor;
