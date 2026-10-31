import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import WelcomeScreen from '../screens/welcomeScreen';
import Drawer from './drawer';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import CategoryScreen from '../screens/CategoryScreen';
import PlanningScreen from '../screens/PlanningScreen';
import FocusScreen from '../screens/FocusScreen';
import NotesScreen from '../screens/NotesScreen';
import GoalsScreen from '../screens/GoalsScreen';
import HabitsScreen from '../screens/HabitsScreen';
import {UniversalSearchScreen} from '../screens/UniversalSearchScreen';
import {AnalyticsScreen} from '../screens/AnalyticsScreen';
import {useTheme} from '../context/ThemeContext';

const Stack = createStackNavigator();

const Navigation = () => {
  const {theme, isDark} = useTheme();

  const navTheme = {
    dark: isDark,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.divider,
      notification: theme.danger,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: {backgroundColor: theme.background},
        }}>
        <Stack.Screen name="home" component={WelcomeScreen} />
        <Stack.Screen name="Drawer" component={Drawer} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
        <Stack.Screen name="PlanningScreen" component={PlanningScreen} />
        <Stack.Screen name="FocusScreen" component={FocusScreen} />
        <Stack.Screen name="NotesScreen" component={NotesScreen} />
        <Stack.Screen name="GoalsScreen" component={GoalsScreen} />
        <Stack.Screen name="HabitsScreen" component={HabitsScreen} />
        <Stack.Screen
          name="UniversalSearchScreen"
          component={UniversalSearchScreen}
        />
        <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default Navigation;
