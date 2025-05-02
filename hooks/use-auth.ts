import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { db } from '@/lib/db';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const { data: session, status: nextAuthStatus } = useSession();
  const { isLoaded: isClerkLoaded, userId: clerkUserId } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (nextAuthStatus === 'loading' || !isClerkLoaded) {
        return;
      }

      const email = session?.user?.email;
      if (!email && !clerkUserId) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await db.profile.findFirst({
          where: {
            OR: [
              { email },
              { clerkId: clerkUserId }
            ]
          },
        });

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          });
          setIsAdmin(profile.role === 'ADMIN');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [session, nextAuthStatus, clerkUserId, isClerkLoaded]);

  return {
    user,
    isAdmin,
    isLoading: isLoading || nextAuthStatus === 'loading' || !isClerkLoaded,
  };
}; 