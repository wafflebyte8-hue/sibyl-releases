// Sibyl in the browser: a minimal WASI host + a thin UCI wrapper around the WebAssembly engine.
// Works in a Web Worker (importScripts) and in Node (require) for testing.
(function (root) {
  'use strict';

  function makeWasi(getMemory, onLine) {
    const decoder = new TextDecoder();
    let pending = '';
    const ok = 0, badf = 8, spipe = 70;
    const view = () => new DataView(getMemory().buffer);
    return {
      fd_write(fd, iovs, iovsLen, nwrittenPtr) {
        const mem = getMemory();
        const dv = new DataView(mem.buffer);
        let total = 0;
        let text = '';
        for (let i = 0; i < iovsLen; i++) {
          const ptr = dv.getUint32(iovs + i * 8, true);
          const len = dv.getUint32(iovs + i * 8 + 4, true);
          text += decoder.decode(new Uint8Array(mem.buffer, ptr, len), { stream: true });
          total += len;
        }
        if (fd === 1 || fd === 2) {
          pending += text;
          let nl;
          while ((nl = pending.indexOf('\n')) >= 0) {
            const line = pending.slice(0, nl);
            pending = pending.slice(nl + 1);
            if (line.length) onLine(line, fd);
          }
        }
        dv.setUint32(nwrittenPtr, total, true);
        return ok;
      },
      fd_read(fd, iovs, iovsLen, nreadPtr) { view().setUint32(nreadPtr, 0, true); return ok; },
      fd_close() { return ok; },
      fd_seek() { return spipe; },
      fd_fdstat_get(fd, statPtr) {
        if (fd > 2) return badf;
        const dv = view();
        dv.setUint8(statPtr, 2);            // character device
        dv.setUint16(statPtr + 2, 0, true); // flags
        dv.setBigUint64(statPtr + 8, 0xffffffffffffffffn, true);
        dv.setBigUint64(statPtr + 16, 0xffffffffffffffffn, true);
        return ok;
      },
      environ_sizes_get(countPtr, sizePtr) {
        const dv = view();
        dv.setUint32(countPtr, 0, true);
        dv.setUint32(sizePtr, 0, true);
        return ok;
      },
      environ_get() { return ok; },
      clock_time_get(clockId, precision, timePtr) {
        const ns = clockId === 0
          ? BigInt(Date.now()) * 1000000n
          : BigInt(Math.round(performance.now() * 1e6));
        view().setBigUint64(timePtr, ns, true);
        return ok;
      },
      random_get(buf, len) {
        const mem = getMemory();
        for (let off = 0; off < len; off += 65536) {
          crypto.getRandomValues(new Uint8Array(mem.buffer, buf + off, Math.min(65536, len - off)));
        }
        return ok;
      },
      proc_exit(code) { throw new Error('engine exited with code ' + code); },
    };
  }

  class SibylEngine {
    constructor(onLine) {
      this.onLine = onLine || (() => {});
      this.ex = null;
    }
    async init(wasmBytes, hashMb) {
      const wasi = makeWasi(() => this.ex.memory, (line, fd) => this.onLine(line, fd));
      const { instance } = await WebAssembly.instantiate(wasmBytes, { wasi_snapshot_preview1: wasi });
      this.ex = instance.exports;
      this.ex._initialize();
      this.ex.sibyl_init(hashMb || 32);
    }
    // kind: 0 = NNUE, 1 = Mind, 2 = lexicon text
    load(kind, bytes) {
      const p = this.ex.sibyl_alloc(bytes.length);
      new Uint8Array(this.ex.memory.buffer, p, bytes.length).set(bytes);
      const okLoaded = this.ex.sibyl_load(kind, p, bytes.length);
      this.ex.sibyl_free(p);
      return okLoaded === 1;
    }
    command(line) {
      const enc = new TextEncoder().encode(line + '\0');
      const p = this.ex.sibyl_alloc(enc.length);
      new Uint8Array(this.ex.memory.buffer, p, enc.length).set(enc);
      this.ex.sibyl_command(p);
      this.ex.sibyl_free(p);
    }
  }

  root.SibylEngine = SibylEngine;
  if (typeof module !== 'undefined') module.exports = { SibylEngine };
})(typeof self !== 'undefined' ? self : globalThis);
// Web Worker: downloads Sibyl (engine + networks), then runs UCI commands and streams every line back.
/* global SibylEngine */
let engine = null;

const FILES = [
  { name: 'sibyl.wasm', label: 'engine', kind: 'wasm', size: 553142 },
  { name: 'calculator.wasm', label: 'Calculator network', kind: 0, size: 14027088, planes: 2, container: true },
  { name: 'mind.wasm', label: 'Mind network', kind: 1, size: 39162784, planes: 2, container: true },
  { name: 'lexicon.txt', label: 'dictionary', kind: 2, size: 60073 },
];

async function fetchBytes(url, onBytes) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('could not download ' + url + ' (' + res.status + ')');
  if (!res.body || !res.body.getReader) {
    const buf = new Uint8Array(await res.arrayBuffer());
    onBytes(buf.length);
    return buf;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    n += value.length;
    onBytes(value.length);
  }
  const out = new Uint8Array(n);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

async function gunzip(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('this browser cannot decompress the networks (no DecompressionStream)');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// The networks travel inside minimal WebAssembly modules (one custom section), because the host only serves
// standard web file types. Unwrap: magic + version, section id 0, LEB128 size, LEB128 name length, name, payload.
function unwrapContainer(bytes) {
  if (bytes[0] !== 0 || bytes[1] !== 0x61 || bytes[2] !== 0x73 || bytes[3] !== 0x6d || bytes[8] !== 0) {
    throw new Error('network file is damaged');
  }
  let off = 9;
  const leb = () => {
    let result = 0, mul = 1, b;
    do { b = bytes[off++]; result += (b & 0x7f) * mul; mul *= 128; } while (b & 0x80);
    return result;
  };
  const size = leb();
  const start = off;
  const nameLen = leb();
  off += nameLen;
  return bytes.subarray(off, start + size);
}

// the networks are stored as byte planes (all byte 0s, then all byte 1s, ...) because that compresses far better
function unshuffle(planar, k) {
  const n = planar.length / k;
  const out = new Uint8Array(planar.length);
  for (let p = 0; p < k; p++) {
    const src = planar.subarray(p * n, (p + 1) * n);
    for (let i = 0, j = p; i < n; i++, j += k) out[j] = src[i];
  }
  return out;
}

async function init(base, given) {
  const total = FILES.reduce((s, f) => s + f.size, 0);
  let loaded = 0;
  const report = (label) => postMessage({ type: 'progress', loaded, total, label });
  const blobs = {};
  if (given) {                       // the page already read the files (e.g. inside an Android app)
    for (const f of FILES) blobs[f.name] = new Uint8Array(given[f.name]);
    if (given['sibyl-nosimd.wasm']) blobs['sibyl-nosimd.wasm'] = new Uint8Array(given['sibyl-nosimd.wasm']);
  } else {
    await Promise.all(FILES.map(async (f) => {
      blobs[f.name] = await fetchBytes(new URL(f.name, base).href, (n) => { loaded += n; report(f.label); });
    }));
  }
  postMessage({ type: 'progress', loaded: total, total, label: 'waking Sibyl' });
  engine = new SibylEngine((line) => postMessage({ type: 'line', line }));
  try {
    await engine.init(blobs['sibyl.wasm'], 48);
  } catch (err) {
    // older engines without WebAssembly SIMD: use the plain build if it was shipped alongside
    const plain = blobs['sibyl-nosimd.wasm'] ||
      await fetch(new URL('sibyl-nosimd.wasm', base).href).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    if (!plain) throw err;
    engine = new SibylEngine((line) => postMessage({ type: 'line', line }));
    await engine.init(new Uint8Array(plain), 48);
  }
  for (const f of FILES) {
    if (f.kind === 'wasm') continue;
    let bytes = blobs[f.name];
    if (f.container) bytes = unwrapContainer(bytes);
    if (f.planes) bytes = unshuffle(await gunzip(bytes), f.planes);
    if (!engine.load(f.kind, bytes)) throw new Error('could not load the ' + f.label);
  }
  postMessage({ type: 'lexicon', text: new TextDecoder().decode(blobs['lexicon.txt']) });
  engine.command('setoption name Thoughts value Both');
  postMessage({ type: 'ready' });
}

self.onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg.type === 'init') {
      await init(msg.base || self.location.href, msg.files);
    } else if (msg.type === 'run') {
      for (const c of msg.commands) engine.command(c);
      postMessage({ type: 'done', id: msg.id });
    }
  } catch (err) {
    postMessage({ type: 'error', message: String(err && err.message || err), id: msg.id });
  }
};
