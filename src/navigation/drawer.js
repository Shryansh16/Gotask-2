import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import {StyleSheet, View} from 'react-native';
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
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';

const DrawerNav = createDrawerNavigator();

const Drawer = () => {
  const {theme, isDark} = useTheme();

  return (
    <View style={[styles.mainContainer, {backgroundColor: theme.background}]}>
      <DrawerNav.Navigator
        initialRouteName="FunctionScreen"
        drawerContent={props => <DrawerComponent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: theme.primary,
          drawerActiveTintColor: '#FFFFFF',
          drawerInactiveTintColor: theme.textSecondary,
          drawerLabelStyle: {
            marginLeft: 5,
            fontSize: textScale(14),
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
            title: '📋  Tasks Dashboard',
          }}
        />
        <DrawerNav.Screen
          name="UniversalSearchScreen"
          component={UniversalSearchScreen}
          options={{
            title: '🔍  Universal Search',
          }}
        />
        <DrawerNav.Screen
          name="AnalyticsScreen"
          component={AnalyticsScreen}
          options={{
            title: '📊  Analytics & Insights',
          }}
        />
        <DrawerNav.Screen
          name="PlanningScreen"
          component={PlanningScreen}
          options={{
            title: '📅  Daily Planning',
          }}
        />
        <DrawerNav.Screen
          name="FocusScreen"
          component={FocusScreen}
          options={{
            title: '🎯  Focus Mode',
          }}
        />
        <DrawerNav.Screen
          name="NotesScreen"
          component={NotesScreen}
          options={{
            title: '📝  Notes',
          }}
        />
        <DrawerNav.Screen
          name="GoalsScreen"
          component={GoalsScreen}
          options={{
            title: '🎯  Goals & Milestones',
          }}
        />
        <DrawerNav.Screen
          name="HabitsScreen"
          component={HabitsScreen}
          options={{
            title: '🔁  Habits & Routines',
          }}
        />
        <DrawerNav.Screen
          name="Profile"
          component={Profile}
          options={{
            title: '👤  User Profile',
          }}
        />
        <DrawerNav.Screen
          name="Settings"
          component={Settings}
          options={{
            title: '⚙️  Settings & Sync',
          }}
        />
        <DrawerNav.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{
            title: '🚀  Welcome Tour',
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
