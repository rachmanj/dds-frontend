"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="w-full max-w-md">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <p className="text-white">Loading...</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
} 