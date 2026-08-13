/* Turning an attached file into text — entirely in the browser.
 *
 * The file itself is never uploaded. It is read with FileReader, unpacked here,
 * and only the text it yields ends up in the field; from there it travels the
 * same path as pasted text and nothing else. That is not a nicety — the promise
 * in privacy.html is about the agreement, and a file that reached the server
 * would be the agreement by another name.
 *
 * A .docx is a ZIP holding word/document.xml, so it needs no library: the
 * central directory gives us the one entry we want and DecompressionStream
 * inflates it. Anything heavier than that belongs to a build step this project
 * does not have.
 *
 * Errors reject with an Error carrying .key (an i18n key) and .params, because
 * the caller renders them and the caller knows the language. */

window.SG = window.SG || {};

(function () {
  var MAX_MB = 15;
  var MAX_BYTES = MAX_MB * 1024 * 1024;
  var DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  var TEXT_EXT = ['txt', 'text', 'md', 'markdown'];
  var MAIN_PART = 'word/document.xml';

  function fail(key, params) {
    var error = new Error(key);
    error.key = key;
    error.params = params || {};
    return error;
  }

  function extension(name) {
    var dot = name.lastIndexOf('.');
    return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
  }

  function buffer(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(fail('app.attach.err.read')); };
      reader.readAsArrayBuffer(file);
    });
  }

  /* A Russian contract saved out of an old editor is as likely to be cp1251 as
     UTF-8, and cp1251 read as UTF-8 is unreadable rather than slightly wrong.
     Strict UTF-8 first: if it throws, the file is not UTF-8. */
  function decodeText(bytes) {
    var text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (e) {
      text = new TextDecoder('windows-1251').decode(bytes);
    }
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  }

  /* ---------- ZIP ---------- */

  function findEndOfDirectory(view) {
    // The record is 22 bytes plus a comment of up to 64 KB, and it is the last
    // thing in the file, so it is cheaper to walk backwards.
    var limit = Math.max(0, view.byteLength - 22 - 0xffff);
    for (var i = view.byteLength - 22; i >= limit; i--) {
      if (view.getUint32(i, true) === 0x06054b50) return i;
    }
    return -1;
  }

  function findEntry(view, bytes, name) {
    var end = findEndOfDirectory(view);
    if (end === -1) throw fail('app.attach.err.read');

    var count = view.getUint16(end + 10, true);
    var at = view.getUint32(end + 16, true);
    var decoder = new TextDecoder('utf-8');

    for (var i = 0; i < count; i++) {
      if (view.getUint32(at, true) !== 0x02014b50) throw fail('app.attach.err.read');
      var nameLength = view.getUint16(at + 28, true);
      var entry = {
        method: view.getUint16(at + 10, true),
        compressed: view.getUint32(at + 20, true),
        offset: view.getUint32(at + 42, true),
        name: decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength)),
      };
      if (entry.name === name) return entry;
      at += 46 + nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
    }
    return null;
  }

  function entryBytes(view, bytes, entry) {
    // The local header repeats the name and may carry different extra fields,
    // so the data offset has to be read from it rather than assumed.
    if (view.getUint32(entry.offset, true) !== 0x04034b50) throw fail('app.attach.err.read');
    var start = entry.offset + 30
      + view.getUint16(entry.offset + 26, true)
      + view.getUint16(entry.offset + 28, true);
    var data = bytes.subarray(start, start + entry.compressed);

    if (entry.method === 0) return Promise.resolve(data);
    if (entry.method !== 8) return Promise.reject(fail('app.attach.err.read'));
    if (typeof DecompressionStream !== 'function') return Promise.reject(fail('app.attach.err.browser'));

    var stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).arrayBuffer()
      .then(function (out) { return new Uint8Array(out); })
      .catch(function () { throw fail('app.attach.err.read'); });
  }

  /* ---------- WordprocessingML ---------- */

  /* Only the parts that carry text or break a line. Everything else in the
     document — styling, revision marks, section properties — is noise here, and
     a field the visitor cannot read back is worse than no attachment at all. */
  function textOf(xml) {
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw fail('app.attach.err.read');

    var out = [];

    (function walk(node) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType !== 1) continue;
        var tag = child.localName;

        if (tag === 't') { out.push(child.textContent); continue; }
        if (tag === 'tab') { out.push('\t'); continue; }
        if (tag === 'br' || tag === 'cr') { out.push('\n'); continue; }
        // Deleted text and field instructions are in the file but not in the
        // document as anyone reads it.
        if (tag === 'delText' || tag === 'instrText') continue;

        walk(child);
        // A paragraph is the only structural break that survives; table cells
        // hold paragraphs of their own, so rows come out one line each.
        if (tag === 'p') out.push('\n\n');
      }
    })(doc);

    return out.join('')
      .replace(/\r/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function readDocx(file) {
    return buffer(file).then(function (raw) {
      var bytes = new Uint8Array(raw);
      var view = new DataView(raw);
      var entry = findEntry(view, bytes, MAIN_PART);
      if (!entry) throw fail('app.attach.err.read');
      return entryBytes(view, bytes, entry).then(function (part) {
        return textOf(new TextDecoder('utf-8').decode(part));
      });
    });
  }

  function readPlain(file) {
    return buffer(file).then(function (raw) {
      return decodeText(new Uint8Array(raw)).replace(/\r\n?/g, '\n').trim();
    });
  }

  /* ---------- entry point ---------- */

  SG.attachLimitMb = MAX_MB;

  SG.readDocument = function (file) {
    var ext = extension(file.name);

    if (file.size > MAX_BYTES) return Promise.reject(fail('app.attach.err.big', { n: MAX_MB }));
    if (ext === 'doc') return Promise.reject(fail('app.attach.err.legacy'));

    var read = null;
    if (ext === 'docx' || file.type === DOCX_MIME) read = readDocx;
    else if (TEXT_EXT.indexOf(ext) !== -1 || file.type.indexOf('text/') === 0) read = readPlain;
    if (!read) return Promise.reject(fail('app.attach.err.type'));

    return read(file).then(function (text) {
      if (!text) throw fail('app.attach.err.empty');
      return text;
    });
  };
})();
