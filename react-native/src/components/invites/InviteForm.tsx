import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import type { OrgRole } from "../../types";

export interface InviteFormProps {
  onSubmit?: (email: string, role: Exclude<OrgRole, "owner">) => Promise<void>;
  onSuccess?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function InviteForm({
  onSubmit,
  onSuccess,
  containerStyle,
  testID = "invite-form",
}: InviteFormProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<Exclude<OrgRole, "owner">>("member");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const roles: Array<{ value: Exclude<OrgRole, "owner">; label: string }> = [
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" },
  ];

  const validateForm = useCallback((): boolean => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(undefined);
    return true;
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit(email.trim(), selectedRole);
      }
      setIsSuccess(true);
      setEmail("");
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send invitation. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, selectedRole, onSubmit, onSuccess, validateForm]);

  const handleSendAnother = () => {
    setIsSuccess(false);
    setEmail("");
    setError(null);
  };

  if (isSuccess) {
    return (
      <View
        style={[
          {
            padding: spacing.lg,
            alignItems: "center",
          },
          containerStyle,
        ]}
        testID={testID}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.success + "20",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              color: colors.success,
            }}
          >
            &#10003;
          </Text>
        </View>
        <Text
          style={{
            fontSize: typography.sizes["2xl"],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
            marginBottom: spacing.md,
            textAlign: "center",
          }}
        >
          Invitation Sent!
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
            marginBottom: spacing.xl,
          }}
        >
          We've sent an invitation to {email}
        </Text>
        <Button
          title="Send Another Invite"
          onPress={handleSendAnother}
          variant="outline"
          size="md"
        />
      </View>
    );
  }

  return (
    <View style={[{ padding: spacing.lg }, containerStyle]} testID={testID}>
      <Text
        style={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: colors.gray[900],
          marginBottom: spacing.sm,
        }}
      >
        Invite Team Member
      </Text>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[600],
          marginBottom: spacing.lg,
        }}
      >
        Send an invitation to join your organization
      </Text>

      {error && (
        <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
      )}

      <View style={{ gap: spacing.md }}>
        <View>
          <Text
            style={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: colors.gray[700],
              marginBottom: spacing.xs,
            }}
          >
            Email Address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="colleague@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            style={{
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: emailError ? colors.error : colors.gray[300],
              borderRadius: 8,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              fontSize: typography.sizes.base,
              color: colors.gray[900],
            }}
            placeholderTextColor={colors.gray[400]}
          />
          {emailError && (
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.error,
                marginTop: spacing.xs,
              }}
            >
              {emailError}
            </Text>
          )}
        </View>

        <View>
          <Text
            style={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: colors.gray[700],
              marginBottom: spacing.xs,
            }}
          >
            Role
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                onPress={() => setSelectedRole(role.value)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor:
                    selectedRole === role.value
                      ? colors.primary[600]
                      : colors.gray[300],
                  backgroundColor:
                    selectedRole === role.value
                      ? colors.primary[50]
                      : colors.white,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.base,
                    fontWeight:
                      selectedRole === role.value
                        ? typography.weights.semibold
                        : typography.weights.normal,
                    color:
                      selectedRole === role.value
                        ? colors.primary[700]
                        : colors.gray[700],
                    textAlign: "center",
                  }}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[500],
            marginTop: spacing.sm,
          }}
        >
          {selectedRole === "admin"
            ? "Admins can manage team members and organization settings."
            : "Members have access to the organization's resources."}
        </Text>

        {isLoading ? (
          <LoadingSpinner style={{ marginTop: spacing.md }} />
        ) : (
          <Button
            title="Send Invitation"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            style={{ marginTop: spacing.lg }}
          />
        )}
      </View>
    </View>
  );
}
