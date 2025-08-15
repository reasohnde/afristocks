// src/screens/main/NotificationsScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';
import { theme } from '@/styles/theme';

interface Props {
    navigation: any;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
}

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
    const notifications: Notification[] = [
        {
            id: 1,
            title: 'Investissement confirmé',
            message: 'Votre investissement dans TechStart a été confirmé.',
            time: 'Il y a 2h',
            type: 'success',
            read: false,
        },
        {
            id: 2,
            title: 'Nouvelle startup disponible',
            message: 'FinTech Solutions est maintenant disponible pour investissement.',
            time: 'Il y a 4h',
            type: 'info',
            read: true,
        },
        {
            id: 3,
            title: 'Mise à jour du portfolio',
            message: 'Votre portfolio a été mis à jour avec les dernières données.',
            time: 'Il y a 1j',
            type: 'info',
            read: true,
        },
    ];

    const getIconName = (type: string) => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'warning';
            case 'error': return 'close-circle';
            default: return 'information-circle';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return '#10B981';
            case 'warning': return '#F59E0B';
            case 'error': return '#EF4444';
            default: return '#3B82F6';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={styles.clearButton}>
                    <Text style={styles.clearText}>Tout marquer</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off" size={64} color={theme.colors.text.tertiary} />
                        <Text style={styles.emptyTitle}>Aucune notification</Text>
                        <Text style={styles.emptySubtitle}>Vous n'avez pas de nouvelles notifications</Text>
                    </View>
                ) : (
                    notifications.map((notification) => (
                        <TouchableOpacity key={notification.id}>
                            <GlassContainer style={[
                                styles.notificationCard,
                                !notification.read && styles.unreadCard
                            ]}>
                                <View style={styles.notificationIcon}>
                                    <Ionicons
                                        name={getIconName(notification.type) as any}
                                        size={24}
                                        color={getIconColor(notification.type)}
                                    />
                                </View>
                                <View style={styles.notificationContent}>
                                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                                    <Text style={styles.notificationTime}>{notification.time}</Text>
                                </View>
                                {!notification.read && <View style={styles.unreadDot} />}
                            </GlassContainer>
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: theme.spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    clearButton: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    clearText: {
        fontSize: 14,
        color: theme.colors.primary.orange,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginTop: theme.spacing.lg,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.sm,
    },
    notificationCard: {
        flexDirection: 'row',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
    },
    unreadCard: {
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary.orange,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    notificationTime: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary.orange,
        marginLeft: theme.spacing.sm,
    },
});

export default NotificationsScreen; 