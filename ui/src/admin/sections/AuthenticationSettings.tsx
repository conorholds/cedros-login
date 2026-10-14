/**
 * Authentication Settings Section - Plugin wrapper
 */

import type { JSX } from 'react';
import {
  AuthenticationSettings as Settings,
  type AuthenticationSettingsProps,
} from '../../components/admin/settings';

export default function AuthenticationSettings(props: AuthenticationSettingsProps): JSX.Element {
  return <Settings {...props} />;
}
