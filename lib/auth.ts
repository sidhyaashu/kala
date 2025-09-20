import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (credentials?.password === "password" && credentials?.email) {
          return { id: "1", name: "Artisan", email: credentials.email as string };
        }
        return null; // ❌ triggers CredentialsSignin error
      },
    }),
  ],
  pages: {
    signIn: "/",   // where users go for login
    error: "/",    // ⬅️ redirect errors back to your landing page
  },
};

export default NextAuth(authOptions);
