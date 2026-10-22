import { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { deletePost, getPosts } from '../services/api';

export default function AdminScreen({ navigation }) {
  const { teacher, token, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const deletionLock = useRef(false);
  const active = useRef(false);

  useEffect(() => {
    if (!isFocused) return;
    active.current = true;
    if (!deletionLock.current) setDeletingId(null);
    const controller = new AbortController();

    async function loadPosts() {
      setLoading(true);
      setError('');
      try {
        const data = await getPosts({ signal: controller.signal });
        if (!controller.signal.aborted) setPosts(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPosts();
    return () => {
      active.current = false;
      controller.abort();
    };
  }, [attempt, isFocused]);

  async function removePost(id) {
    if (!active.current) {
      deletionLock.current = false;
      return;
    }

    setDeletingId(id);
    setError('');
    try {
      await deletePost(id, token);
      if (active.current) {
        setPosts((current) => current.filter((post) => post.id !== id));
      }
    } catch (err) {
      if (!active.current) return;
      if (err.status === 401) {
        Alert.alert('Sessão encerrada', 'Faça login novamente para continuar.');
        logout();
      } else {
        setError(err.message);
      }
    } finally {
      deletionLock.current = false;
      if (active.current) setDeletingId(null);
    }
  }

  function confirmDeletion(post) {
    if (deletionLock.current) return;
    deletionLock.current = true;
    Alert.alert(
      'Excluir postagem',
      `Deseja excluir “${post.title}”? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => { deletionLock.current = false; } },
        { text: 'Excluir', style: 'destructive', onPress: () => removePost(post.id) },
      ],
      { cancelable: false }
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Gerenciar postagens</Text>
        <Text style={styles.description}>Professor: {teacher?.name}</Text>
        <Button
          title="Criar postagem"
          onPress={() => navigation.navigate('PostCreate')}
          disabled={deletingId !== null}
        />
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              title="Atualizar lista"
              onPress={() => setAttempt((value) => value + 1)}
              disabled={loading || deletingId !== null}
            />
          </View>
          <View style={styles.action}>
            <Button title="Sair" onPress={logout} disabled={deletingId !== null} />
          </View>
        </View>
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      </View>

      {loading ? (
        <View style={styles.status}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.description}>Carregando posts...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={posts}
          keyExtractor={(post) => String(post.id)}
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
          ListEmptyComponent={
            <Text style={styles.description}>
              {error ? 'Use Atualizar lista para tentar novamente.' : 'Nenhuma postagem cadastrada.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.description}>Autor: {item.author}</Text>
              <View style={styles.actions}>
                <View style={styles.action}>
                  <Button
                    title="Editar"
                    accessibilityLabel={`Editar postagem ${item.title}`}
                    onPress={() => navigation.navigate('PostEdit', { id: item.id })}
                    disabled={deletingId !== null}
                  />
                </View>
                <View style={styles.action}>
                  <Button
                    title={deletingId === item.id ? 'Excluindo...' : 'Excluir'}
                    accessibilityLabel={`Excluir postagem ${item.title}`}
                    color="#b91c1c"
                    onPress={() => confirmDeletion(item)}
                    disabled={deletingId !== null}
                  />
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  toolbar: { padding: 24, gap: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
  list: { flex: 1 },
  container: { flexGrow: 1, padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0f172a' },
  description: { fontSize: 16, lineHeight: 24, color: '#475569' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
  card: { padding: 18, gap: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontSize: 21, fontWeight: 'bold', color: '#0f172a' },
  status: { padding: 24, gap: 16, alignItems: 'center' },
  error: { fontSize: 16, lineHeight: 24, color: '#b91c1c' },
});
