import assert from 'node:assert/strict';
import {requestDocument,currentDocumentReading,reusableDocumentReading,mapConcurrent,serialUpdates} from '../cdc-review.mjs';
const data={document:{legibilidade:'legivel'},version:'cdc-docs-tipos-v3'};
let calls=0;const tokens=[];const user={getIdToken:async refresh=>{tokens.push(refresh);return 'test-token';}};
assert.deepEqual(await requestDocument('synthetic',user,{wait:async()=>{},fetcher:async()=>++calls===1?{status:401,ok:false,json:async()=>({error:'session'})}:{ok:true,json:async()=>data}}),data);
assert.deepEqual(tokens,[false,true]);assert.equal(calls,2);
calls=0;assert.deepEqual(await requestDocument('synthetic',user,{wait:async()=>{},fetcher:async()=>{if(++calls===1)throw Error('network');return {ok:true,json:async()=>data};}}),data);assert.equal(calls,2);
calls=0;await assert.rejects(requestDocument('synthetic',user,{wait:async()=>{},fetcher:async()=>{calls++;return {status:503,ok:false,json:async()=>({error:'Quota unavailable',retryable:false})};}}),/Quota unavailable/);assert.equal(calls,1);
calls=0;assert.deepEqual(await requestDocument('synthetic',user,{wait:async()=>{},fetcher:async()=>++calls===1?{status:429,ok:false,json:async()=>({retryable:true,error:'busy'})}:{ok:true,json:async()=>data}}),data);assert.equal(calls,2);
console.log('PASS: token refresh, bounded connection retry, busy retry and quota error without repeated billing');

assert.equal(currentDocumentReading({versaoLeitor:'cdc-docs-tipos-v3',document:{cpf:null}},'rgFrente'),false);
assert.equal(currentDocumentReading({versaoLeitor:'cdc-docs-tipos-v3',document:{cpf:null,versaoIdentidade:1}},'rgFrente'),false);
assert.equal(currentDocumentReading({versaoLeitor:'cdc-docs-tipos-v3',document:{cpf:'52998224725'}},'rgFrente'),true);
assert.equal(currentDocumentReading({versaoLeitor:'cdc-docs-tipos-v3',document:{cpf:null}},'comprovanteRenda'),true);
console.log('PASS: old missing-CPF readings are refreshed without rereading valid income documents');

assert.equal(reusableDocumentReading({versaoLeitor:'cdc-docs-tipos-v3',lidoEm:1000,document:{cpf:null,versaoIdentidade:2}},'rgFrente',32000),false);
assert.equal(reusableDocumentReading({versaoLeitor:'cdc-docs-tipos-v3',lidoEm:1000,document:{cpf:null,versaoIdentidade:2}},'rgFrente',2000),true);
let active=0,peak=0;const started=[];
const results=await mapConcurrent([1,2,3,4],2,async n=>{active++;peak=Math.max(peak,active);started.push(n);await new Promise(r=>setTimeout(r,10));active--;if(n===2)throw Error('expected');return n;});
assert.equal(peak,2);assert.deepEqual(started,[1,2,3,4]);assert.equal(results[1].status,'rejected');assert.equal(results[3].value,4);
const update=serialUpdates();let saved={};
await Promise.all([1,2,3].map(n=>update(async()=>{const latest={...saved};await new Promise(r=>setTimeout(r,5));saved={...latest,[n]:true};})));
assert.deepEqual(saved,{1:true,2:true,3:true});
calls=0;await assert.rejects(requestDocument('synthetic',user,{wait:async()=>{},fetcher:async()=>{calls++;return {status:503,ok:false,json:async()=>({code:'reader_timeout',retryable:true,error:'timeout'})};}}),/timeout/);assert.equal(calls,1);
console.log('PASS: bounded parallelism, ordered saves without lost fields, old failed identity reread and no repeat after reader timeout');
