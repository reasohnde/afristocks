// src/styles/styles.ts
import { StyleSheet, Platform } from 'react-native';
import { theme } from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  // Auth Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.primary,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authLogo: {
    fontSize: 60,
    marginBottom: 10,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  authForm: {
    width: '100%',
  },
  input: {
    backgroundColor: theme.colors.glass.light,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    color: theme.colors.text.primary,
  },
  authButton: {
    backgroundColor: theme.colors.primary.emerald,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  switchAuthMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    color: theme.colors.primary.emerald,
    fontSize: 16,
  },
  // Main App Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  walletInfo: {
    alignItems: 'flex-end',
  },
  walletLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary.emerald,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  searchBar: {
    backgroundColor: theme.colors.glass.light,
    margin: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    color: theme.colors.text.primary,
  },
  // Startup Card Styles
  startupCard: {
    backgroundColor: theme.colors.glass.light,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  startupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  startupLogo: {
    fontSize: 40,
    marginRight: 15,
  },
  startupInfo: {
    flex: 1,
  },
  startupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  startupMeta: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  growthBadge: {
    backgroundColor: theme.colors.primary.emerald,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  growthText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  startupDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  startupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  // Portfolio Styles
  portfolioSummary: {
    backgroundColor: theme.colors.primary.emerald,
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  portfolioTitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  portfolioValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  portfolioReturn: {
    color: theme.colors.primary.gold,
    fontSize: 18,
    fontWeight: '600',
  },
  investmentCard: {
    backgroundColor: theme.colors.glass.light,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  investmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  returnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveReturn: {
    backgroundColor: `${theme.colors.status.success}20`,
    color: theme.colors.status.success,
  },
  negativeReturn: {
    backgroundColor: `${theme.colors.status.error}20`,
    color: theme.colors.status.error,
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investmentStat: {
    alignItems: 'center',
  },
  investmentLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  investmentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  // Wallet Styles
  walletCard: {
    backgroundColor: theme.colors.glass.light,
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  walletCardTitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  walletCardBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 20,
  },
  walletButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.glass.medium,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  walletButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  walletButtonText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  // Profile Styles
  profileCard: {
    backgroundColor: theme.colors.glass.light,
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: theme.colors.glass.light,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  menuItemIcon: {
    fontSize: 18,
    color: theme.colors.text.tertiary,
  },
  logoutText: {
    color: theme.colors.status.error,
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glass.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  activeNav: {
    color: theme.colors.primary.emerald,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  modalStartupInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalStartupLogo: {
    fontSize: 60,
    marginBottom: 10,
  },
  modalStartupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 5,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  investmentForm: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 10,
  },
  investmentInput: {
    backgroundColor: theme.colors.glass.light,
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  shareCalculation: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  investButton: {
    backgroundColor: theme.colors.primary.emerald,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  investButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default styles;