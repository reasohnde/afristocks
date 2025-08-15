import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text testID="welcome-text" style={styles.title}>
        Bienvenue sur AfriStocks
      </Text>
      <Text testID="subtitle" style={styles.subtitle}>
        Votre plateforme d'investissement
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
