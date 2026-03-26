import { useState } from "react";
import "./AuthForm.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={`form-container ${isLogin ? "login" : "register"}`}>
      <h2>{isLogin ? "Login" : "Cadastro"}</h2>
      <form>
        {!isLogin && <input type="text" placeholder="Nome completo" required />}
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Senha" required />
        <button type="submit">{isLogin ? "Entrar" : "Cadastrar"}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Criar uma conta" : "Já tenho uma conta"}
      </p>
    </div>
  );
}
