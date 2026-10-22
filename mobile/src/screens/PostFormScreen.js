import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Button, Keyboard, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { createPost, getPostById, updatePost } from '../services/api';

export default function PostFormScreen({ navigation, route }) {
  const editing = route.name === 'PostEdit';
  const id = route.params?.id;
  const { teacher, token, isTeacher, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ title: '', content: '', author: teacher?.name || '' });
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

    async function loadPost() {
      setLoading(true);
      setLoadError('');
      try {
        const post = await getPostById(id, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setForm({ title: post.title, content: post.content, author: post.author || '' });
        }
      } catch (err) {
        if (!controller.signal.aborted) setLoadError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPost();
    return () => controller.abort();
  }, [editing, id, attempt]);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (submitting.current) return;
    Keyboard.dismiss();
    setError('');
    const data = {
      title: form.title.trim(),
      content: form.content.trim(),
      author: form.author.trim(),
    };

    if (!data.title || !data.content || !data.author) {
      setError('Preencha título, conteúdo e autor.');
      return;
    }
    if (!isTeacher) {
      setError('Apenas professores podem publicar ou editar postagens.');
      return;
    }

    submitting.current = true;
    setSaving(true);
    try {
      if (editing) {
        await updatePost(id, data, token);
      } else {
        await createPost(data, token);
      }
      if (mounted.current) navigation.goBack();
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
            <Text style={styles.description}>Carregando postagem...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.status}>
            <Text style={styles.error} accessibilityRole="alert">{loadError}</Text>
            <Button title="Tentar novamente" onPress={() => setAttempt((value) => value + 1)} />
          </View>
        ) : (
          <>
            <Text style={styles.title}>{editing ? 'Editar postagem' : 'Criar postagem'}</Text>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => change('title', value)}
              placeholder="Título da postagem"
              placeholderTextColor="#64748b"
              accessibilityLabel="Título da postagem"
              maxLength={255}
              editable={!saving}
            />
            <Text style={styles.label}>Conteúdo</Text>
            <TextInput
              style={[styles.input, styles.content]}
              value={form.content}
              onChangeText={(value) => change('content', value)}
              placeholder="Escreva o conteúdo completo"
              placeholderTextColor="#64748b"
              accessibilityLabel="Conteúdo da postagem"
              multiline
              textAlignVertical="top"
              editable={!saving}
            />
            <Text style={styles.label}>Autor</Text>
            <TextInput
              style={styles.input}
              value={form.author}
              onChangeText={(value) => change('author', value)}
              placeholder="Nome do autor"
              placeholderTextColor="#64748b"
              accessibilityLabel="Autor da postagem"
              maxLength={255}
              editable={!saving}
            />
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <View style={styles.actions}>
              <Button
                title={saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Publicar postagem'}
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
  input: {
    padding: 14, fontSize: 16, color: '#0f172a', backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: '#94a3b8', borderRadius: 8, marginBottom: 20,
  },
  content: { minHeight: 180 },
  actions: { gap: 16 },
  status: { gap: 16, paddingVertical: 24 },
  description: { fontSize: 16, color: '#475569', textAlign: 'center' },
  error: { fontSize: 16, lineHeight: 24, color: '#b91c1c', marginBottom: 16 },
});
