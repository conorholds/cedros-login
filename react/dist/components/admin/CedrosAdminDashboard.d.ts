/**
 * Unified Admin Dashboard
 *
 * A complete, ready-to-use admin panel following shadcn/ui dashboard patterns.
 *
 * @example
 * ```tsx
 * // Minimal setup - everything included
 * function AdminPage() {
 *   return <CedrosAdminDashboard />;
 * }
 *
 * // Customized sections
 * function AdminPage() {
 *   return (
 *     <CedrosAdminDashboard
 *       sections={['overview', 'members', 'deposits', 'settings']}
 *       title="My App Admin"
 *     />
 *   );
 * }
 * ```
 */
/** Available dashboard sections */
export type DashboardSection = 'overview' | 'users' | 'members' | 'invites' | 'deposits' | 'withdrawals' | 'settings';
export interface CedrosAdminDashboardProps {
    /** Dashboard title */
    title?: string;
    /** Sections to display (defaults to all) */
    sections?: DashboardSection[];
    /** Initial active section */
    defaultSection?: DashboardSection;
    /** Auto-refresh interval for stats in ms (0 to disable) */
    refreshInterval?: number;
    /** Items per page for lists */
    pageSize?: number;
    /** Callback when section changes */
    onSectionChange?: (section: DashboardSection) => void;
    /** Additional CSS class */
    className?: string;
}
/**
 * Unified Admin Dashboard
 *
 * Provides a complete admin interface with sidebar navigation.
 * Follows shadcn/ui dashboard patterns.
 */
export declare function CedrosAdminDashboard({ title, sections, defaultSection, refreshInterval, pageSize, onSectionChange, className, }: CedrosAdminDashboardProps): import("react/jsx-runtime").JSX.Element;
