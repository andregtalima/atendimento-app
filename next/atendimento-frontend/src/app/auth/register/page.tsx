"use client";

import { FormEvent, useState } from "react";
import styles from "./styles.module.css";
import api from "@/services/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucess, setSucess] = useState("");

  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSucess("");

    if (!username || !password || !role) {
      setError("Preencha todos os campos.");
      return;
    }

    if (password.length < 7) {
      setError("Senha deve ter no mínimo 6 caracteres.");
      return;
    }

    console.log("Enviando para API", {
        username,
        password,
        role
    })

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        username,
        password,
        role,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
        router.push("/");
        setSucess("Registro realizado com sucesso!");

        setTimeout(() => {
          setUsername("");
          setPassword("");
          setRole("");
          setSucess("");
          setError("");
        }, 3000);
      }
    } catch (err) {
      setError("Erro ao registrar usuário.");
      setLoading(false);
      console.error(err);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.content} onSubmit={handleSubmit}>
        <h1>Registrar Usuário</h1>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Informe sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="" disabled selected>
            Tipo de usuário
          </option>
          <option value="USER">Usuário</option>
          <option value="ADMIN">Administrador</option>
          <option value="SUPERVISOR">Supervidor</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
        {error && !loading && <p className={styles.error}>{error}</p>}
        {sucess && !loading && <p className={styles.sucess}>{sucess}</p>}
      </form>
    </div>
  );
}
