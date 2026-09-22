const emoji = {
  sparkle: '\u2728',
  gem: '\u{1F48E}',
  whiteHeart: '\u{1F90D}',
  ring: '\u{1F48D}',
  card: '\u{1F4B3}',
}

const option = (number) => `${number}\uFE0F\u20E3`

export const pixKey = 'finessesuporte.25@gmail.com'

export function normalizeWhatsAppText(text) {
  return String(text).normalize('NFC')
}

export function whatsappUrl(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return number.length > 2 ? `https://wa.me/${number}` : ''
}

export function receivableMessage({ name = 'cliente', amount, dueDate }) {
  return normalizeWhatsAppText(`${emoji.sparkle} Olá, ${name}! Tudo bem?
Passando com carinho para lembrar que o pagamento referente à sua compra na *Finesse Joias* está pendente no valor de *${amount}*, com vencimento em *${dueDate}*.
${emoji.card} Você pode realizar o pagamento pela chave PIX abaixo:
*${pixKey}*
Caso o pagamento já tenha sido efetuado, por favor, desconsidere esta mensagem e, se possível, envie o comprovante. ${emoji.gem}
Se precisar de alguma informação ou desejar combinar uma nova data, estamos à disposição para ajudar. ${emoji.whiteHeart}
Atenciosamente,
*Finesse Joias | Prata 925* ${emoji.sparkle}`)
}

export const winbackMessages = {
  newPieces: (name) => normalizeWhatsAppText(`${emoji.sparkle} Olá, ${name}! Temos novidades na *Finesse Joias*! ${emoji.gem}
Acabaram de chegar novas peças em *Prata 925*, escolhidas especialmente para deixar seus looks ainda mais elegantes e sofisticados. ${emoji.whiteHeart}
Quer receber as novidades em primeira mão?
Responda com uma das opções:
*${option(1)} Quero ver as novidades*
*${option(2)} Quero ver anéis* ${emoji.ring}
*${option(3)} Quero ver colares* ${emoji.sparkle}
*${option(4)} Quero ver brincos* ${emoji.whiteHeart}
*${option(5)} Quero ver pulseiras* ${emoji.gem}
É só responder com o número da opção desejada! Será um prazer ajudar você a encontrar sua nova joia favorita. ${emoji.sparkle}
*Finesse Joias | Prata 925*`),
  buyAgain: (name) => normalizeWhatsAppText(`${emoji.sparkle} Olá, ${name}! Sentimos sua falta por aqui! ${emoji.whiteHeart}
Já faz algum tempo desde a sua última compra na *Finesse Joias*, e queremos convidar você para conhecer as novidades que acabaram de chegar. ${emoji.gem}
São novas peças em *Prata 925*, selecionadas para combinar com diferentes estilos e tornar seus momentos ainda mais especiais. ${emoji.sparkle}
O que você gostaria de ver?
*${option(1)} Novidades*
*${option(2)} Anéis* ${emoji.ring}
*${option(3)} Colares* ${emoji.sparkle}
*${option(4)} Brincos* ${emoji.whiteHeart}
*${option(5)} Pulseiras* ${emoji.gem}
Responda com o número da opção desejada e enviaremos uma seleção especial para você!
*Finesse Joias | Prata 925* ${emoji.sparkle}`),
}
