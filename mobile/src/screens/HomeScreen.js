import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator, Button, FlatList, Keyboard, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { searchPostsByTerm } from '../services/api';

export default function HomeScreen({ navigation }) {
  const { teacher, isAuthenticated, isTeacher, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState({ term: '' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setLoading(true);
      setError('');
      setPosts([]);
      try {
        const data = await searchPostsByTerm(query.term, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setPosts(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPosts();
    return () => controller.abort();
  }, [query]));

  function search() {
    Keyboard.dismiss();
    setQuery({ term: searchTerm.trim() });
  }

  function clearSearch() {
    Keyboard.dismiss();
    setSearchTerm('');
    setQuery({ term: '' });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.session}>
        {isAuthenticated ? (
          <>
            <Text style={styles.author}>Olá, {teacher?.name}!</Text>
            <View style={styles.sessionActions}>
              {isTeacher && (
                <View style={styles.action}>
                  <Button
                    title="Administração"
                    onPress={() => {
                      Keyboard.dismiss();
                      navigation.navigate('Admin');
                    }}
                  />
                </View>
              )}
              <View style={styles.action}>
                <Button
                  title="Sair"
                  onPress={() => {
                    Keyboard.dismiss();
                    logout();
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <Button
            title="Login professor"
            onPress={() => navigation.navigate('Login')}
          />
        )}
      </View>
    <FlatList
      style={styles.list}
      data={posts}
      keyExtractor={(post) => String(post.id)}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <View>
          <Text style={styles.label}>Tech Challenge — Fase 4</Text>
          <Text style={styles.title}>Blogging Educacional</Text>
          <Text style={styles.description}>
            Conteúdos de professores para apoiar o aprendizado dos estudantes.
          </Text>

          <Text style={styles.searchLabel}>Buscar posts</Text>
          <TextInput
            style={styles.input}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Buscar por título ou conteúdo"
            placeholderTextColor="#64748b"
            accessibilityLabel="Buscar posts por título ou conteúdo"
            returnKeyType="search"
            onSubmitEditing={search}
          />
          <View style={styles.searchActions}>
            <View style={styles.action}><Button title="Buscar" onPress={search} /></View>
            <View style={styles.action}><Button title="Limpar busca" onPress={clearSearch} /></View>
          </View>

          <Text style={styles.sectionTitle}>Postagens</Text>
          {!loading && !error && posts.length > 0 && (
            <Text style={styles.resultCount} accessibilityLiveRegion="polite">
              {query.term ? `Resultados para “${query.term}”: ` : 'Total: '}
              {posts.length}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.status}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.statusText}>Carregando posts...</Text>
            </>
          ) : error ? (
            <>
              <Text style={styles.error} accessibilityRole="alert">{error}</Text>
              <Button title="Tentar novamente" onPress={() => setQuery({ term: query.term })} />
            </>
          ) : (
            <Text style={styles.statusText} accessibilityLiveRegion="polite">
              {query.term
                ? 'Nenhum post encontrado para essa busca.'
                : 'Nenhuma postagem cadastrada.'}
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate('PostRead', { id: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`Ler post: ${item.title}. Autor: ${item.author}`}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.author}>Autor: {item.author}</Text>
          <Text style={styles.summary} numberOfLines={3}>
            {item.content.replace(/\s+/g, ' ').trim()}
          </Text>
          <Text style={styles.readLink}>Ler post completo</Text>
        </Pressable>
      )}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  list: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: '#475569',
    marginBottom: 24,
  },
  session: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  sessionActions: { flexDirection: 'row', gap: 12 },
  searchLabel: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  input: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#94a3b8',
    borderRadius: 8, padding: 14, fontSize: 16, color: '#0f172a', marginBottom: 12,
  },
  searchActions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  action: { flex: 1 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  resultCount: { fontSize: 14, color: '#475569', marginBottom: 16 },
  status: { paddingVertical: 24, gap: 16 },
  statusText: { fontSize: 16, lineHeight: 24, color: '#475569', textAlign: 'center' },
  error: { fontSize: 16, lineHeight: 24, color: '#b91c1c' },
  card: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 12, padding: 18, marginBottom: 16,
  },
  cardPressed: { backgroundColor: '#eff6ff' },
  cardTitle: { fontSize: 21, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  author: { fontSize: 15, color: '#475569' },
  summary: { fontSize: 16, lineHeight: 24, color: '#334155', marginTop: 12 },
  readLink: { fontSize: 16, fontWeight: '600', color: '#2563eb', marginTop: 16 },
});
