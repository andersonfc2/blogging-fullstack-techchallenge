import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';

export default function AdminScreen() {
  const { teacher, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administração</Text>

      <Text style={styles.description}>
        Professor: {teacher?.name}
      </Text>

      <Button title="Sair" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 24,
  },
});