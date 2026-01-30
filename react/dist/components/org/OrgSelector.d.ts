import { OrgWithMembership } from '../../types';
export interface OrgSelectorProps {
    /** List of organizations to display */
    orgs: OrgWithMembership[];
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** Loading state */
    isLoading?: boolean;
    /** Callback when organization is selected */
    onSelect: (orgId: string) => void;
    /** Callback when "Create organization" is clicked */
    onCreateClick?: () => void;
    /** Additional CSS class */
    className?: string;
    /** Placeholder when no orgs */
    placeholder?: string;
}
/**
 * Dropdown selector for switching between organizations.
 *
 * ## A11Y-02: Keyboard Navigation Limitation
 *
 * Currently supports:
 * - Tab/Shift+Tab: Move focus between trigger and items
 * - Escape: Close dropdown
 * - Enter/Space: Select focused item
 *
 * TODO: Implement arrow key navigation for better accessibility:
 * - ArrowUp/ArrowDown: Navigate between items in the list
 * - Home/End: Jump to first/last item
 * - Type-ahead: Focus item starting with typed character
 *
 * See WAI-ARIA Listbox Pattern for reference implementation.
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { orgs, activeOrg, switchOrg } = useOrgs();
 *
 *   return (
 *     <OrgSelector
 *       orgs={orgs}
 *       activeOrg={activeOrg}
 *       onSelect={switchOrg}
 *       onCreateClick={() => setShowCreateModal(true)}
 *     />
 *   );
 * }
 * ```
 */
export declare function OrgSelector({ orgs, activeOrg, isLoading, onSelect, onCreateClick, className, placeholder, }: OrgSelectorProps): import("react/jsx-runtime").JSX.Element;
