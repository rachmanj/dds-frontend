"use client"

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            setError(errorParam === "CredentialsSignin"
                ? "Invalid email or password"
                : "An error occurred during login");
        }
    }, [searchParams]);

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
        <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl shadow-purple-900/20">
            <CardHeader className="space-y-1 pb-6">
                <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Login to DDS Portal</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-200">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
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
                            className="bg-zinc-800 border-zinc-700 text-white focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="bg-zinc-800 border-zinc-700 text-white focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 rounded-md transition-all duration-200 shadow-lg shadow-purple-900/30"
                        disabled={isLoading}
                    >
                        {isLoading ?
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </div>
                            : "Sign In"
                        }
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-center text-zinc-400 pt-0">
                <p className="text-sm">
                    Secured with Laravel Sanctum API
                </p>
                <div className="text-xs flex items-center gap-1">
                    <span>Demo credentials:</span>
                    <code className="px-1 py-0.5 rounded bg-zinc-800">dadsdevteam@example.com</code>
                    <span>/</span>
                    <code className="px-1 py-0.5 rounded bg-zinc-800">dds2024</code>
                </div>
            </CardFooter>
        </Card>
    );
}

export default LoginForm;
