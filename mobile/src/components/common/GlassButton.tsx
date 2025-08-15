// src/components/common/GlassButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../../styles/theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 14, paddingHorizontal: 24 },
    large: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = {
    small: { fontSize: 14 },
    medium: { fontSize: 16 },
    large: { fontSize: 18 },
  };

  const gradientColors = {
    primary: theme.colors.primary.gradient as [string, string],
    secondary: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as [string, string],
    glass: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'] as [string, string],
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              textSizes[size],
              variant === 'glass' && styles.glassText,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
      activeOpacity={1}
    >
      {variant === 'glass' ? (
        <View
          style={[
            styles.button,
            sizeStyles[size],
            styles.glassButton,
            disabled && styles.disabled,
          ]}
        >
          {buttonContent}
        </View>
      ) : (
        <LinearGradient
          colors={gradientColors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            sizeStyles[size],
            disabled && styles.disabled,
          ]}
        >
          {buttonContent}
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  glassButton: {
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    backgroundColor: theme.colors.glass.medium,
  },
  text: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  glassText: {
    color: theme.colors.text.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  icon: {
    marginRight: 8,
  },
});