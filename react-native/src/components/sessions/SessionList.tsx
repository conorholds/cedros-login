import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { Session } from "../../types";
import { Button } from "../shared/Button";

export interface SessionListProps {
  sessions: Session[];
  onRevoke?: (sessionId: string) => void;
  onRevokeAll?: () => void;
  isLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SessionList({
  sessions,
  onRevoke,
  onRevokeAll,
  isLoading: _isLoading = false,
  containerStyle,
  testID = "session-list",
}: SessionListProps): React.ReactElement {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (userAgent?: string): string => {
    if (!userAgent) return "&#128187;";
    if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
      return "&#128241;";
    }
    if (userAgent.includes("Mac")) {
      return "&#63743;";
    }
    return "&#128187;";
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
        backgroundColor: item.isCurrent
          ? colors.primary[50]
          : colors.transparent,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: item.isCurrent
            ? colors.primary[100]
            : colors.gray[100],
          justifyContent: "center",
          alignItems: "center",
          marginRight: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: 20,
          }}
        >
          {getDeviceIcon(item.userAgent)}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.medium,
              color: colors.gray[900],
            }}
          >
            {item.isCurrent ? "Current Session" : "Active Session"}
          </Text>
          {item.isCurrent && (
            <View
              style={{
                backgroundColor: colors.success,
                paddingHorizontal: spacing.xs,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.white,
                  fontWeight: typography.weights.bold,
                }}
              >
                Active
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[500],
            marginTop: spacing.xs,
          }}
        >
          Expires {formatDate(item.expiresAt)}
        </Text>
        {item.ipAddress && (
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.gray[400],
              marginTop: spacing.xs,
            }}
          >
            IP: {item.ipAddress}
          </Text>
        )}
      </View>

      {!item.isCurrent && onRevoke && (
        <TouchableOpacity
          onPress={() => onRevoke(item.id)}
          style={{
            padding: spacing.sm,
            backgroundColor: colors.error + "20",
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.error }}>&#10005;</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={containerStyle} testID={testID}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200],
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.gray[900],
          }}
        >
          Active Sessions ({sessions.length})
        </Text>
        {sessions.length > 1 && onRevokeAll && (
          <Button
            title="Revoke All"
            onPress={onRevokeAll}
            variant="outline"
            size="sm"
          />
        )}
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: spacing.lg,
        }}
        ListEmptyComponent={
          <View
            style={{
              padding: spacing.xl,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.base,
                color: colors.gray[500],
              }}
            >
              No active sessions
            </Text>
          </View>
        }
      />
    </View>
  );
}
