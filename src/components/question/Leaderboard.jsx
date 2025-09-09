
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

const Leaderboard = ({ leaderboard, currentUserId }) => {
  const navigate = useNavigate();
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen min-w-[1000px] flex items-center justify-center">
      <Card className="w-full max-w-lg bg-white/95 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Bảng Xếp Hạng Cuối Trận
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLeaderboard.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có dữ liệu xếp hạng</p>
          ) : (
            <div className="space-y-3">
              {sortedLeaderboard.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    player.userId === currentUserId
                      ? "bg-blue-100 font-semibold"
                      : "hover:bg-gray-100"
                  } animate-slide-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-6 text-center">{getRankIcon(index) || `#${index + 1}`}</span>
                    <span className="text-lg">{player.username}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{player.score}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="p-6">
          <Button
            onClick={() => navigate(`/home`)}
            className="w-full bg-orange-600 hover:bg-orange-600/70 text-white"
          >
            Trở về Home
          </Button>
        </div>
      </Card>
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
