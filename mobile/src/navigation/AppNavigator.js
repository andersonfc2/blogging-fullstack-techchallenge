import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isTeacher } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#0f172a',
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Blogging Educacional' }}
        />

        {!isAuthenticated && (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Acesso docente' }}
          />
        )}

        {isTeacher && (
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ title: 'Administração' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}