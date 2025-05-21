"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// SearchParams component to handle URL parameters
function SearchParamsHandler({ onError }: { onError: (error: string) => void }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            onError(errorParam === "CredentialsSignin"
                ? "Invalid email or password"
                : "An error occurred during login");
        }
    }, [searchParams, onError]);

    return null;
}

// Component for the login form
function LoginForm() {
    const [email, setEmail] = useState("dadsdevteam@example.com");
    const [password, setPassword] = useState("dds2024");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            console.log("Attempting to sign in with:", email);

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("Sign in result:", result);

            if (result?.error) {
                setError("Invalid email or password");
                toast.error("Login failed. Please check your credentials.");
            } else {
                toast.success("Login successful!");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An error occurred during login");
            toast.error("Login failed. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Login to DDS Portal</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 items-center">
                        <p className="text-sm text-gray-500">
                            Using Laravel Sanctum authentication API
                        </p>
                        <p className="text-xs text-gray-400">
                            Default credentials: dadsdevteam@example.com / dds2024
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

// Main page component with proper suspense boundary
export default function LoginPage() {
    // We need to pass the error setter to SearchParamsHandler but don't need to use it here
    const [, setError] = useState("");

    return (
        <>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <p>Loading...</p>
                </div>
            }>
                <SearchParamsHandler onError={setError} />
            </Suspense>
            <LoginForm />
        </>
    );
} 