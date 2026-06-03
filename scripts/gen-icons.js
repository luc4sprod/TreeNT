#!/usr/bin/env node
/**
 * Gera ícones placeholder para desenvolvimento.
 * Execute: node scripts/gen-icons.js
 * Para produção, substitua os arquivos em assets/ com ícones reais.
 */

const fs = require('fs')
const path = require('path')

// Minimal 1×1 white PNG (valid PNG header + IDAT)
// Apenas para o build não falhar sem ícone real.
const PNG_1x1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4' +
  '890000000a49444154789c6260000000000200016221bc330000000049454e44ae426082',
  'hex'
)

const assetsDir = path.join(__dirname, '..', 'assets')
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

const files = ['icon.png', 'tray-icon.png']
files.forEach(f => {
  const p = path.join(assetsDir, f)
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, PNG_1x1)
    console.log(`Criado placeholder: ${f}`)
  } else {
    console.log(`Já existe: ${f}`)
  }
})

console.log('\n⚠️  Lembre de substituir os ícones em assets/ antes de distribuir!')
