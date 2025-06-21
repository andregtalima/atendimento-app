"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import styles from "./styles.module.css";
import { isValidCpf } from "@/utils/isValidCpf";
import { maskCpf } from "@/utils/maskCpf";
import api from "@/services/api";

export default function ClientForm() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const cpfNumber = cpf.replace(/\D/g, ""); // Remove máscara para validar

    if (!name || !description || !serviceType || !cpf) {
      setError("Preencha todos os campos");
      return;
    }

    if (name.length < 4) {
      setError("Nome deve possui mais de 3 letras");
      return;
    }

    if (!isValidCpf(cpf)) {
      setError("CPF inválido.");
      return;
    }

    const data = {
      name,
      cpf: cpfNumber, // Envia CPF sem mascara para API
      serviceType,
      description,
    };

    try {
      await api.post("/atendimento", data);
      setSuccess("Atendimento criado com sucesso!")
      setName("");
      setCpf("");
      setServiceType("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Erro ao criar atendimento.");
    }
  }

  function handleCpfChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCpf(maskCpf(value));
  }

  return (
    <div className={styles.container}>
      <form className={styles.content} onSubmit={handleSubmit}>
        <h1>Registrar Atendimento</h1>
        <input
          type="text"
          placeholder="Nome completo"
          maxLength={100}
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
        <input
          type="text"
          placeholder="Tipo de atendimento?"
          maxLength={50}
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        />
        <textarea
          name="description"
          placeholder="Adicione uma breve descrição..."
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit">Gerar atendimento</button>
      </form>
    </div>
  );
}
