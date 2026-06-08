import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../stores/authStore";

export function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await register(email, password, displayName);
      navigate("/onboarding");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6faf7] px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-black text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Start with onboarding, then build your Carbon Twin.</p>
        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} />
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          <Button className="w-full" type="submit" disabled={isLoading}>Create Account</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered? <Link className="font-bold text-forest" to="/login">Log in</Link>
        </p>
      </Card>
    </main>
  );
}

