import { deflateRawSync } from 'node:zlib';

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

export function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [name, data] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name);
    const crc = crc32(data);
    const compressed = deflateRawSync(Buffer.from(data));
    const local = zipLocalHeader(nameBytes.length, compressed.length, data.length, crc);
    localParts.push(local, nameBytes, compressed);
    centralParts.push(zipCentralHeader(nameBytes.length, compressed.length, data.length, crc, offset), nameBytes);
    offset += local.length + nameBytes.length + compressed.length;
  }
  const centralStart = offset;
  const central = Buffer.concat(centralParts);
  const eocd = zipEnd(Object.keys(entries).length, central.length, centralStart);
  return Buffer.concat([...localParts, central, eocd]);
}

function zipLocalHeader(nameLength, compressedSize, uncompressedSize, crc) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0x21, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressedSize, 18);
  header.writeUInt32LE(uncompressedSize, 22);
  header.writeUInt16LE(nameLength, 26);
  return header;
}

function zipCentralHeader(nameLength, compressedSize, uncompressedSize, crc, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0x21, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(compressedSize, 20);
  header.writeUInt32LE(uncompressedSize, 24);
  header.writeUInt16LE(nameLength, 28);
  header.writeUInt32LE(offset, 42);
  return header;
}

function zipEnd(entryCount, centralBytes, centralStart) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralBytes, 12);
  header.writeUInt32LE(centralStart, 16);
  return header;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}
