import { createContext, useContext, useState, useEffect } from 'react';

// Cria e exporta o contexto para ser usado pelo hook
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedUserType = localStorage.getItem('userType');
        
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setUserType(storedUserType);
            setIsAuthenticated(true);
        }
        
        setIsLoading(false);
    }, []);

    const login = (userData, type) => {
        setUser(userData);
        setUserType(type);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', type);
    };

    const logout = () => {
        setUser(null);
        setUserType(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            userType, 
            isAuthenticated, 
            isLoading, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

export default AuthContext;