import assert from 'node:assert/strict';
import {attachmentBlob} from '../cdc-document-viewer.mjs';
const b=attachmentBlob({dataUrl:'data:application/pdf;base64,JVBERi0xLjQ='});
assert.equal(b.type,'application/pdf');assert.equal(await b.text(),'%PDF-1.4');
assert.equal(attachmentBlob({dataUrl:'data:image/jpeg;base64,YWJj'}).type,'image/jpeg');
assert.throws(()=>attachmentBlob({dataUrl:'data:text/html;base64,YWJj'}),/Formato/);
assert.throws(()=>attachmentBlob({dataUrl:'https://example.com/doc.pdf'}),/Formato/);
assert.throws(()=>attachmentBlob({dataUrl:'data:application/pdf;base64,a'}),/incompleto/);
console.log('PASS: exact bytes preserved, PDF/JPEG supported, active HTML/remote URLs rejected');
