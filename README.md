# Amigo da Vez (Motorista Particular) 🚗💨

> "Bebeu? A gente leva seu carro pra casa."

Platforma que conecta donos de veículos a motoristas profissionais ("pilotos") para conduzir o carro do usuário em segurança. Ideal para saídas de bares, festas ou emergências médicas.

## 🚀 Funcionalidades Principais

-   **Geolocalização:** Encontre o piloto mais próximo de você.
-   **Modo Emergência Blitz:** Prioridade máxima para motoristas chegarem em até 15 minutos (Lei 13.546/2017).
-   **Segurança (Escrow):** Pagamento garantido pelo App. O motorista só recebe após finalizar a corrida.
-   **Transparência:** Veja foto, idade e validade da CNH do motorista antes de aceitar.
-   **Chat:** Combine detalhes diretamente pelo app.

## 🛠️ Tecnologias

-   **Frontend:** React, Vite, Tailwind CSS, ShadCN UI, Framer Motion.
-   **Mapa:** Leaflet (OpenStreetMap).
-   **Backend (Serverless):** Vercel Functions (Node.js).
-   **Banco de Dados:** Vercel KV (Redis).
-   **Armazenamento:** Vercel Blob (Imagens e Documentos).

## 📦 Como Rodar Localmente

1.  Clone o repositório:
    ```bash
    git clone https://github.com/SEU_USUARIO/amigo-da-vez.git
    cd amigo-da-vez
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

4.  Acesse `http://localhost:5173`

## ☁️ Deploy

Este projeto está configurado para deploy imediato na **Vercel**.
Basta conectar o repositório e configurar as variáveis de ambiente para KV e Blob Storage.

---
Desenvolvido com ❤️ para salvar vidas no trânsito.
