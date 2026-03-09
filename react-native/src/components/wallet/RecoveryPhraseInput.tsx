import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  StyleProp,
} from "react-native";
import {
  isValidWord,
  getWordSuggestions,
  parseMnemonicInput,
  isValidMnemonic,
  MNEMONIC_WORD_COUNT,
} from "../../crypto";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface RecoveryPhraseInputProps {
  /** Called when all 12 words are entered and valid */
  onComplete: (words: string[]) => void;
  /** Called when words change (partial input) */
  onChange?: (words: string[]) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RecoveryPhraseInput({
  onComplete,
  onChange,
  disabled = false,
  containerStyle,
  testID = "recovery-phrase-input",
}: RecoveryPhraseInputProps): React.ReactElement {
  const [words, setWords] = useState<string[]>(
    Array(MNEMONIC_WORD_COUNT).fill(""),
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const suggestions = useMemo(() => {
    if (focusedIndex === null) return [];
    const word = words[focusedIndex] || "";
    if (word.length < 2) return [];
    return getWordSuggestions(word, 5);
  }, [focusedIndex, words]);

  const wordStatuses = useMemo(() => {
    return words.map((w) => {
      if (!w) return "empty";
      if (isValidWord(w)) return "valid";
      return "invalid";
    });
  }, [words]);

  const isComplete = useMemo(() => {
    return (
      words.every((w) => w.length > 0 && isValidWord(w)) &&
      isValidMnemonic(words)
    );
  }, [words]);

  const updateWord = useCallback(
    (index: number, value: string) => {
      const newWords = [...words];
      newWords[index] = value.toLowerCase().trim();
      setWords(newWords);
      onChange?.(newWords);

      // Check if complete
      if (
        newWords.every((w) => w.length > 0 && isValidWord(w)) &&
        isValidMnemonic(newWords)
      ) {
        onComplete(newWords);
      }
    },
    [words, onChange, onComplete],
  );

  const handleSuggestionPress = useCallback(
    (word: string) => {
      if (focusedIndex === null) return;
      updateWord(focusedIndex, word);
      // Move to next empty input
      const nextEmpty = words.findIndex(
        (w, i) => i > focusedIndex && !w,
      );
      if (nextEmpty !== -1) {
        inputRefs.current[nextEmpty]?.focus();
      }
    },
    [focusedIndex, updateWord, words],
  );

  const handlePaste = useCallback(
    (text: string) => {
      const parsed = parseMnemonicInput(text);
      if (parsed.length === MNEMONIC_WORD_COUNT) {
        setWords(parsed);
        onChange?.(parsed);
        if (isValidMnemonic(parsed)) {
          onComplete(parsed);
        }
      }
    },
    [onChange, onComplete],
  );

  const getWordBorderColor = (index: number): string => {
    const status = wordStatuses[index];
    if (status === "valid") return colors.success;
    if (status === "invalid") return colors.error;
    if (focusedIndex === index) return colors.primary[600];
    return colors.gray[300];
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Text
        style={{
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.medium,
          color: colors.gray[700],
          marginBottom: spacing.sm,
        }}
      >
        Enter your 12-word recovery phrase
      </Text>

      {/* Word grid: 3 columns x 4 rows */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {words.map((word, index) => (
          <View
            key={index}
            style={{
              width: "31%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.gray[400],
                width: 20,
                textAlign: "right",
                marginRight: 4,
              }}
            >
              {index + 1}.
            </Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={word}
              onChangeText={(text) => {
                // Handle paste of full phrase
                if (text.includes(" ") || text.includes(",")) {
                  handlePaste(text);
                  return;
                }
                updateWord(index, text);
              }}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => {
                if (focusedIndex === index) setFocusedIndex(null);
              }}
              editable={!disabled}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: getWordBorderColor(index),
                borderRadius: 6,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                fontSize: typography.sizes.sm,
                color: colors.gray[900],
                backgroundColor: disabled ? colors.gray[100] : colors.white,
              }}
              testID={`${testID}-word-${index}`}
            />
          </View>
        ))}
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && focusedIndex !== null && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.sm }}
          contentContainerStyle={{ gap: spacing.xs }}
        >
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => handleSuggestionPress(suggestion)}
              style={{
                backgroundColor: colors.primary[50],
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.primary[200],
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.primary[700],
                }}
              >
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Status */}
      {isComplete && (
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.success,
            marginTop: spacing.sm,
          }}
        >
          Recovery phrase is valid
        </Text>
      )}
    </View>
  );
}
