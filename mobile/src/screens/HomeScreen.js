import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tech Challenge — Fase 4</Text>

      <Text style={styles.title}>Blogging Educacional</Text>

      <Text style={styles.description}>
        Conteúdos de professores para apoiar o aprendizado dos estudantes.
      </Text>

      <Button
        title="Login professor"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});