import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Navigation from './navigation/navigation';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';

const MainApp = () => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <Navigation />
    </View>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <TaskProvider>
        <MainApp />
      </TaskProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default App;