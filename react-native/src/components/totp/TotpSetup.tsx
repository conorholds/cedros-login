import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
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
import { OtpInput } from "./OtpInput";

export interface TotpSetupProps {
  qrCodeUri?: string;
  secret: string;
  recoveryCodes: string[];
  onVerify: (code: string) => Promise<void>;
  onBackupCodesSaved: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

type SetupStep = "qr" | "backup" | "verify";

export function TotpSetup({
  qrCodeUri,
  secret,
  recoveryCodes,
  onVerify,
  onBackupCodesSaved,
  containerStyle,
  testID = "totp-setup",
}: TotpSetupProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<SetupStep>("qr");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  const handleNextStep = () => {
    if (currentStep === "qr") {
      setCurrentStep("backup");
    } else if (currentStep === "backup") {
      if (backupCodesSaved) {
        setCurrentStep("verify");
        onBackupCodesSaved();
      }
    }
  };

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onVerify(code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [code, onVerify]);

  const renderQrStep = () => (
    <View>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[600],
          marginBottom: spacing.lg,
          textAlign: "center",
        }}
      >
        Scan this QR code with your authenticator app (Google Authenticator,
        Authy, etc.)
      </Text>

      <View
        style={{
          backgroundColor: colors.white,
          padding: spacing.lg,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: spacing.lg,
          borderWidth: 1,
          borderColor: colors.gray[200],
        }}
      >
        {qrCodeUri ? (
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: colors.gray[100],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.gray[500] }}>QR Code Placeholder</Text>
          </View>
        ) : (
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: colors.gray[100],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.gray[500] }}>QR Code Placeholder</Text>
          </View>
        )}
      </View>

      <View
        style={{
          backgroundColor: colors.gray[100],
          padding: spacing.md,
          borderRadius: 8,
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[600],
            marginBottom: spacing.xs,
          }}
        >
          Can't scan? Enter this code manually:
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[900],
            fontFamily: "monospace",
            fontWeight: typography.weights.medium,
            textAlign: "center",
          }}
        >
          {secret}
        </Text>
      </View>

      <Button
        title="I've Scanned the QR Code"
        onPress={handleNextStep}
        variant="primary"
        size="lg"
      />
    </View>
  );

  const renderBackupStep = () => (
    <View>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[600],
          marginBottom: spacing.lg,
          textAlign: "center",
        }}
      >
        Save these backup codes in a secure location. You can use them to
        recover your account if you lose access to your authenticator app.
      </Text>

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
          &#9888; Each backup code can only be used once!
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.gray[900],
          padding: spacing.lg,
          borderRadius: 12,
          marginBottom: spacing.lg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: spacing.md,
          }}
        >
          {recoveryCodes.map((code, index) => (
            <Text
              key={index}
              style={{
                fontSize: typography.sizes.sm,
                color: colors.white,
                fontFamily: "monospace",
                width: "45%",
              }}
            >
              {index + 1}. {code.slice(0, 4)}-{code.slice(4)}
            </Text>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setBackupCodesSaved(!backupCodesSaved)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: backupCodesSaved
              ? colors.primary[600]
              : colors.gray[400],
            backgroundColor: backupCodesSaved
              ? colors.primary[600]
              : colors.transparent,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {backupCodesSaved && (
            <Text style={{ color: colors.white, fontSize: 14 }}>&#10003;</Text>
          )}
        </View>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[700],
            flex: 1,
          }}
        >
          I've saved these backup codes in a secure location
        </Text>
      </TouchableOpacity>

      <Button
        title="Continue"
        onPress={handleNextStep}
        variant="primary"
        size="lg"
        disabled={!backupCodesSaved}
      />
    </View>
  );

  const renderVerifyStep = () => (
    <View>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[600],
          marginBottom: spacing.lg,
          textAlign: "center",
        }}
      >
        Enter the 6-digit code from your authenticator app to confirm setup
      </Text>

      {error && (
        <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
      )}

      <OtpInput
        value={code}
        onChange={setCode}
        length={6}
        containerStyle={{ marginBottom: spacing.lg }}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Button
          title="Verify and Enable"
          onPress={handleVerify}
          variant="primary"
          size="lg"
          disabled={code.length !== 6}
        />
      )}
    </View>
  );

  const steps: { key: SetupStep; label: string }[] = [
    { key: "qr", label: "1. Scan QR" },
    { key: "backup", label: "2. Save Codes" },
    { key: "verify", label: "3. Verify" },
  ];

  return (
    <ScrollView
      style={[{ flex: 1 }, containerStyle]}
      contentContainerStyle={{ padding: spacing.lg }}
      testID={testID}
    >
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: typography.sizes["2xl"],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
            marginBottom: spacing.sm,
            textAlign: "center",
          }}
        >
          Set Up Two-Factor Authentication
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: spacing.xl,
          gap: spacing.md,
        }}
      >
        {steps.map((step) => (
          <View
            key={step.key}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: 4,
              backgroundColor:
                currentStep === step.key
                  ? colors.primary[100]
                  : colors.transparent,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color:
                  currentStep === step.key
                    ? colors.primary[700]
                    : colors.gray[400],
                fontWeight:
                  currentStep === step.key
                    ? typography.weights.medium
                    : typography.weights.normal,
              }}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {currentStep === "qr" && renderQrStep()}
      {currentStep === "backup" && renderBackupStep()}
      {currentStep === "verify" && renderVerifyStep()}
    </ScrollView>
  );
}
