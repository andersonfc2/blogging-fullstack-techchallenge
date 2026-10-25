import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { loginStudent, loginTeacher } from '../services/api';

export default function LoginScreen({ route }) {
  const studentLogin = route.params?.role === 'student';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function handleLogin() {
    if (submitting.current) return;

    setError('');

    if (!email.trim() || !password) {
      setError('Informe email e senha.');
      return;
    }

    submitting.current = true;
    try {
      setLoading(true);

      const authenticate = studentLogin ? loginStudent : loginTeacher;
      const data = await authenticate({
        email: email.trim(),
        password,
      });

      if (!mounted.current) return;
      setPassword('');
      login(data);
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      submitting.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{studentLogin ? 'Login estudante' : 'Login professor'}</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        accessibilityLabel="Email"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        accessibilityLabel="Senha"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={loading ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 20,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 16,
  },
});
