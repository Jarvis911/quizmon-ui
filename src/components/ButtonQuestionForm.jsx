import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import YoutubePicker from "./YoutubePicker";
import ImagePicker from "./ImagePicker";
import { useAuth } from "./AuthContext";
import { ImageIcon, Youtube, Trash2, Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const optionSchema = z.object({
  text: z.string().min(1, "Đáp án không được rỗng"),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().min(3, "Câu hỏi ít nhất 3 ký tự"),
  options: z.array(optionSchema).min(2, "Phải có ít nhất 2 đáp án"),
  mediaType: z.enum(["IMAGE", "YOUTUBE"]).optional(),
  videoUrl: z
    .string()
    .url("Link YouTube không hợp lệ")
    .optional()
    .or(z.literal("")),
  startTime: z.number().optional(),
  duration: z.number().optional(),
});

const ButtonQuestionForm = ({ quizId, question }) => {
  const { token } = useAuth();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
      mediaType: undefined,
      videoUrl: "",
      startTime: 0,
      duration: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    if (question) {
      form.reset({
        text: question.text || "",
        options: question.options?.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
        })) || [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
        mediaType: question.media?.length
          ? question.media[0].type === "VIDEO"
            ? "YOUTUBE"
            : "IMAGE"
          : undefined,
        videoUrl:
          question.media?.[0]?.type === "VIDEO" ? question.media[0].url : "",
        startTime: question.media?.[0]?.startTime || 0,
        duration: question.media?.[0]?.duration || 30,
      });

      // Nếu là ảnh → set preview
      if (question.media?.[0]?.type === "IMAGE") {
        setImageSrc(question.media[0].url);
      }
    }
  }, [question, form]);

  const removeImage = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Lấy ảnh crop
  const getCroppedImg = async () => {
    if (!imageSrc || !croppedAreaPixels) return null;
    const image = new Image();
    image.src = imageSrc;
    await new Promise((r) => (image.onload = r));

    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        blob.name = "image.jpg";
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("quizId", quizId);
      formData.append("text", values.text);
      formData.append("type", "BUTTONS");
      formData.append("options", JSON.stringify(values.options));
      
      if (values.mediaType === "IMAGE") {
        const croppedBlob = await getCroppedImg();
        if (croppedBlob) {
          formData.append("files", croppedBlob, "image.jpg"); 
        }
      } else if (values.mediaType === "YOUTUBE") {
        const videoData = 
          {
            url: values.videoUrl,
            startTime: values.startTime,
            duration: values.duration,
          }
        ;
        formData.append("videos", JSON.stringify(videoData));
      }

      if (question?.id) {
        // 🟢 Update câu hỏi
        await axios.put(
          `http://localhost:5000/question/buttons/${question.id}`,
          formData,
          {
            headers: {
              Authorization: token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Cập nhật câu hỏi thành công!");
      } else
        // Tạo mới câu hỏi
        {await axios.post("http://localhost:5000/question/buttons", formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });}

      alert("Tạo câu hỏi thành công!");
      form.reset();
      removeImage();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-xl shadow bg-white/40 backdrop-blur-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl z-50">
          <Loader2 className="animate-spin h-8 w-8 text-white" />
        </div>
      )}

      <h2 className="font-bold text-lg mb-4">{ question ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi trắc nghiệm"}</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-row gap-8"
        >
          {/* Chọn media */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-center gap-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("mediaType", "IMAGE")}
              >
                <ImageIcon className="mr-2" /> Thêm ảnh
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("mediaType", "YOUTUBE")}
              >
                <Youtube className="mr-2" /> Thêm video
              </Button>
            </div>

            {/* Nếu chọn IMAGE */}
            {form.watch("mediaType") === "IMAGE" &&  (
              <ImagePicker
                imageSrc={imageSrc}
                setImageSrc={setImageSrc}
                crop={crop}
                setCrop={setCrop}
                zoom={zoom}
                setZoom={setZoom}
                setCroppedAreaPixels={setCroppedAreaPixels}
              />
            )}

            {/* Nếu chọn YOUTUBE */}
            {form.watch("mediaType") === "YOUTUBE" && (
              <YoutubePicker form={form} />
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Text câu hỏi */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Câu hỏi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập câu hỏi..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Options */}
            <div>
              <FormLabel className="mb-2">Đáp án</FormLabel>
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <FormField
                    control={form.control}
                    name={`options.${idx}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={`Đáp án ${idx + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`options.${idx}.isCorrect`}
                    render={({ field }) => (
                      <input
                        type="radio"
                        checked={field.value}
                        onChange={() =>
                          form.setValue(
                            "options",
                            form.getValues("options").map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            }))
                          )
                        }
                      />
                    )}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={fields.length <= 2}
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ text: "", isCorrect: false })}
              >
                + Thêm đáp án
              </Button>
            </div>

            <Button type="submit" className="w-full">
              { question ? "Cập nhật câu hỏi" : "Lưu câu hỏi"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ButtonQuestionForm;
