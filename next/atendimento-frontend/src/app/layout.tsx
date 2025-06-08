import "./globals.css";

export const metadata = {
  title: "Atendimento App",
  description: "Sistema de Gerenciamento de Atendimentos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <header style={{ padding: "10px", backgroundColor: "#0070f3", color: "#fff" }}>
          <h1>Atendimento App</h1>
        </header>
        <main>{children}</main>
        <footer style={{ padding: "10px", backgroundColor: "#f4f4f4", textAlign: "center" }}>
          © 2023 Atendimento App
        </footer>
      </body>
    </html>
  );
}