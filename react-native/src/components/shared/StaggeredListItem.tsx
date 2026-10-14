import React, { useState, type ReactNode } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";
import { useCedrosTheme } from "../../context/ThemeContext";
import { useExternalEffect } from "../../hooks/effects";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface StaggeredListItemProps {
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function StaggeredListItem({
  index,
  children,
  style,
}: StaggeredListItemProps): React.ReactElement {
  const { motion } = useCedrosTheme();
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useExternalEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.spring(progress, {
      toValue: 1,
      ...motion.springs.settle,
      delay: Math.min(index, 4) * motion.staggerMs,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [index, motion.springs.settle, motion.staggerMs, progress, reduceMotion]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
