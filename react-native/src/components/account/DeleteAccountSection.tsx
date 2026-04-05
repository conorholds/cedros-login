import React, { useCallback, useState } from "react";
import { Linking, Text, View, ViewStyle, StyleProp } from "react-native";
import { useCedrosTheme } from "../../context/ThemeContext";
import { useAccountDeletion } from "../../hooks/useAccountDeletion";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { Input } from "../shared/Input";

const DELETE_CONFIRM_TEXT = "DELETE";

export interface DeleteAccountSectionProps {
  onDeleted?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function DeleteAccountSection({
  onDeleted,
  style,
  testID = "delete-account-section",
}: DeleteAccountSectionProps): React.ReactElement {
  const { colors, spacing, typography } = useCedrosTheme();
  const { deleteAccount, accountDeletionUrl, isLoading, error, clearError } =
    useAccountDeletion();
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = useCallback(async () => {
    await deleteAccount(confirmText);
    onDeleted?.();
  }, [confirmText, deleteAccount, onDeleted]);

  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: colors.gray[300],
          borderRadius: 12,
          padding: spacing.lg,
          gap: spacing.md,
          backgroundColor: colors.white,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={{ gap: spacing.xs }}>
        <Text
          style={{
            color: colors.gray[900],
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
          }}
        >
          Delete account
        </Text>
        <Text
          style={{
            color: colors.gray[600],
            fontSize: typography.sizes.sm,
            lineHeight: 20,
          }}
        >
          This removes the login profile, revokes active sessions and credentials,
          and signs the user out. Some regulated records may remain retained in
          anonymized form.
        </Text>
      </View>

      <View
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.error,
          backgroundColor: `${colors.error}12`,
          padding: spacing.md,
          gap: spacing.xs,
        }}
      >
        <Text
          style={{
            color: colors.error,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
          }}
        >
          Type {DELETE_CONFIRM_TEXT} to confirm
        </Text>
        <Text
          style={{
            color: colors.gray[700],
            fontSize: typography.sizes.sm,
            lineHeight: 20,
          }}
        >
          Use the hosted deletion portal for signed-out users or for the public
          account deletion URL required by Google Play.
        </Text>
      </View>

      {error && <ErrorMessage error={error} />}

      <Input
        label="Confirmation text"
        value={confirmText}
        onChangeText={setConfirmText}
        placeholder={DELETE_CONFIRM_TEXT}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!isLoading}
        testID={`${testID}-confirm-input`}
      />

      <View style={{ gap: spacing.sm }}>
        <Button
          title={isLoading ? "Deleting account..." : "Delete account"}
          onPress={() => {
            clearError();
            void handleDelete();
          }}
          disabled={confirmText.trim() !== DELETE_CONFIRM_TEXT}
          loading={isLoading}
          style={{ backgroundColor: colors.error }}
          textStyle={{ color: colors.white }}
          testID={`${testID}-delete-button`}
        />
        <Button
          title="Open hosted deletion portal"
          variant="outline"
          onPress={() => {
            void Linking.openURL(accountDeletionUrl);
          }}
          testID={`${testID}-portal-button`}
        />
      </View>
    </View>
  );
}
