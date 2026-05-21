import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const providers: Provider[] = []

const hasGoogleAuth =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET) &&
  process.env.AUTH_GOOGLE_ID !== 'your_google_client_id' &&
  process.env.AUTH_GOOGLE_SECRET !== 'your_google_client_secret'

if (hasGoogleAuth) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  )
}

if (
  process.env.NODE_ENV === 'development' &&
  process.env.AUTH_DEV_LOGIN_ENABLED !== 'false'
) {
  providers.push(
    Credentials({
      id: 'dev',
      name: '本地开发登录',
      credentials: {},
      async authorize() {
        return {
          id: 'dev-user',
          name: '本地开发用户',
          email: 'dev@vibeshot.local',
        }
      },
    })
  )
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers,
  pages: {
    signIn: '/',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? '')
      }
      return session
    },
    authorized({ auth }) {
      return !!auth
    },
  },
})
