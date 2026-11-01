import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './navigation/navigation';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import {TaskProvider} from './context/TaskContext';
import {PlanningProvider} from './context/PlanningContext';
import {NoteProvider} from './context/NoteContext';
import {GoalProvider} from './context/GoalContext';
import {HabitProvider} from './context/HabitContext';

const MainApp = () => {
  const {theme, isDark} = useTheme();

  return (
    <View style={[styles.mainContainer, {backgroundColor: theme.background}]}>
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
    <SafeAreaProvider>
      <ThemeProvider>
        <TaskProvider>
          <PlanningProvider>
            <NoteProvider>
              <GoalProvider>
                <HabitProvider>
                  <MainApp />
                </HabitProvider>
              </GoalProvider>
            </NoteProvider>
          </PlanningProvider>
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default App;
