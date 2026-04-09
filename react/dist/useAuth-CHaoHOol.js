import { u } from "./useCedrosLogin-fUZvc4r9.js";
function l() {
  const { user: e, authState: o, error: t, logout: n, refreshUser: a, openModal: r, closeModal: s } = u();
  return {
    user: e,
    authState: o,
    error: t,
    isAuthenticated: o === "authenticated" && e !== null,
    isLoading: o === "loading",
    logout: n,
    refreshUser: a,
    openLoginModal: r,
    closeLoginModal: s
  };
}
export {
  l as u
};
