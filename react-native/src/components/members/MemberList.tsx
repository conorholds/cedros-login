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
import type { MemberApiResponse, OrgRole } from "../../types";
import { Button } from "../shared/Button";

export interface MemberListProps {
  members: MemberApiResponse[];
  currentUserRole: OrgRole;
  onRoleChange?: (memberId: string, newRole: OrgRole) => void;
  onRemove?: (memberId: string) => void;
  onInvitePress?: () => void;
  isLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function MemberList({
  members,
  currentUserRole,
  onRoleChange,
  onRemove,
  onInvitePress,
  isLoading = false,
  containerStyle,
  testID = "member-list",
}: MemberListProps): React.ReactElement {
  const canManageRoles =
    currentUserRole === "owner" || currentUserRole === "admin";
  const canRemove = currentUserRole === "owner" || currentUserRole === "admin";

  const getRoleColor = (role: OrgRole): string => {
    switch (role) {
      case "owner":
        return colors.primary[600];
      case "admin":
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const getRoleLabel = (role: OrgRole): string => {
    const labels: Record<OrgRole, string> = {
      owner: "Owner",
      admin: "Admin",
      member: "Member",
    };
    return labels[role];
  };

  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "?";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderMember = ({ item }: { item: MemberApiResponse }) => {
    const showActions = canManageRoles && item.role !== "owner";

    return (
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
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              color: colors.primary[600],
            }}
          >
            {getInitials(item.name, item.email)}
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
            {item.name || item.email || "Unknown"}
          </Text>
          {item.name && item.email && (
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[500],
              }}
            >
              {item.email}
            </Text>
          )}
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.gray[400],
              marginTop: spacing.xs,
            }}
          >
            Joined {formatDate(item.joinedAt)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
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

          {showActions && (
            <View style={{ flexDirection: "row", gap: spacing.xs }}>
              {onRoleChange && currentUserRole === "owner" && (
                <TouchableOpacity
                  onPress={() =>
                    onRoleChange(
                      item.id,
                      item.role === "admin" ? "member" : "admin",
                    )
                  }
                  style={{
                    padding: spacing.sm,
                    backgroundColor: colors.gray[100],
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>&#9998;</Text>
                </TouchableOpacity>
              )}
              {canRemove && onRemove && (
                <TouchableOpacity
                  onPress={() => onRemove(item.id)}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: colors.error + "20",
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.error }}>
                    &#10005;
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

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
          Team Members ({members.length})
        </Text>
        {canManageRoles && onInvitePress && (
          <Button
            title="+ Invite"
            onPress={onInvitePress}
            variant="primary"
            size="sm"
          />
        )}
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
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
              No members found
            </Text>
          </View>
        }
      />
    </View>
  );
}
