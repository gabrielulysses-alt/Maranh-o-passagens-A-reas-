import makeWASocket, { useMultiFileAuthState, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import Hapi from '@hapi/hapi'
import pino from 'pino'
import fs from 'fs'

const logger = pino({ level: 'info' })

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    browser: Browsers.appropriate('Desktop'),
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  })

  // Lista grupos disponíveis (nome e JID)
  server.route({
    method: 'GET',
    path: '/groups',
    handler: async () => {
      const chats = await sock.groupFetchAllParticipating()
      const groups = Object.values(chats).map(g => ({
        subject: g.subject,
        id: g.id
      }))
      return groups
    }
  })

  // Envia mensagem para um grupo já existente (precisa ser membro)
  server.route({
    method: 'POST',
    path: '/send',
    options: { payload: { parse: true, allow: 'application/json' } },
    handler: async (request, h) => {
      const { jid, message } = request.payload || {}
      if (!jid || !message) {
        return h.response({ error: 'jid e message são obrigatórios' }).code(400)
      }
      try {
        await sock.sendMessage(jid, { text: message })
        return { ok: true }
      } catch (e) {
        logger.error(e)
        return h.response({ error: e.message }).code(500)
      }
    }
  })

  await server.start()
  logger.info('Sender WhatsApp online em ' + server.info.uri)
}

start().catch(err => {
  console.error('Falha ao iniciar sender:', err)
  process.exit(1)
})
