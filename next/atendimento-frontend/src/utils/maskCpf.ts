export function maskCpf(value: string) {
    return value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto apos os 3 primeiros dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto apos os 6 primeiros dígitos
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca traço antes dos 2 último dígitos
}