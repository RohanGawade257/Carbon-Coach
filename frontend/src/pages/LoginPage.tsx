import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const demoLogin = useAuthStore((state) => state.demoLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      const user = await login(email, password);
      showToast("Logged In");
      navigate(user.hasProfile ? "/dashboard" : "/onboarding");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
      showToast("Something Went Wrong", "error");
    }
  }

  async function handleDemo() {
    try {
      setError("");
      await demoLogin();
      showToast("Demo Account Loaded");
      navigate("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Demo mode failed");
      showToast("Something Went Wrong", "error");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6faf7] px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-black text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Log in to continue reducing your footprint.</p>
        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button className="w-full" type="submit" isLoading={isLoading} loadingLabel="Logging in...">Login</Button>
          <Button className="w-full" type="button" variant="secondary" isLoading={isLoading} loadingLabel="Loading demo..." onClick={handleDemo}>Try Demo Account</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here? <Link className="font-bold text-forest" to="/register">Create an account</Link>
        </p>
      </Card>
    </main>
  );
}
