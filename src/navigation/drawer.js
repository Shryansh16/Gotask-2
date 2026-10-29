import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import DrawerComponent from '../modules/DrawerComponent';
import FunctionScreen from '../screens/FunctionScreen';
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
