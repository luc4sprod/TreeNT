// Gera um icon.ico válido com múltiplos tamanhos usando apenas Node.js puro
// Sem dependências externas

const fs = require('fs');
const path = require('path');

// Gera um bitmap BMP 32x32 RGBA simples (verde escuro com folha)
function createBMP(size) {
  const pixels = size * size;
  const dataSize = pixels * 4;
  const fileSize = 54 + dataSize;
  const buf = Buffer.alloc(fileSize);

  // BMP header
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(54, 10);
  // DIB header
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(size, 18);
  buf.writeInt32LE(-size, 22); // negative = top-down
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(32, 28);
  buf.writeUInt32LE(0, 30); // BI_RGB
  buf.writeUInt32LE(dataSize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  buf.writeUInt32LE(0, 46);
  buf.writeUInt32LE(0, 50);

  const cx = size / 2, cy = size / 2, r = size * 0.42;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = 54 + (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist <= r) {
        // Background circle: dark green
        buf[idx]   = 20;   // B
        buf[idx+1] = 100;  // G
        buf[idx+2] = 40;   // R
        buf[idx+3] = 255;  // A

        // Trunk: thin vertical line bottom-center
        const trunkW = size * 0.06;
        if (Math.abs(dx) < trunkW && dy > size * 0.05 && dy < size * 0.28) {
          buf[idx]   = 80;
          buf[idx+1] = 140;
          buf[idx+2] = 60;
          buf[idx+3] = 255;
        }

        // Left branch
        const lbx = dx + size*0.12, lby = dy - size*0.05;
        const lbdist = Math.sqrt(lbx*lbx + lby*lby);
        if (lbdist < size * 0.26 && dy < size * 0.12) {
          buf[idx]   = 60;
          buf[idx+1] = 200;
          buf[idx+2] = 80;
          buf[idx+3] = 255;
        }

        // Right branch
        const rbx = dx - size*0.12, rby = dy - size*0.05;
        const rbdist = Math.sqrt(rbx*rbx + rby*rby);
        if (rbdist < size * 0.26 && dy < size * 0.12) {
          buf[idx]   = 60;
          buf[idx+1] = 200;
          buf[idx+2] = 80;
          buf[idx+3] = 255;
        }

        // Top circle (main canopy)
        const tdist = Math.sqrt(dx*dx + (dy+size*0.08)*(dy+size*0.08));
        if (tdist < size * 0.32) {
          buf[idx]   = 40;
          buf[idx+1] = 180;
          buf[idx+2] = 70;
          buf[idx+3] = 255;
        }
      } else {
        // Transparent outside circle
        buf[idx]   = 0;
        buf[idx+1] = 0;
        buf[idx+2] = 0;
        buf[idx+3] = 0;
      }
    }
  }
  return buf;
}

// ICO format: header + directory + image data
function createICO(sizes) {
  const images = sizes.map(s => {
    const bmp = createBMP(s);
    // For ICO, BMP data starts at DIB header (skip BMP file header = 14 bytes)
    // but we embed as PNG-like raw; actually for simplicity use raw BMP minus file header
    return { size: s, data: bmp.slice(14) }; // strip BMP file header
  });

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * images.length;
  const dataOffset = headerSize + dirSize;

  // Calculate offsets
  let offset = dataOffset;
  images.forEach(img => { img.offset = offset; offset += img.data.length; });

  const totalSize = offset;
  const buf = Buffer.alloc(totalSize);

  // ICO header
  buf.writeUInt16LE(0, 0);       // reserved
  buf.writeUInt16LE(1, 2);       // type: 1=ICO
  buf.writeUInt16LE(images.length, 4);

  // Directory entries
  images.forEach((img, i) => {
    const base = 6 + i * 16;
    buf.writeUInt8(img.size >= 256 ? 0 : img.size, base);     // width (0=256)
    buf.writeUInt8(img.size >= 256 ? 0 : img.size, base + 1); // height
    buf.writeUInt8(0, base + 2);   // color count
    buf.writeUInt8(0, base + 3);   // reserved
    buf.writeUInt16LE(1, base + 4); // planes
    buf.writeUInt16LE(32, base + 6); // bit count
    buf.writeUInt32LE(img.data.length, base + 8);
    buf.writeUInt32LE(img.offset, base + 12);
  });

  // Image data
  images.forEach(img => { img.data.copy(buf, img.offset); });

  return buf;
}

// Generate ICO with common sizes
const ico = createICO([16, 32, 48, 64, 128, 256]);
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), ico);
console.log('icon.ico gerado com sucesso! Tamanho:', ico.length, 'bytes');

// Also generate a valid 512x512 PNG for icon.png
// Minimal valid PNG with a green circle
function createPNG(size) {
  // We'll create a simple valid PNG using raw chunks
  const zlib = require('zlib');

  const width = size, height = size;
  // RGBA scanlines with filter byte 0 per row
  const raw = Buffer.alloc(height * (1 + width * 4));
  const cx = width / 2, cy = height / 2, r = width * 0.42;

  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const idx = y * (1 + width * 4) + 1 + x * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= r) {
        const tdist = Math.sqrt(dx*dx + (dy+size*0.08)*(dy+size*0.08));
        if (tdist < size * 0.32) {
          raw[idx]   = 70;  // R
          raw[idx+1] = 180; // G
          raw[idx+2] = 40;  // B
          raw[idx+3] = 255; // A
        } else {
          raw[idx]   = 20;
          raw[idx+1] = 100;
          raw[idx+2] = 40;
          raw[idx+3] = 255;
        }
      } else {
        raw[idx] = raw[idx+1] = raw[idx+2] = raw[idx+3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (const byte of buf) {
      crc ^= byte;
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const b = Buffer.alloc(12 + data.length);
    b.writeUInt32BE(data.length, 0);
    b.write(type, 4, 'ascii');
    data.copy(b, 8);
    b.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type), data])), 8 + data.length);
    return b;
  }

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const png512 = createPNG(512);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), png512);
console.log('icon.png gerado! Tamanho:', png512.length, 'bytes');

const png32 = createPNG(32);
fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), png32);
console.log('tray-icon.png gerado! Tamanho:', png32.length, 'bytes');
