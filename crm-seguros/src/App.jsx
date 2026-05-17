import { useState, useMemo } from "react";

const today = new Date();
today.setHours(0, 0, 0, 0);

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function diffDays(a, b) { return Math.round((a - b) / 86400000); }
function fmt(d) { return d.toLocaleDateString("pt-BR"); }
function limparFone(fone) {
  const digits = fone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : "55" + digits;
}
function gerarMsgVencendo(c) {
  return `Olá, ${c.cliente.split(" ")[0]}! 👋\n\nPassando para avisar que seu seguro de *${c.tipo}* (Apólice ${c.apolice} – ${c.seguradora}) vence em *${c.dias} dia${c.dias > 1 ? "s" : ""}*, no dia *${fmt(c.vencimento)}*.\n\nPara renovar e manter sua proteção em dia, entre em contato comigo! 😊\n\nAtt,\nCorretora de Seguros`;
}
function gerarMsgVencido(c) {
  return `Olá, ${c.cliente.split(" ")[0]}! 👋\n\nIdentificamos que seu seguro de *${c.tipo}* (Apólice ${c.apolice} – ${c.seguradora}) *venceu há ${Math.abs(c.dias)} dia${Math.abs(c.dias) > 1 ? "s" : ""}*, em ${fmt(c.vencimento)}.\n\n⚠️ Você está sem cobertura! Vamos regularizar isso o quanto antes?\n\nEntre em contato para realizarmos a renovação.\n\nAtt,\nCorretora de Seguros`;
}
function gerarMsgLead(l) {
  return `Olá, ${l.nome.split(" ")[0]}! 👋\n\nTudo bem? Sou corretor de seguros e gostaria de apresentar as melhores opções de *seguro de ${l.interesse}* para você!\n\nPosso te passar uma cotação sem compromisso? 😊\n\nAtt,\nCorretora de Seguros`;
}
function linkWhatsApp(fone, msg) {
  return `https://wa.me/${limparFone(fone)}?text=${encodeURIComponent(msg)}`;
}

const initialData = [
  { id:1,  cliente:"Maria Silva",   cpf:"123.456.789-00",  tipo:"Automóvel",  seguradora:"Porto Seguro", apolice:"PS-001234", inicio:addDays(today,-300), vencimento:addDays(today,-5),   premio:1250, contato:"(11) 99999-1111" },
  { id:2,  cliente:"João Pereira",  cpf:"234.567.890-11",  tipo:"Vida",       seguradora:"SulAmérica",   apolice:"SA-005678", inicio:addDays(today,-180), vencimento:addDays(today,185),  premio:890,  contato:"(21) 88888-2222" },
  { id:3,  cliente:"Emp. ABC Ltda", cpf:"12.345.678/0001", tipo:"Empresarial",seguradora:"Allianz",      apolice:"AL-009012", inicio:addDays(today,-320), vencimento:addDays(today,-45),  premio:5800, contato:"(11) 77777-3333" },
  { id:4,  cliente:"Ana Souza",     cpf:"345.678.901-22",  tipo:"Saúde",      seguradora:"Bradesco",     apolice:"BS-003456", inicio:addDays(today,-200), vencimento:addDays(today,20),   premio:2100, contato:"(31) 66666-4444" },
  { id:5,  cliente:"Carlos Lima",   cpf:"456.789.012-33",  tipo:"Residencial",seguradora:"Liberty",      apolice:"LB-007890", inicio:addDays(today,-100), vencimento:addDays(today,90),   premio:680,  contato:"(41) 55555-5555" },
  { id:6,  cliente:"Paula Costa",   cpf:"567.890.123-44",  tipo:"Automóvel",  seguradora:"Tokio Marine", apolice:"TM-002345", inicio:addDays(today,-360), vencimento:addDays(today,5),    premio:1450, contato:"(51) 44444-6666" },
  { id:7,  cliente:"Loja ABC ME",   cpf:"98.765.432/0001", tipo:"Empresarial",seguradora:"Mapfre",       apolice:"MF-006789", inicio:addDays(today,-50),  vencimento:addDays(today,315),  premio:3200, contato:"(11) 33333-7777" },
  { id:8,  cliente:"Roberto Alves", cpf:"678.901.234-55",  tipo:"Vida",       seguradora:"SulAmérica",   apolice:"SA-001122", inicio:addDays(today,-400), vencimento:addDays(today,-35),  premio:760,  contato:"(62) 22222-8888" },
  { id:9,  cliente:"Fernanda Reis", cpf:"789.012.345-66",  tipo:"Saúde",      seguradora:"Porto Seguro", apolice:"PS-004433", inicio:addDays(today,-150), vencimento:addDays(today,215),  premio:1980, contato:"(85) 11111-9999" },
  { id:10, cliente:"Tech Corp SA",  cpf:"11.222.333/0001", tipo:"Rural",      seguradora:"Allianz",      apolice:"AL-008877", inicio:addDays(today,-10),  vencimento:addDays(today,355),  premio:9500, contato:"(11) 90909-0000" },
];

const initialLeads = [
  { id:1, nome:"Lucas Mendes",    contato:"(11) 91111-2222", interesse:"Automóvel",  origem:"Indicação",  status:"Novo",         observacao:"Tem um Civic 2022",          data: fmt(addDays(today,-2)) },
  { id:2, nome:"Bruna Carvalho",  contato:"(21) 93333-4444", interesse:"Saúde",      origem:"Instagram",  status:"Em contato",   observacao:"Família com 3 pessoas",      data: fmt(addDays(today,-5)) },
  { id:3, nome:"Marcos Oliveira", contato:"(31) 95555-6666", interesse:"Residencial",origem:"Site",       status:"Cotação enviada", observacao:"Casa nova no bairro",     data: fmt(addDays(today,-8)) },
  { id:4, nome:"Juliana Ramos",   contato:"(41) 97777-8888", interesse:"Vida",       origem:"WhatsApp",   status:"Novo",         observacao:"Perguntou sobre cobertura",  data: fmt(today) },
  { id:5, nome:"Pedro Almeida",   contato:"(51) 99999-0000", interesse:"Empresarial",origem:"Indicação",  status:"Sem retorno",  observacao:"Empresa com 10 funcionários",data: fmt(addDays(today,-15)) },
];

const STATUS_LEAD = ["Novo","Em contato","Cotação enviada","Sem retorno","Convertido","Perdido"];
const ORIGENS     = ["Indicação","Instagram","WhatsApp","Site","Facebook","Outro"];
const TIPOS       = ["Todos","Automóvel","Vida","Saúde","Residencial","Empresarial","Rural"];
const STATUS_APOLICE = ["Todos","Vigente","Vence em breve","Vencido"];

const STATUS_LEAD_STYLE = {
  "Novo":            { color:"#2e6da4", bg:"#ebf4ff", border:"#90cdf4" },
  "Em contato":      { color:"#b7791f", bg:"#fffff0", border:"#f6e05e" },
  "Cotação enviada": { color:"#553c9a", bg:"#faf5ff", border:"#d6bcfa" },
  "Sem retorno":     { color:"#718096", bg:"#f7fafc", border:"#e2e8f0" },
  "Convertido":      { color:"#276749", bg:"#f0fff4", border:"#68d391" },
  "Perdido":         { color:"#c53030", bg:"#fff5f5", border:"#fc8181" },
};

function getStatus(venc) {
  const d = diffDays(venc, today);
  if (d < 0)   return { label:"Vencido",        color:"#c53030", bg:"#fff5f5", border:"#fc8181", icon:"✕" };
  if (d <= 30) return { label:"Vence em breve", color:"#b7791f", bg:"#fffff0", border:"#f6e05e", icon:"⚡" };
  return        { label:"Vigente",              color:"#276749", bg:"#f0fff4", border:"#68d391", icon:"✓" };
}

const WA  = "#25D366";
const WA2 = "#128C7E";

const WaIcon = ({size=15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function AlertaCard({ c, onPreview }) {
  const isVencido = c.dias < 0;
  return (
    <div style={{ background:c.status.bg, border:`1px solid ${c.status.border}`, borderRadius:12, padding:"14px 18px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
      <div style={{ flex:1, minWidth:180 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <span style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>{c.cliente}</span>
          <span style={{ fontSize:11, background:c.status.color, color:"#fff", borderRadius:6, padding:"2px 7px", fontWeight:700 }}>
            {isVencido ? `Venceu há ${Math.abs(c.dias)}d` : `Vence em ${c.dias}d`}
          </span>
        </div>
        <div style={{ fontSize:12, color:"#4a5568" }}>{c.tipo} · <b>{c.apolice}</b> · {c.seguradora}</div>
        <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>📅 {fmt(c.vencimento)} · 📞 {c.contato}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
        <div style={{ fontSize:13, fontWeight:700 }}>R$ {c.premio.toLocaleString("pt-BR")}</div>
        <button onClick={onPreview} style={{ display:"inline-flex", alignItems:"center", gap:6, background:WA, color:"#fff", border:"none", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <WaIcon /> Enviar pelo WhatsApp
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [clientes, setClientes]   = useState(initialData);
  const [leads, setLeads]         = useState(initialLeads);
  const [filtroStatus, setFS]     = useState("Todos");
  const [filtroTipo, setFT]       = useState("Todos");
  const [busca, setBusca]         = useState("");
  const [buscaLead, setBuscaLead] = useState("");
  const [tab, setTab]             = useState("dashboard");
  const [showForm, setShowForm]   = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [preview, setPreview]     = useState(null);
  const [copied, setCopied]       = useState(false);
  const [editLead, setEditLead]   = useState(null);

  const [nc, setNC] = useState({ cliente:"", cpf:"", tipo:"Automóvel", seguradora:"", apolice:"", inicio:"", vencimento:"", premio:"", contato:"" });
  const [nl, setNL] = useState({ nome:"", contato:"", interesse:"Automóvel", origem:"Indicação", status:"Novo", observacao:"" });

  const dados = useMemo(() =>
    clientes.map(c => ({ ...c, status:getStatus(c.vencimento), dias:diffDays(c.vencimento, today) })),
    [clientes]
  );

  const filtrados = useMemo(() => dados.filter(c => {
    const s = filtroStatus === "Todos" || c.status.label === filtroStatus;
    const t = filtroTipo   === "Todos" || c.tipo === filtroTipo;
    const b = !busca || c.cliente.toLowerCase().includes(busca.toLowerCase()) || c.apolice.toLowerCase().includes(busca.toLowerCase());
    return s && t && b;
  }), [dados, filtroStatus, filtroTipo, busca]);

  const leadsFiltrados = useMemo(() => leads.filter(l =>
    !buscaLead || l.nome.toLowerCase().includes(buscaLead.toLowerCase()) || l.interesse.toLowerCase().includes(buscaLead.toLowerCase())
  ), [leads, buscaLead]);

  const stats = useMemo(() => ({
    total:    dados.length,
    vigentes: dados.filter(c=>c.status.label==="Vigente").length,
    breve:    dados.filter(c=>c.status.label==="Vence em breve").length,
    vencidos: dados.filter(c=>c.status.label==="Vencido").length,
    premio:   dados.reduce((s,c)=>s+c.premio,0),
    leadsNovos: leads.filter(l=>l.status==="Novo").length,
  }), [dados, leads]);

  const alertas = useMemo(() => dados.filter(c=>c.status.label!=="Vigente").sort((a,b)=>a.dias-b.dias), [dados]);

  function abrirPreview(c) {
    const msg = c.dias < 0 ? gerarMsgVencido(c) : gerarMsgVencendo(c);
    setPreview({ c, msg, link: linkWhatsApp(c.contato, msg) });
    setCopied(false);
  }

  function abrirPreviewLead(l) {
    const msg = gerarMsgLead(l);
    setPreview({ c: { cliente: l.nome, contato: l.contato }, msg, link: linkWhatsApp(l.contato, msg) });
    setCopied(false);
  }

  function salvarNovo() {
    if (!nc.cliente || !nc.vencimento) return;
    setClientes(prev => [...prev, { ...nc, id:Date.now(), vencimento:new Date(nc.vencimento), inicio:nc.inicio?new Date(nc.inicio):today, premio:parseFloat(nc.premio)||0 }]);
    setNC({ cliente:"", cpf:"", tipo:"Automóvel", seguradora:"", apolice:"", inicio:"", vencimento:"", premio:"", contato:"" });
    setShowForm(false);
  }

  function salvarLead() {
    if (!nl.nome) return;
    if (editLead) {
      setLeads(prev => prev.map(l => l.id === editLead ? { ...l, ...nl } : l));
      setEditLead(null);
    } else {
      setLeads(prev => [...prev, { ...nl, id:Date.now(), data: fmt(today) }]);
    }
    setNL({ nome:"", contato:"", interesse:"Automóvel", origem:"Indicação", status:"Novo", observacao:"" });
    setShowLeadForm(false);
  }

  function abrirEditLead(l) {
    setNL({ nome:l.nome, contato:l.contato, interesse:l.interesse, origem:l.origem, status:l.status, observacao:l.observacao });
    setEditLead(l.id);
    setShowLeadForm(true);
  }

  function converterLead(l) {
    setLeads(prev => prev.map(x => x.id === l.id ? { ...x, status:"Convertido" } : x));
    setNC(p => ({ ...p, cliente: l.nome, contato: l.contato, tipo: l.interesse }));
    setShowForm(true);
    setTab("lista");
  }

  const inp = { padding:"8px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13, width:"100%", background:"#f8fafc", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4, display:"block" };

  const Card = ({ label, value, sub, color, bg }) => (
    <div style={{ background:bg||"#fff", border:`1px solid ${color}22`, borderRadius:12, padding:"16px 18px", flex:1, minWidth:120 }}>
      <div style={{ fontSize:10, color:"#718096", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#a0aec0", marginTop:4 }}>{sub}</div>}
    </div>
  );

  const TABS = [
    ["dashboard", "📊 Dashboard"],
    ["alertas",   "📣 Alertas"],
    ["leads",     "🎯 Leads"],
    ["lista",     "📋 Lista"],
  ];

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f1f5f9", minHeight:"100vh" }}>

      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(135deg,#1a3a5c 0%,#2e6da4 100%)", padding:"20px 20px 0", color:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:-0.5 }}>🛡️ CRM Seguros</div>
            <div style={{ fontSize:11, opacity:0.7, marginTop:1 }}>Atualizado em {fmt(today)}</div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {alertas.length>0 && (
              <button onClick={()=>setTab("alertas")} style={{ background:WA, color:"#fff", border:"none", borderRadius:8, padding:"8px 12px", fontWeight:700, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <WaIcon size={13}/> Alertas <span style={{ background:"#fff", color:WA2, borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:800 }}>{alertas.length}</span>
              </button>
            )}
            <button onClick={()=>{ setShowLeadForm(true); setEditLead(null); setNL({ nome:"", contato:"", interesse:"Automóvel", origem:"Indicação", status:"Novo", observacao:"" }); }} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, padding:"8px 12px", fontWeight:700, fontSize:12, cursor:"pointer" }}>
              + Lead
            </button>
            <button onClick={()=>setShowForm(true)} style={{ background:"#fff", color:"#1a3a5c", border:"none", borderRadius:8, padding:"8px 12px", fontWeight:700, fontSize:12, cursor:"pointer" }}>
              + Apólice
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:2, overflowX:"auto" }}>
          {TABS.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:"8px 16px", border:"none", borderRadius:"8px 8px 0 0", cursor:"pointer", fontWeight:600, fontSize:12, whiteSpace:"nowrap", background:tab===k?"#f1f5f9":"transparent", color:tab===k?"#1a3a5c":"rgba(255,255,255,0.75)" }}>
              {l}
              {k==="alertas"&&alertas.length>0&&<span style={{ marginLeft:5, background:WA, color:"#fff", borderRadius:10, padding:"1px 5px", fontSize:9 }}>{alertas.length}</span>}
              {k==="leads"&&stats.leadsNovos>0&&<span style={{ marginLeft:5, background:"#e53e3e", color:"#fff", borderRadius:10, padding:"1px 5px", fontSize:9 }}>{stats.leadsNovos}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:16 }}>

        {/* ── Dashboard ── */}
        {tab==="dashboard" && <>
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <Card label="Total"         value={stats.total}    sub="apólices"       color="#2e6da4" bg="#fff"    />
            <Card label="Vigentes"      value={stats.vigentes} sub="com cobertura"  color="#276749" bg="#f0fff4" />
            <Card label="Vencem 30d"    value={stats.breve}    sub="atenção"        color="#b7791f" bg="#fffff0" />
            <Card label="Vencidas"      value={stats.vencidos} sub="sem cobertura"  color="#c53030" bg="#fff5f5" />
            <Card label="Leads Novos"   value={stats.leadsNovos} sub="aguardando"  color="#553c9a" bg="#faf5ff" />
          </div>

          {/* Prêmio total */}
          <div style={{ background:"#1a3a5c", borderRadius:12, padding:"14px 18px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>💰 Prêmio Total da Carteira</div>
            <div style={{ color:"#fff", fontSize:22, fontWeight:800 }}>R$ {stats.premio.toLocaleString("pt-BR")}</div>
          </div>

          {alertas.length>0 && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:18, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>📣 Precisam de contato</div>
                <button onClick={()=>setTab("alertas")} style={{ background:WA, color:"#fff", border:"none", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <WaIcon size={12}/> Ver todos
                </button>
              </div>
              {alertas.slice(0,3).map(c=>(
                <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f1f5f9", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:c.status.color, display:"inline-block", flexShrink:0 }}/>
                    <div>
                      <span style={{ fontWeight:600, color:"#1a202c", fontSize:13 }}>{c.cliente}</span>
                      <span style={{ marginLeft:6, fontSize:11, color:"#718096" }}>{c.tipo}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:c.status.color, fontWeight:700, fontSize:11 }}>
                      {c.dias<0?`Venceu há ${Math.abs(c.dias)}d`:`Vence em ${c.dias}d`}
                    </span>
                    <button onClick={()=>abrirPreview(c)} style={{ display:"inline-flex", alignItems:"center", gap:4, background:WA, color:"#fff", border:"none", borderRadius:6, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      <WaIcon size={11}/> Avisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leads novos no dashboard */}
          {leads.filter(l=>l.status==="Novo").length>0 && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>🎯 Leads novos</div>
                <button onClick={()=>setTab("leads")} style={{ background:"#553c9a", color:"#fff", border:"none", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                  Ver todos
                </button>
              </div>
              {leads.filter(l=>l.status==="Novo").map(l=>(
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f1f5f9", gap:10 }}>
                  <div>
                    <span style={{ fontWeight:600, color:"#1a202c", fontSize:13 }}>{l.nome}</span>
                    <span style={{ marginLeft:6, fontSize:11, color:"#718096" }}>{l.interesse} · {l.origem}</span>
                  </div>
                  <button onClick={()=>abrirPreviewLead(l)} style={{ display:"inline-flex", alignItems:"center", gap:4, background:WA, color:"#fff", border:"none", borderRadius:6, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    <WaIcon size={11}/> Contatar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Distribuição */}
          <div style={{ background:"#fff", borderRadius:12, padding:18, border:"1px solid #e2e8f0", marginTop:16 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#1a202c", marginBottom:12 }}>📈 Carteira por tipo</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {TIPOS.slice(1).map(tipo=>{
                const count=dados.filter(c=>c.tipo===tipo).length;
                if(!count) return null;
                const pct=Math.round(count/dados.length*100);
                return (
                  <div key={tipo} style={{ flex:1, minWidth:90, background:"#f8fafc", borderRadius:8, padding:"8px 12px", border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:11, color:"#718096" }}>{tipo}</div>
                    <div style={{ fontWeight:800, fontSize:18, color:"#2e6da4" }}>{count}</div>
                    <div style={{ height:3, background:"#e2e8f0", borderRadius:2, marginTop:5 }}>
                      <div style={{ height:3, width:`${pct}%`, background:"#2e6da4", borderRadius:2 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>}

        {/* ── Alertas WhatsApp ── */}
        {tab==="alertas" && <>
          <div style={{ background:"#f0fff4", border:"1px solid #9ae6b4", borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
            <WaIcon size={18}/>
            <div style={{ fontSize:12, color:"#4a5568" }}>Clique em <b>"Enviar pelo WhatsApp"</b> para ver a mensagem pronta e abrir o WhatsApp Web.</div>
          </div>

          {dados.filter(c=>c.status.label==="Vencido").length>0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ width:9, height:9, borderRadius:"50%", background:"#c53030", display:"inline-block" }}/>
                <span style={{ fontWeight:700, fontSize:14, color:"#c53030" }}>Vencidas — contato urgente</span>
              </div>
              {dados.filter(c=>c.status.label==="Vencido").sort((a,b)=>a.dias-b.dias).map(c=>(
                <AlertaCard key={c.id} c={c} onPreview={()=>abrirPreview(c)}/>
              ))}
            </div>
          )}

          {dados.filter(c=>c.status.label==="Vence em breve").length>0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ width:9, height:9, borderRadius:"50%", background:"#d69e2e", display:"inline-block" }}/>
                <span style={{ fontWeight:700, fontSize:14, color:"#b7791f" }}>Vencem nos próximos 30 dias</span>
              </div>
              {dados.filter(c=>c.status.label==="Vence em breve").sort((a,b)=>a.dias-b.dias).map(c=>(
                <AlertaCard key={c.id} c={c} onPreview={()=>abrirPreview(c)}/>
              ))}
            </div>
          )}

          {alertas.length===0 && (
            <div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
              <div style={{ fontWeight:700, color:"#276749" }}>Tudo em dia!</div>
            </div>
          )}
        </>}

        {/* ── Leads ── */}
        {tab==="leads" && <>
          <div style={{ display:"flex", gap:10, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
            <input placeholder="🔍 Buscar lead..." value={buscaLead} onChange={e=>setBuscaLead(e.target.value)} style={{ ...inp, width:200, flex:"none" }}/>
            <span style={{ fontSize:12, color:"#718096", marginLeft:"auto" }}>{leads.length} lead(s)</span>
            <button onClick={()=>{ setShowLeadForm(true); setEditLead(null); setNL({ nome:"", contato:"", interesse:"Automóvel", origem:"Indicação", status:"Novo", observacao:"" }); }} style={{ background:"#553c9a", color:"#fff", border:"none", borderRadius:8, padding:"8px 14px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              + Novo Lead
            </button>
          </div>

          {/* Cards de funil */}
          <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
            {STATUS_LEAD.map(s => {
              const count = leads.filter(l=>l.status===s).length;
              const st = STATUS_LEAD_STYLE[s];
              return (
                <div key={s} style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:10, padding:"10px 14px", minWidth:110, textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontSize:10, color:st.color, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{s}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:st.color, marginTop:2 }}>{count}</div>
                </div>
              );
            })}
          </div>

          {/* Lista de leads */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {leadsFiltrados.map(l => {
              const st = STATUS_LEAD_STYLE[l.status] || STATUS_LEAD_STYLE["Novo"];
              return (
                <div key={l.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>{l.nome}</span>
                        <span style={{ fontSize:11, background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>{l.status}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#4a5568", marginBottom:2 }}>
                        🎯 {l.interesse} &nbsp;·&nbsp; 📍 {l.origem} &nbsp;·&nbsp; 📅 {l.data}
                      </div>
                      <div style={{ fontSize:12, color:"#718096" }}>📞 {l.contato}</div>
                      {l.observacao && <div style={{ fontSize:12, color:"#4a5568", marginTop:4, fontStyle:"italic" }}>💬 {l.observacao}</div>}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <button onClick={()=>abrirPreviewLead(l)} style={{ display:"inline-flex", alignItems:"center", gap:5, background:WA, color:"#fff", border:"none", borderRadius:7, padding:"6px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                        <WaIcon size={12}/> Contatar
                      </button>
                      <button onClick={()=>abrirEditLead(l)} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", color:"#4a5568" }}>
                        ✏️ Editar
                      </button>
                      {l.status !== "Convertido" && (
                        <button onClick={()=>converterLead(l)} style={{ background:"#f0fff4", border:"1px solid #68d391", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", color:"#276749" }}>
                          ✅ Converter
                        </button>
                      )}
                      <button onClick={()=>setLeads(p=>p.filter(x=>x.id!==l.id))} style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 10px", fontSize:11, color:"#718096", cursor:"pointer" }}>
                        ✕ Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {leadsFiltrados.length===0 && (
              <div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0", color:"#a0aec0" }}>Nenhum lead encontrado.</div>
            )}
          </div>
        </>}

        {/* ── Lista Apólices ── */}
        {tab==="lista" && <>
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
            <input placeholder="🔍 Buscar..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ ...inp, width:190, flex:"none" }}/>
            <select value={filtroStatus} onChange={e=>setFS(e.target.value)} style={{ ...inp, width:165, flex:"none" }}>{STATUS_APOLICE.map(s=><option key={s}>{s}</option>)}</select>
            <select value={filtroTipo}   onChange={e=>setFT(e.target.value)} style={{ ...inp, width:145, flex:"none" }}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select>
            <span style={{ fontSize:12, color:"#718096", marginLeft:"auto" }}>{filtrados.length}</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtrados.map(c=>(
              <div key={c.id} style={{ background:"#fff", border:`1px solid ${c.status.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>{c.cliente}</span>
                      <span style={{ fontSize:11, background:c.status.bg, color:c.status.color, border:`1px solid ${c.status.border}`, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>{c.status.icon} {c.status.label}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#4a5568", marginBottom:2 }}>{c.tipo} · <b>{c.apolice}</b> · {c.seguradora}</div>
                    <div style={{ fontSize:12, color:"#718096" }}>
                      📅 Vence: {fmt(c.vencimento)} &nbsp;·&nbsp;
                      <span style={{ color:c.status.color, fontWeight:600 }}>{c.dias<0?`Venceu há ${Math.abs(c.dias)}d`:`Faltam ${c.dias}d`}</span>
                      &nbsp;·&nbsp; 💰 R$ {c.premio.toLocaleString("pt-BR")}
                    </div>
                    <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>📞 {c.contato} &nbsp;·&nbsp; CPF: {c.cpf}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {c.status.label!=="Vigente" && (
                      <button onClick={()=>abrirPreview(c)} style={{ display:"inline-flex", alignItems:"center", gap:5, background:WA, color:"#fff", border:"none", borderRadius:7, padding:"6px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                        <WaIcon size={12}/> Avisar
                      </button>
                    )}
                    <button onClick={()=>setClientes(p=>p.filter(x=>x.id!==c.id))} style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 10px", fontSize:11, color:"#718096", cursor:"pointer" }}>
                      ✕ Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtrados.length===0&&<div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0", color:"#a0aec0" }}>Nenhuma apólice encontrada.</div>}
          </div>
        </>}
      </div>

      {/* ── Modal Prévia WhatsApp ── */}
      {preview && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:440, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ background:WA, padding:"14px 18px", borderRadius:"16px 16px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <WaIcon size={20}/>
                <div>
                  <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>Prévia da mensagem</div>
                  <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>Para: {preview.c.cliente} · {preview.c.contato}</div>
                </div>
              </div>
              <button onClick={()=>setPreview(null)} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:6, color:"#fff", cursor:"pointer", fontSize:15, padding:"2px 7px", fontWeight:700 }}>✕</button>
            </div>
            <div style={{ padding:"16px 14px 10px", background:"#e5ddd5" }}>
              <div style={{ background:"#fff", borderRadius:"0 12px 12px 12px", padding:"10px 14px", maxWidth:"85%", boxShadow:"0 1px 2px rgba(0,0,0,0.15)", whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.55, color:"#1a202c" }}>
                {preview.msg}
                <div style={{ fontSize:10, color:"#a0aec0", textAlign:"right", marginTop:6 }}>
                  {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} ✓✓
                </div>
              </div>
            </div>
            <div style={{ padding:"14px 18px", display:"flex", gap:8, flexDirection:"column" }}>
              <a href={preview.link} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:WA, color:"#fff", borderRadius:10, padding:"11px 18px", fontWeight:700, fontSize:14, textDecoration:"none" }}>
                <WaIcon size={17}/> Abrir no WhatsApp Web
              </a>
              <button onClick={()=>{ navigator.clipboard.writeText(preview.msg); setCopied(true); }} style={{ background:copied?"#f0fff4":"#f8fafc", border:`1px solid ${copied?"#9ae6b4":"#e2e8f0"}`, borderRadius:10, padding:"9px 18px", fontWeight:600, fontSize:13, cursor:"pointer", color:copied?"#276749":"#4a5568" }}>
                {copied ? "✓ Copiado!" : "📋 Copiar mensagem"}
              </button>
              <button onClick={()=>setPreview(null)} style={{ background:"none", border:"none", color:"#a0aec0", cursor:"pointer", fontSize:12 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Novo Lead ── */}
      {showLeadForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:998, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:18, color:"#1a3a5c" }}>🎯 {editLead ? "Editar Lead" : "Novo Lead"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ gridColumn:"span 2" }}>
                <label style={lbl}>Nome *</label>
                <input value={nl.nome} onChange={e=>setNL(p=>({...p,nome:e.target.value}))} style={inp} placeholder="Nome completo"/>
              </div>
              <div>
                <label style={lbl}>WhatsApp</label>
                <input value={nl.contato} onChange={e=>setNL(p=>({...p,contato:e.target.value}))} style={inp} placeholder="(11) 99999-9999"/>
              </div>
              <div>
                <label style={lbl}>Interesse</label>
                <select value={nl.interesse} onChange={e=>setNL(p=>({...p,interesse:e.target.value}))} style={inp}>
                  {TIPOS.slice(1).map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Origem</label>
                <select value={nl.origem} onChange={e=>setNL(p=>({...p,origem:e.target.value}))} style={inp}>
                  {ORIGENS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={nl.status} onChange={e=>setNL(p=>({...p,status:e.target.value}))} style={inp}>
                  {STATUS_LEAD.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={lbl}>Observação</label>
                <textarea value={nl.observacao} onChange={e=>setNL(p=>({...p,observacao:e.target.value}))} style={{ ...inp, height:70, resize:"vertical" }} placeholder="Detalhes, interesses, anotações..."/>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowLeadForm(false)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontWeight:600, fontSize:13 }}>Cancelar</button>
              <button onClick={salvarLead} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#553c9a", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                {editLead ? "Salvar alterações" : "Adicionar Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nova Apólice ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:997, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:18, color:"#1a3a5c" }}>🛡️ Nova Apólice</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["cliente","Cliente *","text"],["cpf","CPF/CNPJ","text"],["apolice","Nº Apólice","text"],["seguradora","Seguradora","text"],["contato","WhatsApp *","text"],["premio","Prêmio (R$)","number"]].map(([k,l,t])=>(
                <div key={k}>
                  <label style={lbl}>{l}</label>
                  <input type={t} value={nc[k]} onChange={e=>setNC(p=>({...p,[k]:e.target.value}))} style={inp} placeholder={k==="contato"?"(11) 99999-9999":""}/>
                </div>
              ))}
              <div>
                <label style={lbl}>Tipo *</label>
                <select value={nc.tipo} onChange={e=>setNC(p=>({...p,tipo:e.target.value}))} style={inp}>
                  {TIPOS.slice(1).map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Início</label>
                <input type="date" value={nc.inicio} onChange={e=>setNC(p=>({...p,inicio:e.target.value}))} style={inp}/>
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={lbl}>Vencimento *</label>
                <input type="date" value={nc.vencimento} onChange={e=>setNC(p=>({...p,vencimento:e.target.value}))} style={inp}/>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowForm(false)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontWeight:600, fontSize:13 }}>Cancelar</button>
              <button onClick={salvarNovo} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#1a3a5c", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}