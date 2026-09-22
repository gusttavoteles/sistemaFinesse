import assert from 'node:assert/strict'
import test from 'node:test'
import { pixKey, receivableMessage, whatsappUrl, winbackMessages } from '../src/lib/communicationMessages.js'

test('communication templates keep the PIX key and requested emojis', () => {
  const billing = receivableMessage({ name: 'Ana', amount: 'R$ 50,00', dueDate: '30/09/2026' })
  const newPieces = winbackMessages.newPieces('Ana')
  const buyAgain = winbackMessages.buyAgain('Ana')

  assert.match(billing, /finessesuporte\.25@gmail\.com/)
  assert.match(billing, /✨/)
  assert.match(billing, /💳/)
  assert.match(billing, /💎/)
  assert.match(newPieces, /1️⃣/)
  assert.match(newPieces, /💍/)
  assert.match(buyAgain, /🤍/)
  assert.equal(pixKey, 'finessesuporte.25@gmail.com')
})

test('WhatsApp opens the conversation without query text so the Unicode clipboard message is pasted directly', () => {
  const text = winbackMessages.newPieces('Joana')
  const url = whatsappUrl('11999999999')
  assert.equal(url, 'https://wa.me/5511999999999')
  assert.match(text, /✨/)
  assert.match(text, /💎/)
  assert.doesNotMatch(text, /\*\*/)
})
