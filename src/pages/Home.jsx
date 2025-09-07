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

const Home = () => {
  const { token } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  // Fetch my quizzes and categories first
  useEffect(() => {
    const fetchMyQuizzes = async () => {
      try {
        const res = await axios.get(endpoints.quizzes, {
          headers: {
            Authorization: token,
          },
        });

        setMyQuizzes(res.data);
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
      const res = await axios.post(endpoints.matches, { quizId }, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      })

      navigate(`/match/${res.data.id}/lobby`);
    } catch (err) {
      console.error(err);
    }
  }

  const handleJoinCode = async () => {
    if (code) {
      navigate(`/match/${code}/lobby`);
    }
  };

  const renderQuizCard = (quiz) => (
    <Card key={quiz.id} className="relative min-w-3xs group cursor-pointer bg-white/70 backdrop-blur-md" onClick={() => handlePlayNow(quiz.id)}>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {quiz.image && <img src={quiz.image} alt={quiz.title} className="w-full h-32 object-cover rounded" />}
      </CardContent>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="secondary">Play Now</Button>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 absolute top-0 left-[50%] -translate-x-1/2">
      {/* Ô nhập code */}
      <div className="flex gap-4">
        <Input className="text-white" placeholder="Nhập mã phòng..." value={code} onChange={(e) => setCode(e.target.value)} />
        <Button onClick={handleJoinCode}>Tham gia</Button>
      </div>

      {/* My Quizzes */}
      <section>
        <h2 className="text-gray-400 text-2xl font-bold mb-4">Quiz của tôi</h2>
        <div className="flex flex-row gap-6">
          {myQuizzes.map(renderQuizCard)}
        </div>
      </section>

      {/* Categories */}
      {categories.map((cat) => (
        <section key={cat.id}>
          <h2 className="text-gray-400 text-2xl font-bold mb-4">{cat.name}</h2>
          <CategoryQuizzes categoryId={cat.id} renderQuizCard={renderQuizCard} />
        </section>
      ))}
    </div>
  );
};

const CategoryQuizzes = ({ categoryId, renderQuizCard }) => {
  const [quizzes, setQuizzes ] = useState([]);

  const fetchQuizzesByCategory = async (categoryId) => {
    try {
      const res = await axios.get(endpoints.getQuizByCategory(categoryId));
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const data = await fetchQuizzesByCategory(categoryId);
      setQuizzes(data);
    }

    fetch();
  }, [categoryId]);

  return (
    <div className="flex flex-row gap-6">
      {quizzes.map(renderQuizCard)}
    </div>
  );
};

export default Home;