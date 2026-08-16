import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/useAuthStore';

export default function Index() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/(auth)/login'} />;
}
