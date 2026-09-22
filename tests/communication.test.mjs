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

test('WhatsApp link carries the complete Unicode message and normalizes the phone number', () => {
  const messages = [
    receivableMessage({ name: 'Joana', amount: 'R$ 40,00', dueDate: '30/09/2026' }),
    winbackMessages.newPieces('Joana'),
    winbackMessages.buyAgain('Joana'),
  ]

  for (const text of messages) {
    const url = whatsappUrl('(11) 99999-9999', text)
    const parsed = new URL(url)
    assert.equal(parsed.origin + parsed.pathname, 'https://wa.me/5511999999999')
    assert.equal(parsed.searchParams.get('text'), text)
    assert.match(text, /✨/)
    assert.doesNotMatch(text, /\*\*/)
  }
  assert.match(messages[0], /R\$ 40,00/)
  assert.match(messages[0], /30\/09\/2026/)
  assert.match(messages[1], /💎/)
  assert.match(messages[2], /🤍/)
})

test('WhatsApp URL is not created when a usable phone number is missing', () => {
  assert.equal(whatsappUrl('', 'mensagem'), '')
  assert.equal(whatsappUrl('---', 'mensagem'), '')
})
