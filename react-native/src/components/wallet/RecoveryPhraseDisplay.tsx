import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  StyleProp,
  Clipboard,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Button } from "../shared/Button";

export interface RecoveryPhraseDisplayProps {
  phrase: string;
  onConfirm: () => void;
  title?: string;
  description?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RecoveryPhraseDisplay({
  phrase,
  onConfirm,
  title = "Save Your Recovery Phrase",
  description = "Write down these 12 words in order and keep them safe. This is the only way to recover your wallet if you lose access.",
  containerStyle,
  testID = "recovery-phrase-display",
}: RecoveryPhraseDisplayProps): React.ReactElement {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const words = phrase.split(" ");

  const handleCopy = () => {
    Clipboard.setString(phrase);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirm = () => {
    if (hasConfirmed) {
      onConfirm();
    }
  };

  return (
    <ScrollView
      style={[{ flex: 1 }, containerStyle]}
      contentContainerStyle={{ padding: spacing.lg }}
      testID={testID}
    >
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes["2xl"],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
            marginBottom: spacing.md,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
          }}
        >
          {description}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.warning + "10",
          borderWidth: 1,
          borderColor: colors.warning,
          borderRadius: 8,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.warning,
            fontWeight: typography.weights.medium,
          }}
        >
          &#9888; Never share this phrase with anyone. Anyone with access to
          these words can access your funds.
        </Text>
      </View>

      {!isRevealed ? (
        <TouchableOpacity
          onPress={() => setIsRevealed(true)}
          style={{
            backgroundColor: colors.gray[100],
            borderRadius: 12,
            padding: spacing.xl,
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: 48,
              marginBottom: spacing.md,
            }}
          >
            &#128065;
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              fontWeight: typography.weights.medium,
            }}
          >
            Tap to reveal recovery phrase
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <View
            style={{
              backgroundColor: colors.gray[900],
              borderRadius: 12,
              padding: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
              }}
            >
              {words.map((word, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.gray[800],
                    borderRadius: 8,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    minWidth: 100,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      color: colors.gray[500],
                      fontWeight: typography.weights.medium,
                    }}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.sizes.base,
                      color: colors.white,
                      fontWeight: typography.weights.medium,
                      fontFamily: "monospace",
                    }}
                  >
                    {word}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Button
            title={isCopied ? "Copied!" : "Copy to Clipboard"}
            onPress={handleCopy}
            variant={isCopied ? "secondary" : "outline"}
            size="md"
          />
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          marginBottom: spacing.lg,
          padding: spacing.md,
          backgroundColor: colors.gray[50],
          borderRadius: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setHasConfirmed(!hasConfirmed)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: hasConfirmed ? colors.primary[600] : colors.gray[400],
            backgroundColor: hasConfirmed
              ? colors.primary[600]
              : colors.transparent,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {hasConfirmed && (
            <Text style={{ color: colors.white, fontSize: 14 }}>&#10003;</Text>
          )}
        </TouchableOpacity>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[700],
            flex: 1,
          }}
        >
          I have written down my recovery phrase and stored it in a secure
          location
        </Text>
      </View>

      <Button
        title="I've Saved My Recovery Phrase"
        onPress={handleConfirm}
        variant="primary"
        size="lg"
        disabled={!hasConfirmed || !isRevealed}
      />
    </ScrollView>
  );
}
