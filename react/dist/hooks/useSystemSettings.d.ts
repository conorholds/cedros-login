import { UseSystemSettingsReturn } from '../types';
/**
 * Hook for managing system settings (admin only).
 *
 * Provides CRUD operations for system-wide configuration settings
 * stored in the database. Only accessible to system administrators.
 *
 * @example
 * ```tsx
 * function SystemSettingsPanel() {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     fetchSettings,
 *     updateSettings,
 *     getValue,
 *   } = useSystemSettings();
 *
 *   useEffect(() => {
 *     fetchSettings();
 *   }, [fetchSettings]);
 *
 *   const handleSave = async () => {
 *     await updateSettings([
 *       { key: 'privacy_period_secs', value: '1209600' },
 *     ]);
 *   };
 *
 *   return (
 *     <div>
 *       {Object.entries(settings).map(([category, items]) => (
 *         <section key={category}>
 *           <h3>{category}</h3>
 *           {items.map(item => (
 *             <div key={item.key}>
 *               {item.key}: {item.value}
 *             </div>
 *           ))}
 *         </section>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useSystemSettings(): UseSystemSettingsReturn;
