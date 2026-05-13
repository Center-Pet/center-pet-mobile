import React, { createContext, useEffect, useMemo, useState } from "react";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "../services/storage";
import {
  forgotPassword,
  loginWithEmail,
  registerAdopter,
  registerOng as registerOngRequest,
  resetPassword
} from "../services/authService";
import { sendWelcomeEmail } from "../services/emailService";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await loadAuthSession();
        if (session) {
          setUser(session.user);
          setToken(session.token);
          setUserType(session.userType);
        }
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      userType,
      isLoading,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const result = await loginWithEmail(email, password);
        await saveAuthSession(result.user, result.token, result.userType);
        setUser(result.user);
        setToken(result.token);
        setUserType(result.userType || null);
      },
      async registerAdopter(data) {
        const result = await registerAdopter(data);
        await sendWelcomeEmail(data).catch(() => {});
        return result;
      },
      async registerOng(data) {
        return registerOngRequest(data);
      },
      async requestPasswordReset(email) {
        return forgotPassword(email);
      },
      async confirmPasswordReset({ token, password }) {
        return resetPassword(token, password);
      },
      async logout() {
        await clearAuthSession();
        setUser(null);
        setToken(null);
        setUserType(null);
      },
      /** Atualiza o usuario na sessao (ex.: apos formulario de adotante seguro). */
      async mergeSessionUser(partial) {
        if (!token || !userType || !user) return;
        const next = { ...user, ...partial };
        await saveAuthSession(next, token, userType);
        setUser(next);
      }
    }),
    [isLoading, token, user, userType]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
