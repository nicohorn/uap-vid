import type { User } from '@prisma/client'
import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User & DefaultSession['user']
    /**
     * Present while an admin is impersonating another user: identifies the
     * real admin behind the session. Absent on normal sessions.
     */
    impersonatedBy?: { id: string; name: string; email: string }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: User & DefaultSession['user']
    /**
     * The admin's own user while impersonating; restored on exit.
     */
    originalUser?: User & DefaultSession['user']
  }
}
