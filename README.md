# 🌿 TreeNT

![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Platform: Windows](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)
![Feito com IA](https://img.shields.io/badge/Feito%20com-Intelig%C3%AAncia%20Artificial-2e773c?logo=anthropic&logoColor=white)
![Gratuito](https://img.shields.io/badge/Gratuito-Para%20todos-2e773c)

Organizador visual de tarefas, notas mentais e eventos em forma de árvore. App desktop para Windows e Linux, construído com Electron.

---

## 🤖 Sobre este projeto

> **Este aplicativo foi inteiramente desenvolvido com o auxílio de Inteligência Artificial e é distribuído de forma livre e gratuita.**
>
> O intuito é simples: disponibilizar uma ferramenta útil para todos, sem barreiras.
> Sem cobranças, sem cadastro, sem coleta de dados — apenas um app que funciona.

O código é aberto sob licença **GNU GPL v3**, o que significa que qualquer pessoa pode usar, estudar, modificar e redistribuir livremente.

---

## ✨ Funcionalidades

- **Árvore visual interativa** — cada nota vira um bloco colorido conectado por galhos orgânicos
- **3 tipos com cores distintas** — 🔵 Tarefas · 🟢 Notas mentais · 🟡 Datas especiais
- **Ordenação inteligente** — notas mais urgentes aparecem mais perto da base
- **Sistema de pastas** — filtre por tipo com contadores em tempo real
- **Integração com calendário** — alertas automáticos de eventos próximos (até 7 dias)
- **Exportação .txt** — exporta todas as notas via diálogo nativo do sistema
- **Ícone na bandeja** — fica sempre acessível sem ocupar a barra de tarefas
- **Atalho global** `Alt+T` — abre/fecha o app de qualquer lugar
- **Dados persistentes** — salvo localmente, sem servidor ou nuvem

---

## 🚀 Instalação (usuário final)

Baixe o instalador mais recente na aba [**Releases**](../../releases):

| Sistema | Arquivo |
|---------|---------|
| Windows — Instalador | `TreeNT-Setup-x.x.x.exe` |
| Windows — Portátil   | `TreeNT-Portable-x.x.x.exe` |
| Linux                | `TreeNT-x.x.x-linux.AppImage` |

---

## 🛠️ Desenvolvimento local

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- npm (já incluído no Node.js)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/luc4sprod/TreeNT.git
cd TreeNT

# 2. Instale as dependências
npm install

# 3. Execute em modo desenvolvimento
npm start
```

---

## 📦 Gerar instalador localmente

```bash
npm run build:all    # instalador + portátil + zip (Windows)
npm run build:linux  # AppImage (Linux)
```

Os arquivos gerados ficam na pasta `dist/`.

---

## 📁 Estrutura do projeto

```
TreeNT/
├── main.js           # Processo principal Electron (janela, bandeja, atalho)
├── preload.js        # Ponte segura entre renderer e Node.js
├── src/
│   └── index.html    # Interface completa (HTML + CSS + JS)
├── assets/
│   ├── icon.ico      # Ícone Windows
│   ├── icon.png      # Ícone Linux / bandeja
│   └── tray-icon.png # Ícone da bandeja do sistema
├── .github/
│   └── workflows/
│       └── release.yml  # CI/CD — gera instaladores automaticamente
└── package.json
```

---

## 📄 Licença

**GNU General Public License v3.0** — veja [LICENSE](LICENSE)

Você é livre para usar, modificar e distribuir este software, desde que mantenha a mesma licença em trabalhos derivados.
