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
import type { InviteApiResponse, OrgRole } from "../../types";
import { Button } from "../shared/Button";

export interface InviteListProps {
  invites: InviteApiResponse[];
  onCancel?: (inviteId: string) => void;
  onInvitePress?: () => void;
  isLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function InviteList({
  invites,
  onCancel,
  onInvitePress,
  isLoading = false,
  containerStyle,
  testID = "invite-list",
}: InviteListProps): React.ReactElement {
  const getRoleLabel = (role: Exclude<OrgRole, "owner">): string => {
    const labels: Record<Exclude<OrgRole, "owner">, string> = {
      admin: "Admin",
      member: "Member",
    };
    return labels[role];
  };

  const getRoleColor = (role: Exclude<OrgRole, "owner">): string => {
    switch (role) {
      case "admin":
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
      return "Expired";
    } else if (diffDays === 0) {
      return "Expires today";
    } else if (diffDays === 1) {
      return "Expires tomorrow";
    } else {
      return `Expires in ${diffDays} days`;
    }
  };

  const renderInvite = ({ item }: { item: InviteApiResponse }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary[100],
          justifyContent: "center",
          alignItems: "center",
          marginRight: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.bold,
            color: colors.primary[600],
          }}
        >
          {item.email[0].toUpperCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium,
            color: colors.gray[900],
          }}
        >
          {item.email}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.xs,
            color: colors.gray[500],
            marginTop: spacing.xs,
          }}
        >
          {formatDate(item.expiresAt)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <View
          style={{
            backgroundColor: getRoleColor(item.role) + "20",
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: getRoleColor(item.role),
              fontWeight: typography.weights.medium,
            }}
          >
            {getRoleLabel(item.role)}
          </Text>
        </View>

        {onCancel && (
          <TouchableOpacity
            onPress={() => onCancel(item.id)}
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
          Pending Invites ({invites.length})
        </Text>
        {onInvitePress && (
          <Button
            title="+ Invite"
            onPress={onInvitePress}
            variant="primary"
            size="sm"
          />
        )}
      </View>

      <FlatList
        data={invites}
        renderItem={renderInvite}
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
                marginBottom: spacing.md,
              }}
            >
              No pending invitations
            </Text>
            {onInvitePress && (
              <Button
                title="Invite Someone"
                onPress={onInvitePress}
                variant="outline"
                size="sm"
              />
            )}
          </View>
        }
      />
    </View>
  );
}
