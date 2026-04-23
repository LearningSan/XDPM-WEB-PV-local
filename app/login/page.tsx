"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
const [registerName, setRegisterName] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const [step, setStep] = useState<"email" | "otp" | "reset">("email");
const [newPassword, setNewPassword] = useState("");
const [oldPassword, setOldPassword] = useState("");
  useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data === "LOGIN_SUCCESS") {
      console.log("Login success via popup");
      window.location.href = "http://localhost:5173";
    }
  };

  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
  };
}, []);
  // 🔹 Login thường

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login successful");
      window.location.href = "http://localhost:5173";
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = () => {
  signIn("google", {
  callbackUrl: "/auth/social-callback"
});
};
  // 🔹 Facebook login
 const handleFacebookLogin = () => {
 signIn("facebook", {
  callbackUrl: "/auth/social-callback",
});
};
    const handleSendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      // 👉 chuyển sang nhập OTP
      setStep("otp");
    } catch (err) {
      setError("Send OTP failed");
    }

    setLoading(false);
  };

 const handleVerifyOTP = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      setError(data.message);
      setLoading(false);
      return;
    }

    // ✅ Chỉ cần qua bước reset
    setStep("reset");

  } catch (err) {
    setError("Verify OTP failed");
  }

  setLoading(false);
};
const handleResetPassword = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      setError(data.message);
      setLoading(false);
      return;
    }

    alert("Đặt mật khẩu mới thành công!");
    setIsForgot(false);

  } catch (err) {
    setError("Reset password failed");
  }

  setLoading(false);
};
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
  type="button"
  onClick={() => setIsRegister(true)}
  style={{
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Register
</button>
      </form>
{isRegister && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
      borderRadius: "8px",
    }}
  >
    <h3 style={{ textAlign: "center" }}>Register</h3>

    <input
      type="text"
      placeholder="Full name"
      value={registerName}
      onChange={(e) => setRegisterName(e.target.value)}
      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
    />

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
    />

    <input
      type="password"
      placeholder="Password"
      value={registerPassword}
      onChange={(e) => setRegisterPassword(e.target.value)}
      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
    />

    <button
      onClick={async () => {
        setLoading(true);
        setError("");

        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password: registerPassword,
              name: registerName,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.message);
            return;
          }

          alert("Register success!");
          setIsRegister(false);
        } catch {
          setError("Register failed");
        } finally {
          setLoading(false);
        }
      }}
      style={{
        width: "100%",
        padding: "10px",
        backgroundColor: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      {loading ? "Creating..." : "Create account"}
    </button>

    <p
      onClick={() => setIsRegister(false)}
      style={{
        textAlign: "center",
        color: "blue",
        cursor: "pointer",
        marginTop: "10px",
      }}
    >
      Back to login
    </p>
  </div>
)}
      <hr style={{ margin: "20px 0" }} />

      {/* Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#db4437",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        Login with Google
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebookLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#1877f2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Login with Facebook
      </button>
       <p
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => {
              setIsForgot(true);
              setStep("email");
            }}
          >
            Forgot password?
          </p>
             {isForgot && (
        <>
        {step === "email" && (
  <div style={{ textAlign: "center" }}>
    
    <h3 style={{ marginBottom: "10px" }}>Quên mật khẩu</h3>

    <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
      Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
    </p>

    <input
      type="email"
      placeholder="example@gmail.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      disabled={loading}
      style={{
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginBottom: "15px",
        outline: "none",
      }}
    />

    <button
      onClick={handleSendOTP}
      disabled={loading || !email}
      style={{
        width: "100%",
        padding: "10px",
        backgroundColor: loading || !email ? "#9ca3af" : "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: loading || !email ? "not-allowed" : "pointer",
        transition: "0.2s",
      }}
    >
      {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
    </button>

    <p
      style={{
        marginTop: "15px",
        fontSize: "13px",
        color: "blue",
        cursor: "pointer",
      }}
      onClick={() => setIsForgot(false)}
    >
      ← Quay lại đăng nhập
    </p>
  </div>
)}
{step === "otp" && (
  <>
    <h3>Nhập OTP</h3>

    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {otp.map((num, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={num}
          onChange={(e) => {
            const value = e.target.value;
            if (!/^[0-9]?$/.test(value)) return;

            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
          }}
          style={{
            width: "40px",
            height: "45px",
            textAlign: "center",
            fontSize: "18px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      ))}
    </div>

    <button
      onClick={handleVerifyOTP}
      style={{
        width: "100%",
        marginTop: "15px",
        padding: "10px",
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
      }}
    >
      {loading ? "Checking..." : "Xác nhận OTP"}
    </button>
  </>
)}

          {/* quay lại login */}
          <p
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => setIsForgot(false)}
          >
            Quay lại đăng nhập
          </p>
          {step === "reset" && (
  <>
    <h3>Đổi mật khẩu</h3>

    <input
      type="password"
      placeholder="Mật khẩu cũ"
      value={oldPassword}
      onChange={(e) => setOldPassword(e.target.value)}
    />

    <input
      type="password"
      placeholder="Mật khẩu mới"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />

    <button onClick={handleResetPassword}>
      {loading ? "Updating..." : "Cập nhật mật khẩu"}
    </button>
  </>
)}
        </>
      )}
    </div>
    
  );
}