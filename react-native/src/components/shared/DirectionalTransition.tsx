import React, { useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useExternalEffect } from "../../hooks/effects";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useCedrosTheme } from "../../context/ThemeContext";

export interface DirectionalTransitionProps<State extends string> {
  stateKey: State;
  order: readonly State[];
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Shared-axis transition that safely retargets during rapid navigation. */
export function DirectionalTransition<State extends string>({
  stateKey,
  order,
  children,
  style,
  testID,
}: DirectionalTransitionProps<State>): React.ReactElement {
  const { motion } = useCedrosTheme();
  const reduceMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState({
    key: stateKey,
    content: children,
  });
  const [translateX] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));

  useExternalEffect(() => {
    if (displayed.key === stateKey) return;

    let active = true;
    const fromIndex = order.indexOf(displayed.key);
    const toIndex = order.indexOf(stateKey);
    const direction = toIndex >= fromIndex ? 1 : -1;

    translateX.stopAnimation();
    opacity.stopAnimation();

    if (reduceMotion) {
      translateX.setValue(0);
      opacity.setValue(1);
      setDisplayed({ key: stateKey, content: children });
      return;
    }

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: -direction * motion.distance,
        ...motion.springs.responsive,
        velocity: -direction * 0.5,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!active) return;
      translateX.setValue(direction * motion.distance);
      opacity.setValue(0);
      setDisplayed({ key: stateKey, content: children });
      requestAnimationFrame(() => {
        if (!active) return;
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            ...motion.springs.responsive,
            velocity: -direction * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 140,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    });

    return () => {
      active = false;
    };
  }, [
    children,
    displayed.key,
    motion.distance,
    motion.springs.responsive,
    opacity,
    order,
    reduceMotion,
    stateKey,
    translateX,
  ]);

  const content = displayed.key === stateKey ? children : displayed.content;

  return (
    <View style={style} testID={testID}>
      <Animated.View style={{ opacity, transform: [{ translateX }] }}>
        {content}
      </Animated.View>
    </View>
  );
}
