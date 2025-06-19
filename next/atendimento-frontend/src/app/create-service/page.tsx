"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import styles from "./styles.module.css";
import { isValidCpf } from "@/utils/isValidCpf";
import { maskCpf } from "@/utils/maskCpf";

export default function CreateService() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [serviceType, setServiceType] = useState("")
  const [description, setDescription] = useState("");
  const [error, setError] = useState("")

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("")

    const cpfNumber = cpf.replace(/\D/g, '') // Remove máscara para validar

    if (!name || !description || !serviceType) {
        setError("Preencha todos os campos")
        return
    }

    if (name.length < 4) {
        setError("Nome deve possui mais de 3 letras")
        return
    }

    if (!isValidCpf(cpf)) {
        setError("CPF inválido.")
        return
    }

    const data = {
      name,
      cpf,
      serviceType,
      description
    };

    return data

    setName("");
    setCpf("");
    setServiceType("")
    setDescription("");
  }

  function handleCpfChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setCpf(maskCpf(value))
  }

  return (
    <div className={styles.container}>
      <form className={styles.content} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          maxLength={14} // Limita a entrada no formato 000.000.000-00
          onChange={handleCpfChange}
        />
        <select 
            name="select"
            value={serviceType}
            onChange={e => setServiceType(e.target.value)}
        >
          <option value="options" disabled selected>
            Escolha do tipo de serviço
          </option>
          <option value="atendimento">Atendimento</option>
          <option value="suporte">Suporte</option>
          <option value="ouvidoria">Ouvidoria</option>
        </select>
        <textarea
          name="description"
          placeholder="Adicione uma breve descrição..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit">Gerar atendimento</button>
      </form>
    </div>
  );
}
