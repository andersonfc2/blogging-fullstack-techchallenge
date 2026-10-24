import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Button, Keyboard, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { createTeacher, getTeacherById, updateTeacher } from '../services/api';

export default function TeacherFormScreen({ navigation, route }) {
  const editing = route.name === 'TeacherEdit';
  const id = route.params?.id;
  const { token, isTeacher, logout, updateTeacher: updateSessionTeacher } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!editing) return;
    const controller = new AbortController();

    async function loadTeacher() {
      setLoading(true);
      setLoadError('');
      try {
        const teacher = await getTeacherById(id, token, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setForm({ name: teacher.name, email: teacher.email, password: '' });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err.status === 401) {
          Alert.alert('Sessão encerrada', 'Faça login novamente para continuar.');
          logout();
        } else {
          setLoadError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadTeacher();
    return () => controller.abort();
  }, [editing, id, attempt, token, logout]);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (submitting.current) return;
    Keyboard.dismiss();
    setError('');
    const data = { name: form.name.trim(), email: form.email.trim().toLowerCase() };

    if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('Informe o nome e um email válido.');
      return;
    }
    if ((!editing || form.password !== '') && (form.password.length < 6 || !form.password.trim())) {
      setError('Informe uma senha com pelo menos 6 caracteres.');
      return;
    }
    if (!isTeacher) {
      setError('Apenas professores podem gerenciar docentes.');
      return;
    }
    const payload = form.password ? { ...data, password: form.password } : data;

    submitting.current = true;
    setSaving(true);
    try {
      const teacher = editing
        ? await updateTeacher(id, payload, token)
        : await createTeacher(payload, token);
      if (!mounted.current) return;
      if (editing) updateSessionTeacher(teacher);
      setForm((current) => ({ ...current, password: '' }));
      navigation.goBack();
      Alert.alert('Cadastro salvo', editing ? 'Professor atualizado com sucesso.' : 'Professor cadastrado com sucesso.');
    } catch (err) {
      if (!mounted.current) return;
      if (err.status === 401) {
        Alert.alert('Sessão encerrada', 'Faça login novamente para continuar.');
        logout();
      } else {
        setError(err.message);
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.status}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.description}>Carregando professor...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.status}>
            <Text style={styles.error} accessibilityRole="alert">{loadError}</Text>
            <Button title="Tentar novamente" onPress={() => setAttempt((value) => value + 1)} />
          </View>
        ) : (
          <>
            <Text style={styles.title}>{editing ? 'Editar professor' : 'Cadastrar professor'}</Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(value) => change('name', value)}
              placeholder="Nome do professor"
              placeholderTextColor="#64748b"
              accessibilityLabel="Nome do professor"
              maxLength={255}
              editable={!saving}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(value) => change('email', value)}
              placeholder="professor@exemplo.com"
              placeholderTextColor="#64748b"
              accessibilityLabel="Email do professor"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={255}
              editable={!saving}
            />
            <Text style={styles.label}>{editing ? 'Nova senha (opcional)' : 'Senha'}</Text>
            <Text style={styles.help}>
              {editing ? 'Deixe em branco para manter a senha atual.' : 'Use pelo menos 6 caracteres.'}
            </Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(value) => change('password', value)}
              placeholder={editing ? 'Nova senha' : 'Senha do professor'}
              placeholderTextColor="#64748b"
              accessibilityLabel={editing ? 'Nova senha opcional' : 'Senha do professor'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!saving}
            />
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <View style={styles.actions}>
              <Button
                title={saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar professor'}
                onPress={save}
                disabled={saving}
              />
              <Button title="Cancelar" onPress={() => navigation.goBack()} disabled={saving} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flexGrow: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  input: { padding: 14, fontSize: 16, color: '#0f172a', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#94a3b8', borderRadius: 8, marginBottom: 20 },
  help: { fontSize: 14, lineHeight: 20, color: '#475569', marginBottom: 8 },
  actions: { gap: 16 },
  status: { gap: 16, paddingVertical: 24 },
  description: { fontSize: 16, color: '#475569', textAlign: 'center' },
  error: { fontSize: 16, lineHeight: 24, color: '#b91c1c', marginBottom: 16 },
});
