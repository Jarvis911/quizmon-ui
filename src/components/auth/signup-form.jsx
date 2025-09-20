import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom";

// schema validate (tiếng Việt)
const signUpSchema = z.object({
  username: z.string().min(6, "Tên đăng nhập phải có ít nhất 6 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export function SignUpForm({ className, ...props }) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data) => {
    const ok = await signup(data.username, data.password);
    if (!ok) {
      alert("Đăng ký thất bại, vui lòng thử lại!");
    }
    else {
      navigate("/quiz/create");
    }
  };

  const onLogin = () => {
    navigate("/login");
  }

  return (
    <div className={cn("absolute top-30 left-[50%] -translate-x-1/2 flex flex-col gap-6", className)} {...props}>
      <Card className="min-w-sm bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Đăng ký với tên đăng nhập và bắt đầu hành trình của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input id="username" type="text" placeholder="triho753@gmail.com" {...register("username")} />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full">
                Đăng ký
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-black text-center text-sm text-balance *:[a]:underline *:[a]:underline-offset-4">
        Đã có tài khoản?{" "}
        <a href="#" onClick={onLogin} className="hover:text-primary">
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
