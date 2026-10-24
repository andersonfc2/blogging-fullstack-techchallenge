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
    if (
      !data.token ||
      !data.teacher ||
      !Number.isFinite(data.expiresAt) ||
      data.expiresAt <= Date.now()
    ) {
      throw new Error('Sessão inválida. Faça login novamente.');
    }

    setAuthData({
      token: data.token,
      teacher: data.teacher,
      expiresAt: data.expiresAt,
    });
  }

  const logout = useCallback(() => {
    setAuthData(null);
  }, []);

  const updateTeacher = useCallback((teacher) => {
    setAuthData((current) => {
      if (!current || Number(current.teacher.id) !== Number(teacher.id)) return current;
      return {
        ...current,
        teacher: { ...current.teacher, name: teacher.name, email: teacher.email },
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
        teacher: authData?.teacher,
        isAuthenticated: Boolean(authData?.token),
        isTeacher: Boolean(
          authData?.token && authData?.teacher?.role === 'teacher'
        ),
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
