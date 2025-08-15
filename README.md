# Sender WhatsApp (Baileys)

Inicializa um cliente WhatsApp Web (precisa escanear QR) e expõe endpoints:

- `GET /groups` → lista grupos (subject e jid) onde sua conta participa.
- `POST /send`  → envia mensagem para um `jid` de grupo.

## Uso
```bash
npm install
npm start
# escaneie o QR no terminal
curl http://localhost:3000/groups
curl -X POST http://localhost:3000/send -H "Content-Type: application/json" -d '{"jid":"<ID>@g.us","message":"Olá grupo!"}'
```
