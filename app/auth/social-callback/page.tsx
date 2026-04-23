"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SocialCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/auth/social-exchange", {
          method: "POST",
        });

        if (!res.ok) throw new Error("Failed");

        router.replace("http://localhost:5173");
      } catch (e) {
        signOut({ callbackUrl: "/login" });
      }
    };

    run();
  }, []);

  return <p>Logging in...</p>;
}