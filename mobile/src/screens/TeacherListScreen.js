import { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { deleteTeacher, getTeachers } from '../services/api';

const PAGE_SIZE = 5;

export default function TeacherListScreen({ navigation }) {
  const { teacher, token, logout } = useAuth();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const deletionLock = useRef(false);
  const active = useRef(false);

  useEffect(() => {
    if (!isFocused) return;
    active.current = true;
    if (!deletionLock.current) setDeletingId(null);
    const controller = new AbortController();

    async function loadTeachers() {
      setLoading(true);
      setError('');
      let changingPage = false;
      try {
        const data = await getTeachers(token, { page, limit: PAGE_SIZE, signal: controller.signal });
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, data.totalPages);
        if (page > lastPage) {
          changingPage = true;
          setPage(lastPage);
          return;
        }
        setResult(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err.status === 401) {
          Alert.alert('Sessão encerrada', 'Faça login novamente para continuar.');
          logout();
        } else {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted && !changingPage) setLoading(false);
      }
    }

    loadTeachers();
    return () => {
      active.current = false;
      controller.abort();
    };
  }, [page, attempt, isFocused, token, logout]);

  async function removeTeacher(id) {
    if (!active.current) {
      deletionLock.current = false;
      return;
    }
    setDeletingId(id);
    setError('');
    try {
      await deleteTeacher(id, token);
      if (!active.current) return;
      if (Number(id) === Number(teacher.id)) {
        logout();
      } else {
        setAttempt((value) => value + 1);
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

  function confirmDeletion(item) {
    if (deletionLock.current) return;
    deletionLock.current = true;
    const self = Number(item.id) === Number(teacher.id);
    Alert.alert(
      'Excluir professor',
      `Deseja excluir “${item.name}”? Esta ação não pode ser desfeita.${self ? '\nAo excluir sua conta, sua sessão será encerrada.' : ''}`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => { deletionLock.current = false; } },
        { text: 'Excluir', style: 'destructive', onPress: () => removeTeacher(item.id) },
      ],
      { cancelable: false }
    );
  }

  const busy = loading || deletingId !== null;

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Gerenciar professores</Text>
        <Text style={styles.description}>Cadastre e atualize os docentes da plataforma.</Text>
        <Button
          title="Cadastrar professor"
          onPress={() => navigation.navigate('TeacherCreate')}
          disabled={deletingId !== null}
        />
        <Button title="Atualizar lista" onPress={() => setAttempt((value) => value + 1)} disabled={busy} />
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      </View>

      {loading ? (
        <View style={styles.status}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.description}>Carregando professores...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={error ? [] : result.items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.container}
          ListEmptyComponent={
            <Text style={styles.description}>
              {error ? 'Use Atualizar lista para tentar novamente.' : 'Nenhum professor cadastrado.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.email}</Text>
              {Number(item.id) === Number(teacher.id) && <Text style={styles.self}>Sua conta</Text>}
              <View style={styles.actions}>
                <View style={styles.action}>
                  <Button
                    title="Editar"
                    accessibilityLabel={`Editar professor ${item.name}`}
                    onPress={() => navigation.navigate('TeacherEdit', { id: item.id })}
                    disabled={busy}
                  />
                </View>
                <View style={styles.action}>
                  <Button
                    title={deletingId === item.id ? 'Excluindo...' : 'Excluir'}
                    accessibilityLabel={`Excluir professor ${item.name}`}
                    color="#b91c1c"
                    onPress={() => confirmDeletion(item)}
                    disabled={busy}
                  />
                </View>
              </View>
            </View>
          )}
        />
      )}

      <View style={[styles.pagination, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.description} accessibilityLiveRegion="polite">
          Página {page} de {Math.max(1, result.totalPages)} · Total: {result.total}
        </Text>
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button title="Anterior" onPress={() => setPage((value) => value - 1)} disabled={busy || Boolean(error) || page <= 1} />
          </View>
          <View style={styles.action}>
            <Button title="Próxima" onPress={() => setPage((value) => value + 1)} disabled={busy || Boolean(error) || page >= result.totalPages} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  toolbar: { padding: 24, gap: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0f172a' },
  description: { fontSize: 16, lineHeight: 24, color: '#475569' },
  list: { flex: 1 },
  container: { flexGrow: 1, padding: 24 },
  card: { padding: 18, gap: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 21, fontWeight: 'bold', color: '#0f172a' },
  self: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
  status: { flex: 1, padding: 24, gap: 16, alignItems: 'center' },
  pagination: { padding: 12, gap: 12, borderTopWidth: 1, borderTopColor: '#cbd5e1' },
  error: { fontSize: 16, lineHeight: 24, color: '#b91c1c' },
});
