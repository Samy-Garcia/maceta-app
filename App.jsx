import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator.jsx';
import { AuthProvider } from './src/context/AuthContext.jsx';
import { CartProvider } from './src/context/CartContext.jsx';
import { ThemeProvider } from './src/theme/ThemeContext.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
