import React, { useState, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Verificar se o usuário está armazenado no localStorage ao carregar a aplicação
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      
      if (storedUser && storedToken) {
        // Usar try-catch para lidar com possíveis erros de JSON inválido
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Usuário carregado do localStorage:", parsedUser);
          
          setUser(parsedUser);
          setUserType(storedUserType);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error("Erro ao analisar dados do usuário:", parseError);
          // Limpar os dados corrompidos
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
        }
      }
    } catch (error) {
      console.error("Erro ao acessar localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, token, type) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('userType', type);
      // Salvar ongId se for ONG
      if (type === 'Ong' || type === 'ONG') {
        localStorage.setItem('ongId', userData._id);
      } else {
        localStorage.removeItem('ongId');
      }
      setUser(userData);
      setUserType(type);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      // Implementar tratamento de erro, como mostrar uma mensagem ao usuário
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
  };

  // Adicionando função para atualizar dados do usuário
  const updateUserData = (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userType, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout,
        updateUserData // Nova função para atualizar dados do usuário
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;