import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPostById } from '../services/api';

export default function PostReadScreen({ route }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      setLoading(true);
      setError('');
      setPost(null);
      try {
        const data = await getPostById(id, { signal: controller.signal });
        if (!controller.signal.aborted) setPost(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPost();
    return () => controller.abort();
  }, [id, attempt]);

  return (
    <ScrollView contentContainerStyle={[
      styles.container, { paddingBottom: insets.bottom + 24 },
    ]}>
      {loading ? (
        <View style={styles.status}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.statusText}>Carregando postagem...</Text>
        </View>
      ) : error ? (
        <View style={styles.status}>
          <Text style={styles.error} accessibilityRole="alert">{error}</Text>
          <Button title="Tentar novamente" onPress={() => setAttempt((value) => value + 1)} />
        </View>
      ) : post ? (
        <>
          <Text style={styles.title} accessibilityRole="header">{post.title}</Text>
          <Text style={styles.author}>Autor: {post.author}</Text>
          <Text style={styles.content} selectable>{post.content}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f8fafc' },
  title: { fontSize: 30, lineHeight: 38, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  author: { fontSize: 16, color: '#475569', marginBottom: 24 },
  content: { fontSize: 18, lineHeight: 30, color: '#1e293b' },
  status: { gap: 16, paddingVertical: 24 },
  statusText: { fontSize: 16, color: '#475569', textAlign: 'center' },
  error: { fontSize: 16, lineHeight: 24, color: '#b91c1c' },
});
