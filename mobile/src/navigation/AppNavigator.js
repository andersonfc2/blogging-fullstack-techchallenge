import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/AdminScreen';
import PostReadScreen from '../screens/PostReadScreen';
import PostFormScreen from '../screens/PostFormScreen';
import TeacherListScreen from '../screens/TeacherListScreen';
import TeacherFormScreen from '../screens/TeacherFormScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isTeacher } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="Root"
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

        <Stack.Screen
          name="PostRead"
          component={PostReadScreen}
          options={{ title: 'Leitura da postagem' }}
        />

        {!isAuthenticated && (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Acesso à plataforma' }}
          />
        )}

        {isTeacher && (
          <Stack.Group>
            <Stack.Screen
              name="TeacherList"
              component={TeacherListScreen}
              options={{ title: 'Professores' }}
            />
            <Stack.Screen
              name="TeacherCreate"
              component={TeacherFormScreen}
              options={{ title: 'Cadastrar professor' }}
            />
            <Stack.Screen
              name="TeacherEdit"
              component={TeacherFormScreen}
              options={{ title: 'Editar professor' }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{ title: 'Administração' }}
            />
            <Stack.Screen
              name="PostCreate"
              component={PostFormScreen}
              options={{ title: 'Criar postagem' }}
            />
            <Stack.Screen
              name="PostEdit"
              component={PostFormScreen}
              options={{ title: 'Editar postagem' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
