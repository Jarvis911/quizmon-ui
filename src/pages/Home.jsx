import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import endpoints from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

//Swiper

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Home = () => {
  const { user, token } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch my quizzes and categories first
  useEffect(() => {
    const fetchMyQuizzes = async () => {
      try {
        if (token) {
          const res = await axios.get(endpoints.quizzes, {
            headers: {
              Authorization: token,
            },
          });

          setMyQuizzes(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(endpoints.category);
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyQuizzes();
    fetchCategories();
  }, [token]);

  const handlePlayNow = async (quizId) => {
    try {
      const res = await axios.post(
        endpoints.matches,
        { quizId },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      navigate(`/match/${res.data.id}/lobby`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditQuiz = async (quizId) => {
    navigate(`/quiz/${quizId}/editor`);
  };

  const ArrowButton = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
  >
    {direction === 'left' ? '←' : '→'}
  </button>
  );

  const renderQuizCard = (quiz) => {
    return (
      <Card
        key={quiz.id}
        className="flex relative justify-between min-w-[200px] max-w-[220px] group cursor-pointer bg-white/70 backdrop-blur-md"
      >
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.image && (
            <img
              src={quiz.image}
              alt={quiz.title}
              className="w-full h-26 object-cover rounded"
            />
          )}
          <div className="mt-2 flex flex-row justify-between items-center gap-1">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm text-gray-600">
                4/5
              </span>
            </div>
            <p className="text-xs  text-gray-600 truncate">
              by {quiz.creator.username}
            </p>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-black/50 flex flex-col gap-4 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" onClick={() => handlePlayNow(quiz.id)}>
            Chơi ngay
          </Button>
          {user && user.id === quiz.creatorId && (
            <Button variant="secondary" onClick={() => handleEditQuiz(quiz.id)}>
              Chỉnh sửa
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {user && (
        <section>
          <h2 className="text-black text-2xl font-bold mb-4">Quiz của tôi</h2>
            <QuizCarousel quizzes={myQuizzes} renderQuizCard={renderQuizCard} />
        </section>
      )}

      {/* Categories */}
      {categories.map((cat) => (
        <section key={cat.id}>
          <h2 className="text-black text-2xl font-bold mb-4">{cat.name}</h2>
          <CategoryQuizzes
            categoryId={cat.id}
            renderQuizCard={renderQuizCard}
          />
        </section>
      ))}
    </div>
  );
};

const QuizCarousel = ({ quizzes, renderQuizCard }) => (
  <Swiper
    modules={[Navigation]}
    spaceBetween={15}
    navigation
    breakpoints={{
      640: { slidesPerView: 4 },
      1024: { slidesPerView: 5 },
      1280: { slidesPerView: 6 },
    }}
    className="pb-8"
  >
    {quizzes.map((quiz) => (
      <SwiperSlide key={quiz.id} style={{ width: "auto" }}>
        {renderQuizCard(quiz)}
      </SwiperSlide>
    ))}
  </Swiper>
);

const CategoryQuizzes = ({ categoryId, renderQuizCard }) => {
  const [quizzes, setQuizzes] = useState([]);

  const fetchQuizzesByCategory = async (categoryId) => {
    try {
      const res = await axios.get(endpoints.getQuizByCategory(categoryId));
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const data = await fetchQuizzesByCategory(categoryId);
      setQuizzes(data);
    };

    fetch();
  }, [categoryId]);

  return (
    <QuizCarousel quizzes={quizzes} renderQuizCard={renderQuizCard} />
  );
};

export default Home;
