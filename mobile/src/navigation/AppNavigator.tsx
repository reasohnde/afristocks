// src/navigation/AppNavigator.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

// 🛡️ Fallback safe access avec la nouvelle palette
const glassMediumColor = theme?.colors?.glass?.medium ?? 'rgba(255, 255, 255, 0.05)';
const tabBarBackground = theme?.colors?.background?.primary ?? '#0F172A';
const activeTint = theme?.colors?.primary?.emerald ?? '#10B981';
const inactiveTint = theme?.colors?.text?.tertiary ?? '#9CA3AF';

// Import des écrans - Version cohérente
import AuthScreen from '../screens/auth/AuthScreen';
import HomeScreen from '../screens/main/HomeScreen';
import StartupsScreen from '../screens/main/StartupsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

// Écrans trading et portfolio
import TradingScreen from '../screens/trading/TradingScreen';
import PortfolioScreen from '../screens/portfolio/PortfolioScreen';

// Écrans startup et investissement
import StartupDetailScreen from '../screens/startup/StartupDetailScreen';
import StartupDashboardScreen from '../screens/startup/StartupDashboardScreen';
import InvestmentFundScreen from '../screens/startup/InvestmentFundScreen';
import InvestmentCheckoutScreen from '../screens/investment/InvestmentCheckoutScreen';

// Écrans admin
import FundAdminScreen from '../screens/admin/FundAdminScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

// Écrans d'apprentissage et autres
import {
  InvestmentGuideScreen,
  LearnTradingScreen,
  FormationsScreen,
  FormationDetailScreen,
  FAQScreen,
  // Écrans wallet
  DepositScreen,
  WithdrawScreen,
  // Écrans news
  AllNewsScreen,
  NewsDetailScreen,
  // Écrans profil
  PersonalInfoScreen,
  ChangePasswordScreen,
  EditProfileScreen,
  // Écrans support
  HelpCenterScreen,
  ReportBugScreen,
  // Écrans légaux
  TermsScreen,
  PrivacyScreen,
  AboutScreen,
} from '../screens/stubs';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: theme.colors.glass.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          position: 'absolute',
          elevation: 0,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Startups"
        component={StartupsScreen}
        options={{
          tabBarLabel: 'Startups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="rocket" size={size} color={color} />
          ),
        }}
      />
      {user?.role === 'STARTUP' ? (
        <Tab.Screen
          name="Dashboard"
          component={StartupDashboardScreen}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="Portfolio"
          component={PortfolioScreen}
          options={{
            tabBarLabel: 'Portfolio',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pie-chart" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Trading"
        component={TradingScreen}
        options={{
          tabBarLabel: 'Trading',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isLoggedIn ? (
        // Écrans d'authentification
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          {/* Navigation principale */}
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* Écrans Startup et Investissement */}
          <Stack.Screen name="StartupDetail" component={StartupDetailScreen} />
          <Stack.Screen name="StartupDashboard" component={StartupDashboardScreen} />
          <Stack.Screen name="InvestmentFund" component={InvestmentFundScreen} />
          <Stack.Screen name="InvestmentCheckout" component={InvestmentCheckoutScreen} />

          {/* Écrans Admin */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          {user?.role === 'ADMIN' && (
            <Stack.Screen name="FundAdmin" component={FundAdminScreen} />
          )}

          {/* Écrans d'apprentissage */}
          <Stack.Screen name="InvestmentGuide" component={InvestmentGuideScreen} />
          <Stack.Screen name="LearnTrading" component={LearnTradingScreen} />
          <Stack.Screen name="Formations" component={FormationsScreen} />
          <Stack.Screen name="FormationDetail" component={FormationDetailScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />

          {/* Écrans Wallet */}
          <Stack.Screen name="Deposit" component={DepositScreen} />
          <Stack.Screen name="Withdraw" component={WithdrawScreen} />

          {/* Écrans News */}
          <Stack.Screen name="AllNews" component={AllNewsScreen} />
          <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />

          {/* Écrans Notifications */}
          <Stack.Screen name="Notifications" component={NotificationsScreen} />

          {/* Écrans Profil */}
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />

          {/* Écrans Support */}
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="ReportBug" component={ReportBugScreen} />

          {/* Écrans Légaux */}
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};