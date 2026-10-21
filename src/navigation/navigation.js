import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import WelcomeScreen from '../screens/welcomeScreen';
import Drawer from './drawer';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import CategoryScreen from '../screens/CategoryScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

const Navigation = () => {
  const { theme, isDark } = useTheme();

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
          cardStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="home" component={WelcomeScreen} />
        <Stack.Screen name="Drawer" component={Drawer} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
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