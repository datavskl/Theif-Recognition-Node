import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, registerSchema } from "@shared/schema";
import type { LoginRequest, RegisterRequest } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { t } = useTranslation();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "staff",
    },
  });

  const handleLogin = async (data: LoginRequest) => {
    try {
      await login(data);
      toast({
        title: t('success'),
        description: t('loginSuccess'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('loginError'),
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: RegisterRequest) => {
    try {
      await register(data);
      toast({
        title: t('success'),
        description: t('registrationSuccess'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: "Registration failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center security-bg p-4">
      <Card className="w-full max-w-md security-surface security-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl security-text-primary">
            {t('appTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 security-surface-secondary">
              <TabsTrigger value="login" className="security-text-primary">
                {t('login')}
              </TabsTrigger>
              <TabsTrigger value="register" className="security-text-primary">
                {t('register')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="security-text-primary">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register("email")}
                    className="security-border"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-sm">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="security-text-primary">
                    {t('password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="security-border"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-sm">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full security-accent-red hover:security-accent-red"
                  disabled={isLoading}
                >
                  {isLoading ? t('loading') : t('login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="security-text-primary">
                    {t('username')}
                  </Label>
                  <Input
                    id="username"
                    {...registerForm.register("username")}
                    className="security-border"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-red-500 text-sm">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="security-text-primary">
                    {t('email')}
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    {...registerForm.register("email")}
                    className="security-border"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-sm">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="security-text-primary">
                    {t('password')}
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    {...registerForm.register("password")}
                    className="security-border"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-red-500 text-sm">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="security-text-primary">
                    {t('role')}
                  </Label>
                  <Select
                    value={registerForm.watch("role")}
                    onValueChange={(value) => registerForm.setValue("role", value as "admin" | "staff")}
                  >
                    <SelectTrigger className="security-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">{t('staff')}</SelectItem>
                      <SelectItem value="admin">{t('admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  type="submit"
                  className="w-full security-accent-red hover:security-accent-red"
                  disabled={isLoading}
                >
                  {isLoading ? t('loading') : t('register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
