import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import DrawerComponent from '../modules/DrawerComponent';
import FunctionScreen from '../screens/FunctionScreen';
import PlanningScreen from '../screens/PlanningScreen';
import FocusScreen from '../screens/FocusScreen';
import NotesScreen from '../screens/NotesScreen';
import GoalsScreen from '../screens/GoalsScreen';
import HabitsScreen from '../screens/HabitsScreen';
import {UniversalSearchScreen} from '../screens/UniversalSearchScreen';
import {AnalyticsScreen} from '../screens/AnalyticsScreen';
import WelcomeScreen from '../screens/welcomeScreen';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

const DrawerNav = createDrawerNavigator();

const Drawer = () => {
  const {theme} = useTheme();

  return (
    <View style={[styles.mainContainer, {backgroundColor: theme.background}]}>
      <DrawerNav.Navigator
        initialRouteName="FunctionScreen"
        drawerContent={props => <DrawerComponent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: theme.primaryLight,
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: theme.textSecondary,
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 10,
            marginVertical: 3,
            paddingHorizontal: 6,
          },
          drawerLabelStyle: {
            marginLeft: -8,
            fontSize: 14,
            fontFamily: fontFamily.medium,
          },
          drawerStyle: {
            backgroundColor: theme.background,
            width: 290,
          },
        }}>
        <DrawerNav.Screen
          name="FunctionScreen"
          component={FunctionScreen}
          options={{
            title: 'Tasks',
            drawerIcon: ({color, size}) => (
              <Feather name="check-square" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="UniversalSearchScreen"
          component={UniversalSearchScreen}
          options={{
            title: 'Search',
            drawerIcon: ({color, size}) => (
              <Feather name="search" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="AnalyticsScreen"
          component={AnalyticsScreen}
          options={{
            title: 'Analytics & Insights',
            drawerIcon: ({color, size}) => (
              <Feather name="bar-chart-2" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="PlanningScreen"
          component={PlanningScreen}
          options={{
            title: 'Daily Planning',
            drawerIcon: ({color, size}) => (
              <Feather name="calendar" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="FocusScreen"
          component={FocusScreen}
          options={{
            title: 'Focus Mode',
            drawerIcon: ({color, size}) => (
              <Feather name="clock" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="NotesScreen"
          component={NotesScreen}
          options={{
            title: 'Notes & Knowledge',
            drawerIcon: ({color, size}) => (
              <Feather name="file-text" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="GoalsScreen"
          component={GoalsScreen}
          options={{
            title: 'Goals & Targets',
            drawerIcon: ({color, size}) => (
              <Feather name="target" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="HabitsScreen"
          component={HabitsScreen}
          options={{
            title: 'Habits & Rituals',
            drawerIcon: ({color, size}) => (
              <Feather name="zap" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="Profile"
          component={Profile}
          options={{
            title: 'Profile',
            drawerIcon: ({color, size}) => (
              <Feather name="user" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="Settings"
          component={Settings}
          options={{
            title: 'Settings & Sync',
            drawerIcon: ({color, size}) => (
              <Feather name="settings" size={size || 18} color={color} />
            ),
          }}
        />
        <DrawerNav.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{
            title: 'Welcome Tour',
            drawerIcon: ({color, size}) => (
              <Feather name="compass" size={size || 18} color={color} />
            ),
          }}
        />
      </DrawerNav.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default Drawer;
