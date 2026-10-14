import runtimeStyles from '../styles/login.css?inline';
import authBlockStyles from '../extension/auth-blocks.css?inline';
import { cedrosLoginExtensionManifest } from '../extension/manifest';
import type { CedrosExtensionBootstrap } from '../extension/contracts';
import {
  cedrosLoginRuntimeContentBlockRenderers,
  cedrosLoginRuntimeContentBlocks,
  cedrosLoginRuntimeContentTemplates,
} from '../extension/visualBuilder';
import {
  CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID,
  ensureCedrosLoginRuntimeStyles,
} from '../extension/runtimeStyles';

// Public pages import this entry from the uploaded extension archive, not from
// an HTML document that links login-react.css. Inline both the block-shell CSS
// and the real LoginForm CSS so hydration preserves the styled working form.
// Order matters: auth-blocks.css carries static-render parity rules for
// login.css classes at equal specificity, so login.css must come second to
// stay authoritative once hydrated.
ensureCedrosLoginRuntimeStyles(
  `${authBlockStyles}\n${runtimeStyles}`,
  CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID
);

const cedrosLoginWebExtensionBootstrap: CedrosExtensionBootstrap = {
  manifest: cedrosLoginExtensionManifest,
  contentBlocks: cedrosLoginRuntimeContentBlocks,
  contentBlockRenderers: cedrosLoginRuntimeContentBlockRenderers,
  contentTemplates: cedrosLoginRuntimeContentTemplates,
};

function registerCedrosLoginWebSurface(): CedrosExtensionBootstrap {
  return cedrosLoginWebExtensionBootstrap;
}

export default registerCedrosLoginWebSurface;
