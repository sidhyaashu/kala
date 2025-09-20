import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, but we will handle it in the form.
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // In a real app, you'd validate against a database.
        // For this MVP, we'll accept any email and 'password' as the password.
        if (credentials?.password === "password" && credentials?.email) {
          return { id: "1", name: "Artisan", email: credentials?.email as string };
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/", // The root page is our sign-in page
  },
});

