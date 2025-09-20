import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real app, you'd validate against a database.
        // For this MVP, we'll accept any email and 'password' as the password.
        if (credentials?.password === "password" && credentials?.email) {
          return { id: "1", name: "Artisan User", email: credentials?.email as string }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
})