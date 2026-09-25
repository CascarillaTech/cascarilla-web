# Despregue do bot de socios (Telegram, fase 1 — só consultas)

Runbook para cando teñas as credenciais a man. Todo isto corre no VPS
(`ssh vps`), no mesmo stack Docker que xa usas en `/home/alberto/server/`
(portainer, minio, anti-bot-telegram, nginx-proxy-manager).

## 0. O que che fai falla antes de empezar

- **API key de OpenRouter** (openrouter.ai/settings/keys — con $0 de crédito
  xa chega para este bot, ver [`deploy/.env.example`](deploy/.env.example)).
  Confirma nese momento que o modelo `:free` posto en
  [`deploy/config.yaml`](deploy/config.yaml) segue existindo — o catálogo
  gratis rota.
- **Token de bot de Telegram novo**, de @BotFather (`/newbot`). Non
  reutilices o de `anti-bot-telegram`: xa está a facer outra cousa
  (verificación anti-spam de grupos) e un token só pode ter un proceso
  escoitando.
- **Ter republicada** a implementación do Apps Script co `doGet` novo (ver
  [`tools/registration/README.md`](../registration/README.md#endpoint-de-lectura-para-o-bot-doget))
  e a propiedade `BOT_TOKEN` configurada aí.

## 1. Levar o código ao VPS

```bash
ssh vps
cd ~/server
git clone https://github.com/<org>/cascarilla-web apps/cascarilla-web
# (ou copia só tools/socios-bot-mcp se non queres o repo enteiro no VPS)
ln -s apps/cascarilla-web/tools/socios-bot-mcp apps/socios-bot-mcp
```

O `docker-compose.snippet.yml` (paso 2) monta `./apps/socios-bot-mcp` dentro
do contedor — axusta a ruta se organizas isto doutro xeito.

## 2. Engadir o servizo ao docker-compose.yml existente

1. Engade `hermes_socios_data:` ao bloque `volumes:` de arriba do todo.
2. Pega o contido de
   [`deploy/docker-compose.snippet.yml`](deploy/docker-compose.snippet.yml)
   coma un servizo máis (mesmo nivel que `anti-bot-telegram`).
3. Engade as liñas de
   [`deploy/.env.example`](deploy/.env.example) ao `.env` real do proxecto
   (`~/server/.env`), coas túas credenciais de verdade.

## 3. Configurar o perfil "socios" de Hermes

Antes do primeiro `docker compose up`, crea o volume e pon dentro os
ficheiros de configuración (o volume `hermes_socios_data` mapea a
`/opt/data` dentro do contedor, e o perfil `socios` — fixado por
`HERMES_PROFILE=socios` no compose — vive en `/opt/data/socios/`):

```bash
docker volume create server_hermes_socios_data  # ou o nome que xere compose
docker run --rm -v server_hermes_socios_data:/opt/data alpine \
  mkdir -p /opt/data/socios
```

Copia [`deploy/config.yaml`](deploy/config.yaml) (rechea antes os valores
reais de `APPS_SCRIPT_URL` e `BOT_TOKEN`) e
[`deploy/SOUL.md`](deploy/SOUL.md) a `/opt/data/socios/` dese volume (por
exemplo, montando o volume temporalmente ou con `docker cp` unha vez o
contedor estea arrincado por primeira vez).

## 4. Arrincar

```bash
cd ~/server
docker compose up -d hermes-socios
docker compose logs -f hermes-socios
```

Verifica nos logs que carga o perfil `socios`, que conecta co MCP `socios`
(sen erros de `APPS_SCRIPT_URL`/`BOT_TOKEN`) e que o gateway de Telegram
arrinca (polling).

## 5. Probar

Fala co bot novo en Telegram:

1. Pregunta polo email dun socio real de proba → debe confirmar número de
   socio, cota e estado.
2. Pregunta por un email que non existe → debe dicir que non consta, sen
   inventar nada.
3. Pídelle "a lista de todos os socios" → debe negarse (non ten esa
   capacidade, así o di o `SOUL.md`).
4. Reinicia o contedor (`docker compose restart hermes-socios`) e comproba
   que segue respondendo — a config e memoria persisten no volume.
