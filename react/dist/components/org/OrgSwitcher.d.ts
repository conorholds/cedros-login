import { OrgWithMembership, CreateOrgRequest, DisplayError } from '../../types';
export interface OrgSwitcherProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** List of organizations */
    orgs: OrgWithMembership[];
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Callback when organization is selected */
    onSelect: (orgId: string) => void;
    /** Callback when new organization is created */
    onCreate?: (data: CreateOrgRequest) => Promise<void>;
    /** Additional CSS class */
    className?: string;
}
/**
 * Modal for switching organizations and creating new ones.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const { orgs, activeOrg, switchOrg, createOrg } = useOrgs();
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Switch org</button>
 *       <OrgSwitcher
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         orgs={orgs}
 *         activeOrg={activeOrg}
 *         onSelect={switchOrg}
 *         onCreate={createOrg}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export declare function OrgSwitcher({ isOpen, onClose, orgs, activeOrg, isLoading, error, onSelect, onCreate, className, }: OrgSwitcherProps): import("react/jsx-runtime").JSX.Element | null;
