"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push("/");
                router.refresh();
            } else {
                setError(data.error || "Verkeerd wachtwoord");
            }
        } catch (err) {
            setError("Er is iets misgegaan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="login-card"
            >
                <div className="login-header">
                    <div className="icon-wrapper">
                        <Lock size={28} />
                    </div>
                    <h1>Klompsidian</h1>
                    <p>Voer je wachtwoord in om door te gaan</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Wachtwoord"
                            required
                            autoFocus
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="error-message"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? "Bezig met inloggen..." : "Inloggen"}
                    </button>
                </form>
            </motion.div>

            <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 48px 40px;
          text-align: center;
        }
        .login-header {
          margin-bottom: 32px;
        }
        .icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(187, 134, 252, 0.15);
          color: var(--accent);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 1px solid rgba(187, 134, 252, 0.2);
        }
        .login-header h1 {
          margin: 0 0 12px;
          color: var(--accent);
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .login-header p {
          color: #888;
          font-size: 0.95rem;
          margin: 0;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--foreground);
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .input-group input:focus {
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.08);
        }
        .input-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ff6b6b;
          font-size: 0.9rem;
          padding: 12px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 8px;
          text-align: left;
        }
        :global(.login-btn) {
          background: var(--accent);
          color: #000;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        :global(.login-btn:hover:not(:disabled)) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(187, 134, 252, 0.3);
        }
        :global(.login-btn:active:not(:disabled)) {
          transform: translateY(0);
        }
        :global(.login-btn:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
