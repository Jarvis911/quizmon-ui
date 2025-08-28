import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";

// UI shadcn
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

  import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const questionSchema = z.object({
  text: z.string().min(3, "Câu hỏi ít nhất 3 ký tự"),
  latitude: z.number({ required_error: "Chọn vị trí trên bản đồ" }),
  longitude: z.number({ required_error: "Chọn vị trí trên bản đồ" }),
});

function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const LocationQuestionForm = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        quizId: 12,
        text: values.text,
        type: "LOCATION",
        correctLatitude: values.latitude,
        correctLongitude: values.longitude,
      };

      await axios.post("http://localhost:5000/question/location", payload, {
        headers: {
          Authorization: token,
        },
      });

      alert("Tạo câu hỏi thành công!");
      form.reset();
      setLocation(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  // đồng bộ form khi chọn điểm
  if (location) {
    form.setValue("latitude", location.lat);
    form.setValue("longitude", location.lng);
  }

  return (
    <div className="p-6 border rounded-xl shadow bg-white/40 backdrop-blur-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl z-50">
          <Loader2 className="animate-spin h-8 w-8 text-white" />
        </div>
      )}

      <h2 className="font-bold text-lg mb-4">Tạo câu hỏi về địa điểm</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-row gap-8"
        >
          {/* Map chọn vị trí */}
          <div className="flex flex-col gap-3">
            <MapContainer
              className="min-w-lg"
              center={[10.7904, 106.69285]} 
              zoom={10}
              style={{ height: "450px", borderRadius: "12px" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <LocationPicker setLocation={setLocation} />
              {location && <Marker position={[location.lat, location.lng]} />}
            </MapContainer>
            {location && (
              <p className="text-sm text-gray-600">
                Đã chọn: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Text câu hỏi */}
          <div className="flex flex-col gap-4 w-1/2">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Câu hỏi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập câu hỏi về địa điểm..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Lưu câu hỏi
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LocationQuestionForm;
