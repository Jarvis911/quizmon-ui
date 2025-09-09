// QuestionMedia.jsx (Component chung để hiển thị media, giảm trùng lặp UI)
import ReactPlayer from "react-player";

const QuestionMedia = ({ media }) => {
  if (!media) return null;
  const isVideo = media.type === "VIDEO";

  return (
    <div className="flex-1">
      {isVideo ? (
        <ReactPlayer
          url={media.url}
          controls={false}
          playing={true}
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
        <div className="w-[500px] aspect-[16/9] overflow-hidden rounded-lg">
          <img
            src={media.url}
            alt="Question media"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionMedia;