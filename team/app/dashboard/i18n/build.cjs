// Usage: node i18n/build.js master.html out.html
const fs=require('fs'),acorn=require('acorn'),walk=require('acorn-walk');
const [,,inp,outp]=process.argv;const html=fs.readFileSync(inp,'utf8');
const a=html.indexOf('<script>')+8,b=html.indexOf('</script>',a);let src=html.slice(a,b);
const tr=JSON.parse(fs.readFileSync(__dirname+'/tr.json','utf8'));
const ast=acorn.parse(src,{ecmaVersion:'latest'});
const PROMPT_CALLEES=/^(S\.sample\.json|S\.sample|runAI|sample\.json|sample)$/;
const PROMPT_VARS=new Set(['prompt','ctx','rules','reqs','prj','wks','mt','soon','summary','base','pre']);
const TEXTATTR=new Set(['placeholder','aria-label','title','alt']);
const RUNTIME=['General','Groups','NextGen','Comms','Admin','Growth','Sunday','today','tomorrow','yesterday','task','tasks','day','days','person','people','group','groups','project','projects'];
const DATA_LIT=new Set(RUNTIME);
function cname(c){if(!c)return'';if(c.type==='Identifier')return c.name;if(c.type==='MemberExpression')return cname(c.object)+'.'+(c.property.name||'');return '';}
function lex(s,state){const runs=[];let i=0,st=state.st,attr=state.attr,start=0;
  const emit=(from,to)=>{const raw=s.slice(from,to);const lt=raw.length-raw.trimStart().length;const t=raw.trim();if(t&&/[A-Za-z]{2,}/.test(t))runs.push({off:from+lt,len:t.length,text:t});};
  while(i<s.length){const ch=s[i];
    if(st==='TEXT'){if(ch==='<'&&/[a-zA-Z\/!]/.test(s[i+1]||'')){emit(start,i);st='TAG';i++;start=i;continue;}i++;continue;}
    if(st==='TAG'){if(ch==='>'){st='TEXT';i++;start=i;continue;}const m=/^([a-zA-Z-:]+)="/.exec(s.slice(i));if(m){attr=m[1];st='ATTR';i+=m[0].length;start=i;continue;}i++;continue;}
    if(st==='ATTR'){if(ch==='"'){if(TEXTATTR.has(attr))emit(start,i);st='TAG';i++;continue;}i++;continue;}}
  if(st==='TEXT')emit(start,s.length);else if(st==='ATTR'&&TEXTATTR.has(attr))emit(start,s.length);
  return {runs,state:{st,attr}};}
function translate(s,runs){let out=s,changed=false;for(const r of [...runs].sort((x,y)=>y.off-x.off)){const d=tr[r.text];if(d==null||d===r.text)continue;out=out.slice(0,r.off)+d+out.slice(r.off+r.len);changed=true;}return changed?out:null;}
const DE={};const WR=[];const TOP=[];const edits=[];const tagged=new Set();let nLit=0,nTpl=0;
walk.fullAncestor(ast,(node,_,anc)=>{
  if(node.type!=='TemplateLiteral'&&!(node.type==='Literal'&&typeof node.value==='string'))return;
  let prompt=false;
  for(let k=0;k<anc.length-1;k++){const p=anc[k];
    if(p.type==='CallExpression'&&PROMPT_CALLEES.test(cname(p.callee)))prompt=true;
    if(p.type==='VariableDeclarator'&&p.id.type==='Identifier'&&(PROMPT_VARS.has(p.id.name)))prompt=true;}
  if(prompt)return;
  const par=anc[anc.length-2];
  if(node.type==='Literal'){
    if(par&&((par.type==='Property'&&par.key===node)||(par.type==='MemberExpression'&&par.property===node)||par.type==='BinaryExpression'&&/^[!=]==?$/.test(par.operator)||par.type==='SwitchCase'||par.type==='ImportDeclaration'||par.type==='ExpressionStatement'))return;
    if(par&&par.type==='ArrayExpression'&&par.elements.length===2&&par.elements.every(e=>e&&e.type==='Literal'&&typeof e.value==='string')&&/[äöüß]|\b(und|der|die|das|wir|ist|nicht|zu|mit|für|du|wie|was|wer)\b/.test(par.elements[0].value))return;
    if(DATA_LIT.has(node.value))return;
    if(/^[a-z][a-z.()]*$/.test(node.value))return;
    if(node.value==='Sunday'&&!(anc.some(x=>x.type==='VariableDeclarator'&&x.id.name==='WD')))return;
    if(par&&par.type==='CallExpression'&&cname(par.callee)==='val')return;
    const v=node.value;let st={st:'TEXT',attr:''};if(/^\s?[a-z-]+="/.test(v))st={st:'TAG',attr:''};
    const runs=/[<>]|="/.test(v)?lex(v,st).runs:(/[A-Za-z]{2,}/.test(v)?[{off:0,len:v.length,text:v}]:[]);
    const g=translate(v,runs);if(g==null)return;
    const inFn=anc.filter(x=>/Function/.test(x.type)).length>1;
    if(!inFn){DE[v]=g;TOP.push(v);return;}
    WR.push(v);DE[v]=g;edits.push({start:node.start,end:node.end,text:'_s('+src.slice(node.start,node.end)+')'});nLit++;
  } else {
    if(par&&par.type==='TaggedTemplateExpression')return;
    let st={st:'TEXT',attr:''},any=false;
    for(const q of node.quasis){const c=q.value.cooked;const res=lex(c,st);st=res.state;const g=translate(c,res.runs);if(g!=null){DE[c]=g;any=true;}}
    if(any){edits.push({start:node.start,end:node.start,text:'_t'});nTpl++;}
  }
});
edits.sort((x,y)=>y.start-x.start||y.end-x.end);
for(const e of edits)src=src.slice(0,e.start)+e.text+src.slice(e.end);
for(const w of RUNTIME)if(tr[w]&&!(w in DE))DE[w]=tr[w];
src=src.replace('let UIDE = true;\n','let UIDE = true;\nconst DE = '+JSON.stringify(DE)+';\n');
fs.writeFileSync(outp,html.slice(0,a)+src+html.slice(b));
fs.writeFileSync(__dirname+'/wrapped.json',JSON.stringify(WR));fs.writeFileSync(__dirname+'/top.json',JSON.stringify(TOP));console.log('templates tagged',nTpl,'literals wrapped',nLit,'DE entries',Object.keys(DE).length,'size',(html.slice(0,a)+src+html.slice(b)).length);
