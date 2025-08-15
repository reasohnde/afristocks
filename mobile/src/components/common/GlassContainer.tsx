// src/components/common/GlassContainer.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'medium' | 'heavy' | 'liquid';
  animated?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  variant = 'medium',
  animated = false,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && variant === 'liquid') {
      // Animation simple sans Easing
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, variant, shimmerAnim]);

  const getBackgroundColor = () => {
    switch (variant) {
      case 'light':
        return theme.colors.glass.light;
      case 'heavy':
        return theme.colors.glass.heavy;
      case 'liquid':
        return theme.colors.glass.liquidMedium || theme.colors.glass.medium;
      default:
        return theme.colors.glass.medium;
    }
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: theme.colors.glass.border,
    },
    variant === 'liquid' && styles.liquidContainer,
    style,
  ];

  if (variant === 'liquid' && animated) {
    return (
      <Animated.View style={containerStyle}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.3, 0],
              }),
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 200],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', theme.colors.glass.shimmer || 'rgba(255, 255, 255, 0.25)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
        
        {children}
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  liquidContainer: {
    shadowColor: theme.colors.primary.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});