# Variáveis de ambiente e secrets — Center Pet

Referência **única** das variáveis por repositório, mais secrets de CI e hospedagem.

---

## Repositório `center-pet-api`

### Arquivos `.env` (dotenv-flow)

Modelo: [.env.example](.env.example). Arquivos: `.env`, `.env.development`, `.env.production`.

| Variável | Obrigatória | Origem / onde obter |
|----------|-------------|----------------------|
| `PORT` | Não | **Render** injeta no deploy. Local: fallback `5000` em `server.js`. |
| `NODE_ENV` | Recomendado | `development` \| `production` — npm ou **Render**. |
| `MONGO_URI` | Sim | **MongoDB Atlas** → Connect → string SRV. |
| `JWT_SECRET` | Sim | Gerar localmente (ex.: `openssl rand -base64 48`); mesmo no **Render**. |
| `APP_SECRET` | Não* | Controllers adopter/ong. *Há fallback fraco no código se vazio — **defina em produção**. |
| `FRONTEND_URL` | Para e-mails | URL do front (**Netlify** / **Vercel**) — links de reset e adoção. |
| `EMAIL_SERVICE` | Para e-mail | Ex.: `gmail` (Nodemailer). |
| `EMAIL_USER` | Para e-mail | Conta de envio. |
| `EMAIL_PASS` | Para e-mail | Gmail: **senha de app** (Google → Segurança). |
| `NEW_RELIC_LICENSE_KEY` | Não | **New Relic** → license key (APM Node). |
| `NEW_RELIC_APP_NAME` | Não | Nome no APM; fallback em `newrelic.js`: `center-pet-api`. |

### GitHub Actions (repo API)

| Secret | Uso |
|--------|-----|
| `SONAR_TOKEN` | SonarCloud |
| `SONAR_ORGANIZATION` | SonarCloud |
| `SONAR_PROJECT_KEY` | Projeto Sonar **da API** |
| `WAPITI_TARGET_URL` | Workflow DAST (`wapiti.yml`) — URL pública da API |

### Render (hospedagem API)

Definir no painel do serviço as mesmas chaves de produção (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `EMAIL_*`, `NEW_RELIC_*`, etc.). `PORT` costuma ser automático.

---

## Repositório `center-pet-mobile`

### Arquivos `.env`

Modelo: [.env.example](.env.example). Arquivos: `.env.development`, `.env.production`, `.env.test`.

| Variável | Obrigatória | Origem / onde obter |
|----------|-------------|----------------------|
| `EXPO_PUBLIC_API_URL` | Não* | Base da API (**Render** ou local). *Fallback em `src-mobile/config/api.js`. **Não** coloque segredos em `EXPO_PUBLIC_*`. |
| `NEW_RELIC_IOS_APP_TOKEN` | Não | **New Relic** → Mobile → iOS → application token. |
| `NEW_RELIC_ANDROID_APP_TOKEN` | Não | **New Relic** → Mobile → Android → application token. |

Tokens New Relic: lidos em `app.config.js` no **prebuild**; no **EAS** use `eas secret:create` ou envs do perfil de build.

### GitHub Actions (repo mobile)

| Secret | Uso |
|--------|-----|
| `SONAR_TOKEN` | SonarCloud |
| `SONAR_ORGANIZATION` | SonarCloud |
| `SONAR_PROJECT_KEY` | Projeto Sonar **do app** (chave diferente da API) |

---

## Observações

- **CodeQL** (API e mobile): sem secrets extras no GitHub.
- **Sonar:** um projeto SonarCloud **por repositório** → `SONAR_PROJECT_KEY` distinto em cada repo.
- **Wapiti** existe só no repositório da **API**.
