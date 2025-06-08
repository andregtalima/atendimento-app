"use client"

import { FormEvent, useState } from "react"
import styles from "./styles.module.css"
import api from "@/services/api"
import { useRouter } from "next/navigation"

export default function Login() {
    const [user, setUser] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError("")

        try {
            const response = await api.post("/login", {
                username: user,
                password
            })

            const token = response.data.token

            if (token) {
                localStorage.setItem("token", token)
                router.push("/")
            } else {
                setError("Token não recebido da API.")
            }

        } catch (err: any) {
            setError("Usuário ou senha inválidos.")
            console.error(err.mensage)
            window.location.href = "/auth/login"
        }
        setUser("")
        setPassword("")
    }

    return (
        <div className={styles.container}>
            <section className={styles.content}>
                <h1>Login</h1>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        placeholder="Usuário"
                        value={user}
                        onChange={e => setUser(e.target.value)}
                    />

                    <input 
                        type="password"
                        placeholder="Senha do usuário"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit">Acessar</button>
                    {error && <p className={styles.error}>{error}</p>}
                </form>
            </section>
        </div>
    )
}