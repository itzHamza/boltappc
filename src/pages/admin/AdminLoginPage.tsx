import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

// ✅ Fix: Define `onLogin` in props
export function AdminLoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setErrorMessage("Invalid email or password");
    } else {
      if (onLogin) {
        onLogin(data.user); // ✅ Fix: Ensure `onLogin` exists before calling
        navigate("/admin"); // Redirect to dashboard
      } else {
        console.error("onLogin function is missing!");
      }
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleLogin}
        className="p-6 bg-white shadow-md rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <input
          type="email"
          placeholder="Email"
          className="block border p-2 mb-4 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="block border p-2 mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}
