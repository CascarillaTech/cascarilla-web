# Despregue do bot de socios (Telegram)

Corre no VPS (`ssh vps`), no mesmo stack Docker que
`/home/alberto/server/` (portainer, minio, anti-bot-telegram,
nginx-proxy-manager). **Xa está despregado** — este documento describe o
proceso real seguido (útil para redespregar noutro sitio ou recordar como
funciona).

## 0. Credenciais que fan falla

- **API key de OpenRouter** (openrouter.ai/settings/keys — con $0 de
  crédito xa vale). Crea unha clave dedicada con **límite de crédito $0**
  (Custom amount → 0): así as peticións se rexeitan en vez de gastar diñeiro
  se algunha vez usase un modelo de pago por erro.
- **Token de bot de Telegram novo**, de @BotFather (`/newbot`). Non
  reutilizar o de `anti-bot-telegram` (fai outra cousa, e un token só pode
  ter un proceso escoitando).
- **BOT_TOKEN do Apps Script** (segredo compartido, calquera cadea
  aleatoria) — configurado nas Propiedades do script de
  [`tools/registration/`](../registration/) e no `.env` do VPS.

## 1. Segredos no `.env` do VPS

En `~/server/.env` (compartido entre servizos vía `env_file: .env`), con
**nomes que non colisionen** cos xa existentes:

```
OPENROUTER_API_KEY=sk-or-v1-...
TELEGRAM_BOT_TOKEN_CASCARILLA_ADMIN=...   # NON "TELEGRAM_BOT_TOKEN" a secas — iso xa o usa anti-bot-telegram
APPS_SCRIPT_BOT_TOKEN=...                 # o mesmo valor que puxeches en Propiedades do script
```

## 2. Código no VPS

```bash
ssh vps
mkdir -p ~/server/apps/socios-bot-mcp
scp tools/socios-bot-mcp/{index.js,package.json,package-lock.json} vps:~/server/apps/socios-bot-mcp/
```

Instalar dependencias co MESMO Node que despois vai executar o servidor
(o da imaxe de Hermes, non o do host — o host nin sequera ten Node):

```bash
docker pull nousresearch/hermes-agent:latest
docker run --rm --entrypoint /bin/sh \
  -v /home/alberto/server/apps/socios-bot-mcp:/opt/socios-bot-mcp \
  -w /opt/socios-bot-mcp \
  nousresearch/hermes-agent:latest -c 'npm install --omit=dev'
sudo chown -R alberto:alberto ~/server/apps/socios-bot-mcp/node_modules
```

## 3. Servizo en `docker-compose.yml`

1. Engade `hermes_socios_data:` ao bloque `volumes:` de arriba do todo.
2. Pega o contido de
   [`deploy/docker-compose.snippet.yml`](deploy/docker-compose.snippet.yml)
   coma un servizo máis.
3. `docker compose config` para validar antes de arrincar nada.

## 4. Configuración de Hermes — OLLO coa lección aprendida

**Esta imaxe Docker NON ten subcartafoles por perfil.** A raíz do volume
(`/opt/data`) XA É o perfil — Hermes xera aí mesmo `config.yaml`, `SOUL.md`,
`auth.json`, etc. na primeira arrancada. Un primeiro intento puxo
`config.yaml`/`SOUL.md` nun subcartafol `/opt/data/socios/` (nome herdado
dunha variable `HERMES_PROFILE=socios` que **non fai nada** nesta imaxe) e
Hermes ignorouno por completo, arrincando co seu modelo por defecto
(Claude Opus, sen configurar). A variable `HERMES_PROFILE` xa non está no
compose por iso — non fai falla, cada contedor xa ten o seu propio volume
illado.

Orde correcta:

```bash
docker volume create server_hermes_socios_data
docker compose up -d hermes-socios   # primeira arrancada: Hermes xera o seu config.yaml por defecto

# Agora SOBRESCRIBIR eses ficheiros cos nosos, na RAÍZ do volume:
scp tools/socios-bot-mcp/deploy/config.yaml vps:/tmp/
scp tools/socios-bot-mcp/deploy/SOUL.md vps:/tmp/
# editar /tmp/config.yaml primeiro: APPS_SCRIPT_URL e BOT_TOKEN reais
ssh vps "docker run --rm -v server_hermes_socios_data:/opt/data \
  -v /tmp/config.yaml:/tmp/config.yaml -v /tmp/SOUL.md:/tmp/SOUL.md alpine sh -c \
  'cp /tmp/config.yaml /opt/data/config.yaml && cp /tmp/SOUL.md /opt/data/SOUL.md && chown -R 1001:1001 /opt/data'"

docker compose up -d hermes-socios   # recrea coa config correcta
```

Verificar:

```bash
docker exec hermes-socios hermes status
# Debe amosar: Model: qwen/qwen3.8-27b:free · Provider: OpenRouter
#              Messaging Platforms → Telegram ✓ configured
```

## 5. Acceso aberto (GATEWAY_ALLOW_ALL_USERS)

Por defecto Hermes ignora a calquera que escriba (política de
emparellamento). Como o bot ten que responder a calquera (decisión do
usuario para `listar_socios`), o compose xa leva
`GATEWAY_ALLOW_ALL_USERS=true`. Sen isto, os logs amosan un WARNING
avisando diso.

## 6. Probar

1. Busca o bot en Telegram polo username (`hermes status` non o di — sácao
   con `curl https://api.telegram.org/bot<TOKEN>/getMe`, campo `username`).
2. Escríbelle preguntando por un email real de proba → debe confirmar
   número de socio, cota e estado.
3. Pregunta por un email que non existe → debe dicir que non consta.
4. Pídelle "lista os socios pendentes" (ou "confirmados") → debe listar
   nome + estado, sen email nin cota.
5. Pídelle calquera outra cousa (unha pregunta xeral, "cóntame un chiste")
   → debe negarse coa resposta fixa do `SOUL.md`, sen elaborar.
6. `docker compose restart hermes-socios` e comproba que segue respondendo
   — a config persiste no volume.

## Comandos útiles

```bash
docker logs hermes-socios --tail 50 -f      # logs en vivo
docker exec hermes-socios hermes status     # modelo, plataformas, gateway
docker exec hermes-socios hermes doctor     # diagnóstico xeral
docker compose restart hermes-socios        # reiniciar
```
