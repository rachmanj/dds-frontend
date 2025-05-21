import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import api from "@/lib/axios";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Get CSRF token
          await api.get("/sanctum/csrf-cookie");

          // Attempt to log in
          const response = await api.post("/api/login", {
            email: credentials?.email,
            password: credentials?.password,
          });

          // If login was successful, return user data from the login response
          if (response.status === 200 && response.data) {
            console.log("Login successful, user data:", response.data);

            // Check if we have user data in the login response
            if (response.data.user) {
              return {
                id: response.data.user.id.toString(),
                name: response.data.user.name,
                email: response.data.user.email,
                role: response.data.user.role || "user",
              };
            }

            // If no user data in login response, try to get it separately
            try {
              const userData = await api.get("/api/user");

              if (userData.data && userData.data.user) {
                return {
                  id: userData.data.user.id.toString(),
                  name: userData.data.user.name,
                  email: userData.data.user.email,
                  role: userData.data.user.role || "user",
                };
              }
            } catch (userError) {
              console.error("Error fetching user data:", userError);
              // Continue with minimal user info if we can't get full details
            }

            // Fallback with minimal user info from credentials
            return {
              id: "1", // Fallback ID
              name: credentials?.email?.split("@")[0] || "User", // Use email username as name
              email: credentials?.email || "",
              role: "user",
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      // Add the user's ID and role to the session
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist the user's ID and role to the token
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
