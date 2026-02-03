import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { Organization, OrgRole } from "../../types";

export interface OrgSwitcherProps {
  orgs: Array<Organization & { role: OrgRole }>;
  activeOrgId?: string;
  onSwitch: (orgId: string) => void;
  onCreateOrg?: () => void;
  isVisible: boolean;
  onClose: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function OrgSwitcher({
  orgs,
  activeOrgId,
  onSwitch,
  onCreateOrg,
  isVisible,
  onClose,
  containerStyle,
  testID = "org-switcher",
}: OrgSwitcherProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | undefined>(activeOrgId);

  const activeOrg = orgs.find((org) => org.id === activeOrgId);

  const getRoleLabel = (role: OrgRole): string => {
    const labels: Record<OrgRole, string> = {
      owner: "Owner",
      admin: "Admin",
      member: "Member",
    };
    return labels[role];
  };

  const handleSelect = (orgId: string) => {
    setSelectedId(orgId);
  };

  const handleConfirm = () => {
    if (selectedId && selectedId !== activeOrgId) {
      onSwitch(selectedId);
    }
    onClose();
  };

  const renderOrgItem = ({
    item,
  }: {
    item: Organization & { role: OrgRole };
  }) => {
    const isSelected = selectedId === item.id;
    const isActive = activeOrgId === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.id)}
        style={{
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[100],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isSelected ? colors.primary[50] : colors.transparent,
        }}
      >
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
              {item.name}
            </Text>
            {isActive && (
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
          {item.isPersonal && (
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.gray[500],
                marginTop: spacing.xs,
              }}
            >
              Personal workspace
            </Text>
          )}
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
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: isSelected ? colors.primary[600] : colors.gray[300],
              backgroundColor: isSelected
                ? colors.primary[600]
                : colors.transparent,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isSelected && (
              <Text style={{ color: colors.white, fontSize: 12 }}>
                &#10003;
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          },
          containerStyle,
        ]}
      >
        <View
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "80%",
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
            <View>
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                }}
              >
                Switch Organization
              </Text>
              {activeOrg && (
                <Text
                  style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs,
                  }}
                >
                  Currently: {activeOrg.name}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
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
              paddingBottom: spacing.md,
            }}
          />

          <View
            style={{
              padding: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: colors.gray[200],
              gap: spacing.md,
            }}
          >
            {onCreateOrg && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onCreateOrg();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.base,
                    color: colors.primary[600],
                    fontWeight: typography.weights.medium,
                  }}
                >
                  + Create New Organization
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                backgroundColor: colors.primary[600],
                paddingVertical: spacing.md,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                }}
              >
                Switch to Selected
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
