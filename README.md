# 🖥️ Servidores Info — Portal de Servidores e Apps Parceiros

Portal web moderno para exibição e gerenciamento de **Servidores IPTV**, **Apps Parceiros** e **canais de suporte/apoio**.

![Portal Preview](assets/devices-banner.png)

---

## ✨ Funcionalidades

- 📡 **Catálogo de Servidores** — Listagem visual com filtros por tipo (Híbrido, IPTV, Android)
- 📱 **Apps Parceiros** — Catálogo de aplicativos compatíveis com vinculação a servidores
- 📞 **Central de Apoio** — Página de contatos com WhatsApp, Telegram, E-mail e mais
- 🔍 **Pesquisa em tempo real** — Busca instantânea por nome, tipo ou número de telas
- 🛡️ **Painel Administrativo** — CRUD completo para servidores, apps, planos e contatos
- 📊 **Página de detalhes** — Exibição individual de cada servidor com planos e apps vinculados
- 🌙 **Design dark mode premium** — Interface moderna com glassmorphism e animações

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Windows 10/11**
- **Python 3** (apenas para instalar o PHP automaticamente)

### Passo 1 — Instalar o PHP Portátil

Execute o script para baixar e extrair o PHP automaticamente:

```powershell
python install_php.py
```

Isso criará a pasta `php/` com o PHP pronto para uso.

### Passo 2 — Iniciar o Servidor Local

Dê dois cliques no arquivo `INICIAR_SERVIDOR.bat` ou execute no terminal:

```powershell
.\php\php.exe -S localhost:8000
```

### Passo 3 — Acessar o Portal

- 🌐 **Portal Público:** [http://localhost:8000/index.html](http://localhost:8000/index.html)
- ⚙️ **Painel Admin:** [http://localhost:8000/admin.php](http://localhost:8000/admin.php)

---

## 📁 Estrutura do Projeto

```
Servidores Info/
├── index.html          # Página principal do portal (público)
├── server.html         # Página de detalhes de cada servidor
├── admin.php           # Painel administrativo
├── api.php             # API REST (CRUD de servidores, apps, contatos)
├── db.php              # Conexão e criação automática do banco SQLite
├── portal.js           # Lógica do portal público
├── script.js           # Lógica do painel administrativo
├── style.css           # Estilos visuais globais
├── apoio.php           # Redirecionamento para aba de apoio
├── export_data.php     # Exportação de dados em JSON estático
├── install_php.py      # Script para instalar o PHP portátil
├── import_servers.py   # Script para importar servidores em lote
├── add_apps.py         # Script para adicionar apps em lote
├── INICIAR_SERVIDOR.bat # Atalho para iniciar o servidor local
├── database.sqlite     # Banco de dados local (não versionado)
├── php/                # PHP portátil para Windows (não versionado)
└── assets/
    ├── logo-central-v2.png
    ├── background.png
    ├── devices-banner.png
    ├── logos/           # Logos dos servidores
    └── server/          # Imagens dos servidores
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5 + CSS3** | Interface do portal e admin |
| **JavaScript (Vanilla)** | Lógica de frontend e renderização dinâmica |
| **PHP 8.x** | Backend da API e painel administrativo |
| **SQLite** | Banco de dados leve e portátil |
| **Python 3** | Scripts auxiliares de instalação e importação |

---

## 📄 Licença

Projeto desenvolvido por **DPlay Tecnologia e Inovações**.
