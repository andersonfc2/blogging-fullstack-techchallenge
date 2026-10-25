import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState } from 'react-native';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(null);

  function login(data) {
    const user = data.teacher || data.student;
    if (
      !data.token ||
      !user ||
      !['teacher', 'student'].includes(user.role) ||
      !Number.isFinite(data.expiresAt) ||
      data.expiresAt <= Date.now()
    ) {
      throw new Error('Sessão inválida. Faça login novamente.');
    }

    setAuthData({
      token: data.token,
      user,
      expiresAt: data.expiresAt,
    });
  }

  const logout = useCallback(() => {
    setAuthData(null);
  }, []);

  const updateTeacher = useCallback((teacher) => {
    setAuthData((current) => {
      if (!current || current.user.role !== 'teacher' || Number(current.user.id) !== Number(teacher.id)) return current;
      return {
        ...current,
        user: { ...current.user, name: teacher.name, email: teacher.email },
      };
    });
  }, []);

  useEffect(() => {
    if (!authData) return;

    function checkExpiration() {
      if (Date.now() >= authData.expiresAt) {
        setAuthData(null);
      }
    }

    const timeout = setTimeout(
      checkExpiration,
      Math.max(0, authData.expiresAt - Date.now())
    );

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkExpiration();
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [authData]);

  return (
    <AuthContext.Provider
      value={{
        token: authData?.token,
        user: authData?.user,
        teacher: authData?.user.role === 'teacher' ? authData.user : undefined,
        student: authData?.user.role === 'student' ? authData.user : undefined,
        isAuthenticated: Boolean(authData?.token),
        isTeacher: Boolean(
          authData?.token && authData?.user.role === 'teacher'
        ),
        isStudent: Boolean(authData?.token && authData?.user.role === 'student'),
        login,
        logout,
        updateTeacher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
