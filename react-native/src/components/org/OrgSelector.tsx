import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { Organization, OrgRole } from "../../types";

export interface OrgSelectorProps {
  orgs: Array<Organization & { role: OrgRole }>;
  selectedOrgId?: string;
  onSelect: (orgId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function OrgSelector({
  orgs,
  selectedOrgId,
  onSelect,
  placeholder = "Select organization",
  disabled = false,
  containerStyle,
  testID = "org-selector",
}: OrgSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOrg = orgs.find((org) => org.id === selectedOrgId);

  const getRoleLabel = (role: OrgRole): string => {
    const labels: Record<OrgRole, string> = {
      owner: "Owner",
      admin: "Admin",
      member: "Member",
    };
    return labels[role];
  };

  const renderOrgItem = ({
    item,
  }: {
    item: Organization & { role: OrgRole };
  }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item.id);
        setIsOpen(false);
      }}
      style={{
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor:
          selectedOrgId === item.id ? colors.primary[50] : colors.transparent,
      }}
    >
      <View>
        <Text
          style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium,
            color: colors.gray[900],
          }}
        >
          {item.name}
        </Text>
        {item.isPersonal && (
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.gray[500],
              marginTop: spacing.xs,
            }}
          >
            Personal
          </Text>
        )}
      </View>
      <View
        style={{
          backgroundColor: colors.primary[100],
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.xs,
            color: colors.primary[700],
            fontWeight: typography.weights.medium,
          }}
        >
          {getRoleLabel(item.role)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle} testID={testID}>
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled || orgs.length === 0}
        style={{
          backgroundColor: disabled ? colors.gray[100] : colors.white,
          borderWidth: 1,
          borderColor: colors.gray[300],
          borderRadius: 8,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        accessibilityRole="button"
        accessibilityLabel="Select organization"
      >
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: selectedOrg ? colors.gray[900] : colors.gray[400],
          }}
        >
          {selectedOrg?.name || placeholder}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[500],
          }}
        >
          {isOpen ? "&#9650;" : "&#9660;"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                padding: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray[200],
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                }}
              >
                Select Organization
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text
                  style={{
                    fontSize: typography.sizes.xl,
                    color: colors.gray[500],
                  }}
                >
                  &#10005;
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={orgs}
              renderItem={renderOrgItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingBottom: spacing.lg,
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
