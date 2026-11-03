#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { table } from './lib/format.mjs';
import { parseCsv } from './lib/csv.mjs';

export const specs = {
 help: [], programmes: [], versions: [], modules: ['version'], outcomes: ['version'], assessments: ['version'],
 'mapping-gaps': ['version'], 'credit-check': [], 'reviews-due': [], 'quiet-drafts': [], overdue: [], compliance: ['version'], activity: [], approvals: [], version: ['version'],
 'add-programme': ['code','title','owner','jurisdiction','actor'],
 'add-version': ['programme','number','title','level','credits','review-due','effective','rationale','actor'],
 'add-module': ['version','code','title','level','credits','hours','aim','content','delivery','actor'],
 'edit-version': ['version','title','level','credits','review-due','effective','rationale','actor'],
 'edit-module': ['version','module','title','level','credits','hours','aim','content','delivery','actor'],
 'edit-outcome': ['version','outcome','description','actor'],
 'edit-assessment': ['version','assessment','title','method','criteria','weight','actor'],
 'add-outcome': ['version','module','code','description','actor'],
 'add-assessment': ['version','module','code','title','method','criteria','weight','actor'],
 'align-outcome': ['version','learning','programme-outcome','evidence','actor'],
 'map-assessment': ['version','assessment','outcome','actor'],
 'log-task': ['version','owner','note','due','actor'], 'close-task': ['task','resolution','actor'],
 submit: ['version','evidence','actor'], decide: ['version','decision','evidence','actor'],
 revise: ['version','number','review-due','effective','rationale','actor'],
 import: ['file','map','dry-run','actor'], export: ['out'], 'weekly-review': [], 'draft-review': ['version'],
};
export const commands = Object.keys(specs);
const writeCommands = new Set(commands.filter(c=>specs[c].includes('actor')));
export function parse(args) {
 const [command='help',...rest]=args; if(!specs[command]) throw Error(`Unknown command ${command}. Use help.`);
 const opts={}; let vendor=false;
 for(const arg of rest){
  if(command==='import'&&arg==='akari'&&!vendor){vendor=true;continue;}
  const m=/^--([a-z-]+)(?:=(.*))?$/.exec(arg); if(!m)throw Error(`Unexpected argument: ${arg}`);
  const [,key,value]=m;if(!(key==='json'||specs[command].includes(key)))throw Error(`Unknown flag --${key}`);
  if(key in opts)throw Error(`Duplicate flag --${key}`);
  if(['json','dry-run'].includes(key)){if(value!==undefined)throw Error(`--${key} is a boolean flag`);opts[key]=true;}
  else {if(value===undefined||!value.trim())throw Error(`--${key}=value is required`);opts[key]=value;}
 }
 if(command==='import'&&!vendor)throw Error('Use import akari --file=... --actor=...');
 return {command,opts};
}
const req=(o,k)=>{const s=String(o[k]??'').trim();if(!s)throw Error(`--${k} is required`);return s;};
export function date(value){
 const s=String(value??'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Expected valid ISO date: ${s}`);return s;
}
function number(value,{max=1000000,integer=false}={}){
 const s=String(value??'');if(!/^\d+(?:\.\d{1,2})?$/.test(s)||Number(s)<=0||Number(s)>max||(integer&&!Number.isInteger(Number(s))))throw Error(`Invalid positive ${integer?'integer':'number'}: ${s}`);return Number(s);
}
const idTables=new Set(['programmes','modules','outcomes','assessments','tasks']);
async function resolve(db,name,term,versionId=null){
 if(!idTables.has(name))throw Error('Invalid record kind');
 const p=[term];let scope='';if(versionId){p.push(versionId);scope=' AND version_id=$2';}
 const label=name==='tasks'?'note':name==='outcomes'?'description':'title';
 const code=name==='tasks'?'id::text':'code';
 const exact=await db.query(`SELECT * FROM ${name} WHERE (lower(${code})=lower($1) OR id::text=$1)${scope}`,p);
 if(exact.length===1)return exact[0];
 const rows=await db.query(`SELECT * FROM ${name} WHERE (starts_with(lower(${code}),lower($1)) OR starts_with(id::text,$1) OR strpos(lower(${label}),lower($1))>0)${scope} ORDER BY ${label}`,p);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${name}:\n${rows.map(r=>`${r.id} ${r.code||''} ${r[label]}`).join('\n')}`:`No match in ${name}: ${term}`);
 return rows[0];
}
async function version(db,term,lock=false){
 let rows=await db.query('SELECT * FROM version_register WHERE lower(reference)=lower($1) OR id::text=$1',[term]);
 if(!rows.length)rows=await db.query('SELECT * FROM version_register WHERE starts_with(id::text,$1) OR strpos(lower(reference),lower($1))>0 OR strpos(lower(title),lower($1))>0 ORDER BY reference',[term]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous version:\n${rows.map(r=>`${r.id} ${r.reference} ${r.title}`).join('\n')}`:`No match for version: ${term}`);
 if(lock){const [fresh]=await db.query('SELECT * FROM versions WHERE id=$1 FOR UPDATE',[rows[0].id]);return {...rows[0],...fresh};}
 return rows[0];
}
async function insert(db,t,row){const keys=Object.keys(row);return (await db.query(`INSERT INTO ${t} (${keys.join(',')}) VALUES (${keys.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,Object.values(row)))[0];}
async function audit(db,actor,action,record,detail){await insert(db,'activity',{actor,action,record_id:record||null,detail:JSON.stringify(detail)});}
async function snapshot(db,id){
 const [v]=await db.query('SELECT * FROM versions WHERE id=$1',[id]);
 const [p]=await db.query('SELECT * FROM programmes WHERE id=$1',[v.programme_id]);const result={programme:p,version:v};
 for(const t of ['modules','outcomes','assessments','alignments','assessment_outcomes','tasks'])result[t]=await db.query(`SELECT * FROM ${t} WHERE version_id=$1 ORDER BY id`,[id]);
 return result;
}
const selectVersion=(base,id)=>id?[base+' WHERE version_id=$1',[id]]:[base,[]];
function draft(name,body){const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`${name}-${randomUUID()}.md`);fs.writeFileSync(file,body,{flag:'wx',mode:0o600});return {file};}
export function human(value){
 if(Array.isArray(value)){if(!value.length)return '  (none)';const cols=Object.keys(value[0]);return table(value,cols.map(key=>({key,label:key.replaceAll('_',' '),width:70,format:v=>v instanceof Date?v.toISOString():v&&typeof v==='object'?JSON.stringify(v):v})));}
 if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>`${k}\n${Array.isArray(v)?human(v):typeof v==='object'?JSON.stringify(v,null,2):v}`).join('\n\n');
 return String(value);
}
export const importColumns={
 programme_code:'Programme Code',programme_title:'Programme Title',owner:'Owner',jurisdiction:'Jurisdiction',number:'Version',title:'Version Title',level:'Level',credits:'Programme Credits',review_due:'Review Due',effective_date:'Effective Date',rationale:'Rationale',
 module_code:'Module Code',module_title:'Module Title',module_level:'Module Level',module_credits:'Module Credits',hours:'Learning Hours',aim:'Aim',content:'Content',delivery:'Delivery',
 programme_outcome_code:'Programme Outcome Code',programme_outcome:'Programme Outcome',learning_outcome_code:'Learning Outcome Code',learning_outcome:'Learning Outcome',assessment_code:'Assessment Code',assessment_title:'Assessment Title',method:'Assessment Method',criteria:'Assessment Criteria',weight:'Assessment Weight',evidence:'Mapping Evidence',
};
async function importAkari(db,o){
 const actor=req(o,'actor'),csv=fs.readFileSync(path.resolve(req(o,'file')),'utf8');
 const overrides=o.map?JSON.parse(fs.readFileSync(path.resolve(o.map),'utf8')):{};
 if(!overrides||Array.isArray(overrides)||typeof overrides!=='object')throw Error('Column map must be an object');
 for(const [k,v] of Object.entries(overrides))if(!(k in importColumns)||typeof v!=='string'||!v.trim())throw Error(`Unknown or invalid column mapping: ${k}`);
 const mapping={...importColumns,...overrides};if(new Set(Object.values(mapping).map(x=>x.toLowerCase())).size!==Object.keys(mapping).length)throw Error('Column map must use distinct columns');
 const fingerprint=createHash('sha256').update(csv+'\n'+JSON.stringify(mapping)).digest('hex');
 if((await db.query('SELECT id FROM imports WHERE fingerprint=$1',[fingerprint])).length)return {already_imported:true};
 const rows=parseCsv(csv);if(!rows.length)throw Error('CSV has no data rows');
 // All mapped fields are required. An incomplete report never becomes approved curriculum.
 const data=rows.map((r,i)=>Object.fromEntries(Object.entries(mapping).map(([k,h])=>{const actual=Object.keys(r).find(x=>x.toLowerCase()===h.toLowerCase());if(!actual||!r[actual].trim())throw Error(`Row ${i+2}: missing ${h}`);return [k,r[actual].trim()];})));
 const caches=new Map(), createdVersions=new Map(), payloads=new Map();
 async function entity(t,key,row){
  const cacheKey=t+':'+key;const existing=caches.get(cacheKey);
  if(existing){for(const [k,v] of Object.entries(row))if(String(payloads.get(cacheKey)[k])!==String(v))throw Error(`Conflicting ${t} ${key}: ${k}`);return existing;}
  const record=await insert(db,t,row);caches.set(cacheKey,record);payloads.set(cacheKey,row);return record;
 }
 const imported=await insert(db,'imports',{fingerprint,actor,original_csv:csv,mapping:JSON.stringify(mapping),record_count:rows.length});
 for(let i=0;i<data.length;i++){
  const r=data[i];const pkey=r.programme_code.toLowerCase();let p=caches.get('p:'+pkey);
  const pfields={code:r.programme_code,title:r.programme_title,owner:r.owner,jurisdiction:r.jurisdiction.toUpperCase()};
  if(!p){p=(await db.query('SELECT * FROM programmes WHERE lower(code)=lower($1)',[r.programme_code]))[0]||await insert(db,'programmes',pfields);caches.set('p:'+pkey,p);}
  for(const k of ['title','owner','jurisdiction'])if(p[k]!==pfields[k])throw Error(`Conflicting programme ${r.programme_code}: ${k}`);
  const n=number(r.number,{integer:true});const vkey=p.id+':'+n;
  if(!createdVersions.has(vkey)&&(await db.query('SELECT id FROM versions WHERE programme_id=$1 AND number=$2',[p.id,n])).length)throw Error(`Existing version ${r.programme_code}/v${n} cannot be overwritten; reconcile the export`);
  const v=await entity('versions',vkey,{programme_id:p.id,number:n,title:r.title,level:number(r.level,{integer:true,max:10}),credits:number(r.credits),review_due:date(r.review_due),effective_date:date(r.effective_date),rationale:r.rationale});createdVersions.set(vkey,v.id);
  const m=await entity('modules',v.id+':'+r.module_code,{version_id:v.id,code:r.module_code,title:r.module_title,level:number(r.module_level,{integer:true,max:10}),credits:number(r.module_credits),hours:number(r.hours),aim:r.aim,content:r.content,delivery:r.delivery});
  const po=await entity('outcomes',v.id+':'+r.programme_outcome_code,{version_id:v.id,module_id:null,code:r.programme_outcome_code,description:r.programme_outcome});
  const lo=await entity('outcomes',v.id+':'+r.learning_outcome_code,{version_id:v.id,module_id:m.id,code:r.learning_outcome_code,description:r.learning_outcome});
  const a=await entity('assessments',v.id+':'+r.assessment_code,{version_id:v.id,module_id:m.id,code:r.assessment_code,title:r.assessment_title,method:r.method,criteria:r.criteria,weight:number(r.weight,{max:100})});
  await entity('alignments',lo.id+':'+po.id,{version_id:v.id,learning_outcome_id:lo.id,programme_outcome_id:po.id,evidence:r.evidence});
  await entity('assessment_outcomes',a.id+':'+lo.id,{version_id:v.id,assessment_id:a.id,outcome_id:lo.id});
  await insert(db,'import_rows',{import_id:imported.id,version_id:v.id,row_number:i+2,source_row:JSON.stringify(rows[i])});
 }
 return {imported:rows.length,versions:createdVersions.size,dry_run:Boolean(o['dry-run']),state:'draft'};
}

async function execute(db,c,o){
 if(c==='help')return commands.map(command=>({command,flags:specs[command].map(f=>'--'+f).join(' ')}));
 if(c==='programmes')return db.query('SELECT code,title,owner,jurisdiction FROM programmes ORDER BY code');
 if(c==='versions')return db.query('SELECT reference,title,state,owner,credits,module_credits,review_due FROM version_register ORDER BY reference');
 if(c==='credit-check')return db.query('SELECT reference,credits AS expected_credits,module_credits,credits-module_credits AS credit_gap FROM version_register ORDER BY reference');
 if(c==='reviews-due')return db.query('SELECT * FROM review_queue ORDER BY review_due,reference');
 if(c==='quiet-drafts')return db.query("SELECT reference,title,owner,updated_at,review_due FROM version_register WHERE state='draft' AND updated_at<now()-interval '14 days' ORDER BY updated_at,reference");
 if(c==='overdue')return db.query('SELECT t.id,v.reference,t.owner,t.note,t.due FROM tasks t JOIN version_register v ON v.id=t.version_id WHERE closed_at IS NULL AND due<current_date ORDER BY due,t.id');
 if(c==='activity')return db.query('SELECT actor,action,record_id,created_at FROM activity ORDER BY created_at,id');
 if(c==='approvals')return db.query('SELECT v.reference,r.actor,r.decision,r.evidence,r.created_at FROM reviews r JOIN version_register v ON v.id=r.version_id ORDER BY r.created_at,r.id');
 if(c==='compliance'||c==='mapping-gaps'){
  const v=o.version?await version(db,o.version):null;
  if(c==='compliance'){const [sql,p]=selectVersion('SELECT * FROM curriculum_findings',v?.id);return db.query(sql+' ORDER BY reference,rule,finding',p);}
  return db.query(`SELECT reference,code,module,programme_links,assessments FROM mapping_coverage WHERE (programme_links=0 OR assessments=0)${v?' AND version_id=$1':''} ORDER BY reference,code`,v?[v.id]:[]);
 }
 if(['modules','outcomes','assessments'].includes(c)){
  const v=await version(db,req(o,'version'));
  const cols=c==='modules'?'code,title,level,credits,hours,aim,delivery':c==='outcomes'?'code,description,module_id':'code,title,method,weight,criteria,module_id';
  return db.query(`SELECT ${cols} FROM ${c} WHERE version_id=$1 ORDER BY code`,[v.id]);
 }
 if(c==='version'){
  const v=await version(db,req(o,'version'));
  return {...await snapshot(db,v.id),reviews:await db.query('SELECT * FROM reviews WHERE version_id=$1 ORDER BY created_at,id',[v.id])};
 }
 if(c==='import')return importAkari(db,o);
 if(c==='export'){
  const records={};for(const t of ['programmes','versions','modules','outcomes','assessments','alignments','assessment_outcomes','tasks','reviews','imports','import_rows','activity','schema_migrations'])records[t]=await db.query(`SELECT * FROM ${t}`);
  const out=path.resolve(req(o,'out'));fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify({format:'curriculum-snapshot-v1',exported_at:new Date().toISOString(),records},null,2)+'\n',{flag:'wx',mode:0o600});return {file:out};
 }
 if(c==='weekly-review'){
  let body='# Draft weekly curriculum review\n\nSynthetic data must be identified as demo data. Internal decisions are not accreditation.\n';
  for(const command of ['reviews-due','mapping-gaps','overdue'])body+=`\n## ${command}\n\n${human(await execute(db,command,{}))}\n`;
  return draft('weekly-review',body);
 }
 if(c==='draft-review'){
  const v=await version(db,req(o,'version'));const findings=await execute(db,'compliance',{version:v.id});
  return draft('review-brief',`# Draft review brief: ${v.reference}\n\n${v.title}\nOwner: ${v.owner}\nState: ${v.state}\nReview due: ${v.review_due}\n\n## Findings\n${human(findings)}\n\n## Recorded decisions\n${human(await db.query('SELECT actor,decision,evidence,created_at FROM reviews WHERE version_id=$1 ORDER BY created_at',[v.id]))}\n\nCommittee decision and regulatory evidence remain the responsibility of the institution. Nothing has been sent.\n`);
 }
 if(c==='add-programme')return insert(db,'programmes',{code:req(o,'code'),title:req(o,'title'),owner:req(o,'owner'),jurisdiction:req(o,'jurisdiction').toUpperCase()});
 if(c==='add-version'){
  const p=await resolve(db,'programmes',req(o,'programme'));
  return insert(db,'versions',{programme_id:p.id,number:number(req(o,'number'),{integer:true}),title:req(o,'title'),level:number(req(o,'level'),{integer:true,max:10}),credits:number(req(o,'credits')),review_due:date(req(o,'review-due')),effective_date:date(req(o,'effective')),rationale:req(o,'rationale')});
 }
 if(c==='close-task'){
  const task=await resolve(db,'tasks',req(o,'task'));const rows=await db.query('UPDATE tasks SET resolution=$2,closed_at=now() WHERE id=$1 AND closed_at IS NULL RETURNING *',[task.id,req(o,'resolution')]);if(!rows.length)throw Error('Task already closed');return rows[0];
 }
 const v=await version(db,req(o,'version'),true);
 if(c==='log-task')return insert(db,'tasks',{version_id:v.id,owner:req(o,'owner'),note:req(o,'note'),due:date(req(o,'due'))});
 if(c==='submit'){
  if(v.state!=='draft')throw Error('Only a draft can be submitted');
  await db.query("UPDATE versions SET state='in-review',submitted_by=$2,submitted_at=now() WHERE id=$1",[v.id,req(o,'actor')]);
  return insert(db,'reviews',{version_id:v.id,actor:req(o,'actor'),decision:'submitted',evidence:req(o,'evidence'),snapshot:JSON.stringify(await snapshot(db,v.id))});
 }
 if(c==='decide'){
  if(v.state!=='in-review')throw Error('Only a submitted version can receive a decision');
  const decision=req(o,'decision');if(!['approved','changes'].includes(decision))throw Error('Decision must be approved or changes');
  if(decision==='approved'){
   if(req(o,'actor').toLowerCase()===v.submitted_by.toLowerCase())throw Error('Approval needs a reviewer different from the submitter');
   const findings=await execute(db,'compliance',{version:v.id});if(findings.length)throw Error('Unresolved curriculum findings:\n'+human(findings));
   const open=await db.query('SELECT id FROM tasks WHERE version_id=$1 AND closed_at IS NULL',[v.id]);if(open.length)throw Error('Close outstanding review tasks before approval');
  }
  const review=await insert(db,'reviews',{version_id:v.id,actor:req(o,'actor'),decision,evidence:req(o,'evidence'),snapshot:JSON.stringify(await snapshot(db,v.id))});
  await db.query("UPDATE versions SET state=$2,approved_at=CASE WHEN $2='approved' THEN now() ELSE NULL END WHERE id=$1",[v.id,decision==='approved'?'approved':'draft']);return review;
 }
 if(c==='revise'){
  if(v.state!=='approved')throw Error('Revise an approved version; edit a draft directly');
  const old=await snapshot(db,v.id),n=number(req(o,'number'),{integer:true});if(n<=v.number)throw Error('New version number must increase');
  const fresh=await insert(db,'versions',{programme_id:v.programme_id,number:n,title:v.title,level:v.level,credits:v.credits,review_due:date(req(o,'review-due')),effective_date:date(req(o,'effective')),rationale:req(o,'rationale')});
  const ids=new Map();
  for(const t of ['modules','outcomes','assessments','alignments','assessment_outcomes'])for(const r of old[t]){
   const {id,created_at,updated_at,...copy}=r;copy.version_id=fresh.id;
   for(const k of ['module_id','learning_outcome_id','programme_outcome_id','assessment_id','outcome_id'])if(copy[k])copy[k]=ids.get(copy[k]);
   const made=await insert(db,t,copy);ids.set(id,made.id);
  }
  return fresh;
 }
 if(v.state!=='draft')throw Error('Version is not draft; request changes or revise it');
 if(c==='edit-version'){
  const changes={};for(const k of ['title','level','credits','review-due','effective','rationale'])if(o[k]){
   const column=k==='review-due'?'review_due':k==='effective'?'effective_date':k;
   changes[column]=['review-due','effective'].includes(k)?date(o[k]):['level','credits'].includes(k)?number(o[k],k==='level'?{max:10,integer:true}:{}):req(o,k);
  }
  if(!Object.keys(changes).length)throw Error('Provide version fields to change');const keys=Object.keys(changes);
  return (await db.query(`UPDATE versions SET ${keys.map((k,i)=>`${k}=$${i+2}`).join(',')} WHERE id=$1 RETURNING *`,[v.id,...Object.values(changes)]))[0];
 }
 if(c==='add-module')return insert(db,'modules',{version_id:v.id,code:req(o,'code'),title:req(o,'title'),level:number(req(o,'level'),{integer:true,max:10}),credits:number(req(o,'credits')),hours:number(req(o,'hours')),aim:req(o,'aim'),content:req(o,'content'),delivery:req(o,'delivery')});
 if(c==='edit-module'){
  const m=await resolve(db,'modules',req(o,'module'),v.id),changes={};for(const k of ['title','level','credits','hours','aim','content','delivery'])if(o[k])changes[k]=['level','credits','hours'].includes(k)?number(o[k],k==='level'?{max:10,integer:true}:{}):req(o,k);
  if(!Object.keys(changes).length)throw Error('Provide module fields to change');const keys=Object.keys(changes);
  return (await db.query(`UPDATE modules SET ${keys.map((k,i)=>`${k}=$${i+2}`).join(',')} WHERE id=$1 RETURNING *`,[m.id,...Object.values(changes)]))[0];
 }
 if(c==='add-outcome')return insert(db,'outcomes',{version_id:v.id,module_id:o.module?(await resolve(db,'modules',o.module,v.id)).id:null,code:req(o,'code'),description:req(o,'description')});
 if(c==='edit-outcome'){
  const outcome=await resolve(db,'outcomes',req(o,'outcome'),v.id);return (await db.query('UPDATE outcomes SET description=$2 WHERE id=$1 RETURNING *',[outcome.id,req(o,'description')]))[0];
 }
 if(c==='edit-assessment'){
  const a=await resolve(db,'assessments',req(o,'assessment'),v.id),changes={};for(const k of ['title','method','criteria','weight'])if(o[k])changes[k]=k==='weight'?number(o[k],{max:100}):req(o,k);
  if(!Object.keys(changes).length)throw Error('Provide assessment fields to change');const keys=Object.keys(changes);
  return (await db.query(`UPDATE assessments SET ${keys.map((k,i)=>`${k}=$${i+2}`).join(',')} WHERE id=$1 RETURNING *`,[a.id,...Object.values(changes)]))[0];
 }
 if(c==='add-assessment')return insert(db,'assessments',{version_id:v.id,module_id:(await resolve(db,'modules',req(o,'module'),v.id)).id,code:req(o,'code'),title:req(o,'title'),method:req(o,'method'),criteria:req(o,'criteria'),weight:number(req(o,'weight'),{max:100})});
 if(c==='align-outcome')return insert(db,'alignments',{version_id:v.id,learning_outcome_id:(await resolve(db,'outcomes',req(o,'learning'),v.id)).id,programme_outcome_id:(await resolve(db,'outcomes',req(o,'programme-outcome'),v.id)).id,evidence:req(o,'evidence')});
 if(c==='map-assessment')return insert(db,'assessment_outcomes',{version_id:v.id,assessment_id:(await resolve(db,'assessments',req(o,'assessment'),v.id)).id,outcome_id:(await resolve(db,'outcomes',req(o,'outcome'),v.id)).id});
 throw Error(`Unhandled command ${c}`);
}
export async function run(db,command,opts={}){
 if(!specs[command])throw Error(`Unknown command ${command}`);
 const write=writeCommands.has(command);if(write)req(opts,'actor');
 await db.exec(write?'BEGIN':'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{
  const result=await execute(db,command,opts);
  if(write&&!result?.already_imported)await audit(db,opts.actor,command,result?.id,opts.file?{file:path.basename(opts.file),result}:opts);
  await db.exec(opts['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const {command,opts}=parse(process.argv.slice(2));db=await getDb();const result=await run(db,command,opts);console.log(opts.json?JSON.stringify(result,null,2):human(result));}
 catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
