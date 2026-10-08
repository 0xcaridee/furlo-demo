import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen, router } from 'expo-router';
import { StorageService } from '@/utils/storage';
import { AuthService } from '@/services/authService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded || fontError) {
        try {
          // Check authentication status
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          
          if (!currentUser) {
            // User not authenticated - go to login
            router.replace('/(auth)/login');
            return;
          }

          // Check if user has completed onboarding
          const hasCompletedOnboarding = await StorageService.getHasCompletedOnboarding();
          
          if (!hasCompletedOnboarding) {
            // First time user - go to onboarding
            router.replace('/(onboarding)');
          } else {
            // Returning user - go to main app
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('Error during app initialization:', error);
          // Default to login if there's an error
          router.replace('/(auth)/login');
        } finally {
          setIsReady(true);
          SplashScreen.hideAsync();
        }
      }
    }
    
    prepare();

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription?.unsubscribe();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError && !isReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}