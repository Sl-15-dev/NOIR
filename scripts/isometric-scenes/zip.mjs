function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}

// Store the small bundle without a compression library so the viewer also works offline.
export function makeZip(files) {
  const output = [];
  const directory = [];
  const encode = new TextEncoder();
  let offset = 0;
  let directoryLength = 0;
  for (const [filename, content] of files) {
    const name = encode.encode(filename);
    const bytes = encode.encode(content);
    const checksum = crc32(bytes);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(12, 0x21, true);
    local.setUint32(14, checksum, true);
    local.setUint32(18, bytes.length, true);
    local.setUint32(22, bytes.length, true);
    local.setUint16(26, name.length, true);
    output.push(local.buffer, name, bytes);
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(14, 0x21, true);
    central.setUint32(16, checksum, true);
    central.setUint32(20, bytes.length, true);
    central.setUint32(24, bytes.length, true);
    central.setUint16(28, name.length, true);
    central.setUint32(42, offset, true);
    directory.push(central.buffer, name);
    directoryLength += central.byteLength + name.length;
    offset += local.byteLength + name.length + bytes.length;
  }
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, directoryLength, true);
  end.setUint32(16, offset, true);
  return new Blob([...output, ...directory, end.buffer], { type: 'application/zip' });
}
