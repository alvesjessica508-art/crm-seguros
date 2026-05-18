import { useState, useMemo, useEffect } from "react";

const SUPABASE_URL = "https://evxflboyrkkznivzugyp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGZsYm95cmtrem5pdnp1Z3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjUzNTgsImV4cCI6MjA5NDYwMTM1OH0.xE0CVN-w20ftX7_-XCA5hyK955EpdoOwSeaqScMlATU";

async function sbFetch(table, options = {}) {
  const { method = "GET", body, params = "" } = options;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);
function diffDays(a, b) { return Math.round((new Date(a) - b) / 86400000); }
function fmt(d) { return d ? new Date(d).toLocaleDateString("pt-BR") : "-"; }
function toISO(d) { if (!d) return ""; const dt = new Date(d); return isNaN(dt) ? "" : dt.toISOString().split("T")[0]; }
function limparFone(f) { const d = (f || "").replace(/\D/g, ""); return d.startsWith("55") ? d : "55" + d; }
function hashSenha(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; } return h.toString(36); }

function gerarMsgVencendo(c) {
  const dias = diffDays(c.vencimento, today);
  return `Olá, ${c.cliente.split(" ")[0]}! 👋\n\nPassando para avisar que seu seguro de *${c.tipo}* (Apólice ${c.apolice} – ${c.seguradora}) vence em *${dias} dia${dias > 1 ? "s" : ""}*, no dia *${fmt(c.vencimento)}*.\n\nPara renovar e manter sua proteção em dia, entre em contato! 😊\n\nAtt,\nCorretora de Seguros`;
}
function gerarMsgVencido(c) {
  const dias = Math.abs(diffDays(c.vencimento, today));
  return `Olá, ${c.cliente.split(" ")[0]}! 👋\n\nIdentificamos que seu seguro de *${c.tipo}* (Apólice ${c.apolice} – ${c.seguradora}) *venceu há ${dias} dia${dias > 1 ? "s" : ""}*, em ${fmt(c.vencimento)}.\n\n⚠️ Você está sem cobertura! Vamos regularizar o quanto antes?\n\nAtt,\nCorretora de Seguros`;
}
function gerarMsgLead(l) {
  return `Olá, ${l.nome.split(" ")[0]}! 👋\n\nTudo bem? Sou corretor de seguros e gostaria de apresentar opções de *seguro de ${l.interesse}* para você!\n\nPosso te passar uma cotação sem compromisso? 😊\n\nAtt,\nCorretora de Seguros`;
}
function linkWA(fone, msg) { return `https://wa.me/${limparFone(fone)}?text=${encodeURIComponent(msg)}`; }

function getStatus(venc) {
  const d = diffDays(venc, today);
  if (d < 0)   return { label: "Vencido",        color: "#c53030", bg: "#fff5f5", border: "#fc8181", icon: "✕" };
  if (d <= 30) return { label: "Vence em breve", color: "#b7791f", bg: "#fffff0", border: "#f6e05e", icon: "⚡" };
  return        { label: "Vigente",              color: "#276749", bg: "#f0fff4", border: "#68d391", icon: "✓" };
}

// ── Constantes ────────────────────────────────────────────────────────────────
const SEGURADORAS = [
  "Aliro Seguro","Allianz Seguros","Assistência Helps","Azul Seguros",
  "Bradesco Seguros","Europ Assistance","HDI Seguros","Liberty",
  "Mapfre","Porto Seguro","Santander Auto","Sompo Auto",
  "SulAmérica","SUHAI","Tokio Marine Seguros","Yelum Seguradoras",
  "Zurich Brasil Seguros","Outra",
];
const TIPOS         = ["Todos","Automóvel","Vida","Saúde","Residencial","Empresarial","Rural"];
const STATUS_LEAD   = ["Novo","Em contato","Cotação enviada","Sem retorno","Convertido","Perdido"];
const ORIGENS       = ["Indicação","Instagram","WhatsApp","Site","Facebook","Outro"];
const STATUS_AP     = ["Todos","Vigente","Vence em breve","Vencido"];
const SL = {
  "Novo":            { color:"#2e6da4", bg:"#ebf4ff", border:"#90cdf4" },
  "Em contato":      { color:"#b7791f", bg:"#fffff0", border:"#f6e05e" },
  "Cotação enviada": { color:"#553c9a", bg:"#faf5ff", border:"#d6bcfa" },
  "Sem retorno":     { color:"#718096", bg:"#f7fafc", border:"#e2e8f0" },
  "Convertido":      { color:"#276749", bg:"#f0fff4", border:"#68d391" },
  "Perdido":         { color:"#c53030", bg:"#fff5f5", border:"#fc8181" },
};
const WA = "#25D366", WA2 = "#128C7E";
const NC_VAZIO = { cliente:"", cpf:"", tipo:"Automóvel", seguradora:"Porto Seguro", apolice:"", inicio:"", vencimento:"", premio:"", contato:"", placa:"" };
const NL_VAZIO = { nome:"", contato:"", interesse:"Automóvel", origem:"Indicação", status:"Novo", observacao:"" };

const WaIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ── Tela de Login / Cadastro ──────────────────────────────────────────────────
function TelaLogin({ onLogin }) {
  const [modo, setModo]       = useState("login"); // "login" | "cadastro"
  const [nome, setNome]       = useState("");
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro]       = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const inp = { padding:"11px 14px", borderRadius:10, border:"1px solid #e2e8f0", fontSize:14, width:"100%", background:"#f8fafc", boxSizing:"border-box", outline:"none" };

  async function handleLogin(e) {
    e.preventDefault(); setErro(""); setLoading(true);
    try {
      const res = await sbFetch("usuarios", { params:`?email=eq.${encodeURIComponent(email)}&senha=eq.${hashSenha(senha)}` });
      if (res.length === 0) { setErro("E-mail ou senha incorretos."); setLoading(false); return; }
      onLogin(res[0]);
    } catch { setErro("Erro ao conectar. Tente novamente."); }
    setLoading(false);
  }

  async function handleCadastro(e) {
    e.preventDefault(); setErro(""); 
    if (senha !== confirma) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6)   { setErro("A senha deve ter no mínimo 6 caracteres."); return; }
    setLoading(true);
    try {
      const existe = await sbFetch("usuarios", { params:`?email=eq.${encodeURIComponent(email)}` });
      if (existe.length > 0) { setErro("Este e-mail já está cadastrado."); setLoading(false); return; }
      const res = await sbFetch("usuarios", { method:"POST", body:{ nome, email, senha: hashSenha(senha) } });
      onLogin(res[0]);
    } catch { setErro("Erro ao cadastrar. Tente novamente."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a3a5c 0%,#2e6da4 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:36, width:"100%", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>🛡️</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#1a3a5c", letterSpacing:-0.5 }}>CRM Seguros</div>
          <div style={{ fontSize:13, color:"#718096", marginTop:4 }}>
            {modo === "login" ? "Faça login para continuar" : "Crie sua conta gratuitamente"}
          </div>
        </div>

        {/* Tabs login/cadastro */}
        <div style={{ display:"flex", background:"#f1f5f9", borderRadius:10, padding:4, marginBottom:24 }}>
          {[["login","Entrar"],["cadastro","Criar conta"]].map(([k,l]) => (
            <button key={k} onClick={() => { setModo(k); setErro(""); }} style={{ flex:1, padding:"8px", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13, background:modo===k?"#fff":"transparent", color:modo===k?"#1a3a5c":"#718096", boxShadow:modo===k?"0 1px 4px rgba(0,0,0,0.1)":"none", transition:"all 0.2s" }}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={modo === "login" ? handleLogin : handleCadastro}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {modo === "cadastro" && (
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5 }}>SEU NOME</label>
                <input value={nome} onChange={e=>setNome(e.target.value)} style={inp} placeholder="Nome completo" required/>
              </div>
            )}

            <div>
              <label style={{ fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5 }}>E-MAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} placeholder="seu@email.com" required/>
            </div>

            <div>
              <label style={{ fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5 }}>SENHA</label>
              <div style={{ position:"relative" }}>
                <input type={mostrarSenha?"text":"password"} value={senha} onChange={e=>setSenha(e.target.value)} style={{ ...inp, paddingRight:44 }} placeholder={modo==="cadastro"?"Mínimo 6 caracteres":"••••••••"} required/>
                <button type="button" onClick={()=>setMostrarSenha(!mostrarSenha)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#718096" }}>
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {modo === "cadastro" && (
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5 }}>CONFIRMAR SENHA</label>
                <input type="password" value={confirma} onChange={e=>setConfirma(e.target.value)} style={inp} placeholder="Digite a senha novamente" required/>
              </div>
            )}

            {erro && (
              <div style={{ background:"#fff5f5", border:"1px solid #fc8181", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#c53030", textAlign:"center" }}>
                ⚠️ {erro}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ background:"linear-gradient(135deg,#1a3a5c,#2e6da4)", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontWeight:800, fontSize:15, cursor:"pointer", marginTop:4, opacity:loading?0.7:1 }}>
              {loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </form>

        <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:"#a0aec0" }}>
          {modo === "login" ? (
            <span>Não tem conta? <button onClick={()=>{setModo("cadastro");setErro("");}} style={{ background:"none", border:"none", color:"#2e6da4", cursor:"pointer", fontWeight:700, fontSize:12 }}>Criar agora</button></span>
          ) : (
            <span>Já tem conta? <button onClick={()=>{setModo("login");setErro("");}} style={{ background:"none", border:"none", color:"#2e6da4", cursor:"pointer", fontWeight:700, fontSize:12 }}>Entrar</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Formulário de Apólice ─────────────────────────────────────────────────────
function FormApolice({ inicial, onSalvar, onFechar, salvando }) {
  const [f, setF] = useState(inicial);
  const editando = !!inicial.id;
  const inp = { padding:"9px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13, width:"100%", background:"#f8fafc", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4, display:"block" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:22, width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto" }}>
        
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ fontWeight:800, fontSize:15, color:"#1a3a5c" }}>{editando ? "✏️ Editar Apólice" : "🛡️ Nova Apólice"}</div>
          <button onClick={onFechar} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:16, color:"#718096" }}>✕</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          <div style={{ gridColumn:"span 2" }}>
            <label style={lbl}>Nome do Cliente *</label>
            <input value={f.cliente} onChange={e=>setF(p=>({...p,cliente:e.target.value}))} style={inp} placeholder="Nome completo"/>
          </div>

          <div>
            <label style={lbl}>CPF / CNPJ</label>
            <input value={f.cpf||""} onChange={e=>setF(p=>({...p,cpf:e.target.value}))} style={inp} placeholder="000.000.000-00"/>
          </div>

          <div>
            <label style={lbl}>WhatsApp *</label>
            <input value={f.contato||""} onChange={e=>setF(p=>({...p,contato:e.target.value}))} style={inp} placeholder="(11) 99999-9999"/>
          </div>

          <div>
            <label style={lbl}>Tipo de Seguro *</label>
            <select value={f.tipo} onChange={e=>setF(p=>({...p,tipo:e.target.value}))} style={inp}>
              {TIPOS.slice(1).map(t=><option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Seguradora</label>
            <select value={f.seguradora||""} onChange={e=>setF(p=>({...p,seguradora:e.target.value}))} style={inp}>
              <option value="">Selecione...</option>
              {SEGURADORAS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Nº Apólice</label>
            <input value={f.apolice||""} onChange={e=>setF(p=>({...p,apolice:e.target.value}))} style={inp} placeholder="Ex: PS-001234"/>
          </div>

          <div>
            <label style={lbl}>Prêmio (R$)</label>
            <input type="number" value={f.premio||""} onChange={e=>setF(p=>({...p,premio:e.target.value}))} style={inp} placeholder="0,00"/>
          </div>

          {/* Placa — destaque para Automóvel */}
          <div style={{ gridColumn:"span 2" }}>
            <label style={lbl}>
              Placa do Veículo
              {f.tipo === "Automóvel" && <span style={{ marginLeft:6, background:"#2e6da4", color:"#fff", borderRadius:4, padding:"1px 6px", fontSize:9, fontWeight:700 }}>AUTOMÓVEL</span>}
            </label>
            <input
              value={f.placa||""}
              onChange={e=>setF(p=>({...p,placa:e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,"")}))}
              style={{ ...inp, fontFamily:"monospace", letterSpacing:3, fontSize:15, fontWeight:700 }}
              placeholder="ABC-1234 ou BRA2E19"
              maxLength={8}
            />
          </div>

          <div>
            <label style={lbl}>Início da Vigência</label>
            <input type="date" value={f.inicio||""} onChange={e=>setF(p=>({...p,inicio:e.target.value}))} style={inp}/>
          </div>

          <div>
            <label style={lbl}>Vencimento *</label>
            <input type="date" value={f.vencimento||""} onChange={e=>setF(p=>({...p,vencimento:e.target.value}))} style={inp}/>
          </div>

        </div>

        <div style={{ display:"flex", gap:8, marginTop:20, justifyContent:"flex-end" }}>
          <button onClick={onFechar} style={{ padding:"9px 18px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontWeight:600, fontSize:13 }}>Cancelar</button>
          <button onClick={()=>onSalvar(f)} disabled={salvando||!f.cliente||!f.vencimento}
            style={{ padding:"9px 18px", borderRadius:8, border:"none", background:"#1a3a5c", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, opacity:(salvando||!f.cliente||!f.vencimento)?0.6:1 }}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar Apólice"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AlertaCard ────────────────────────────────────────────────────────────────
function AlertaCard({ c, onPreview }) {
  const dias = diffDays(c.vencimento, today);
  const st   = getStatus(c.vencimento);
  return (
    <div style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
      <div style={{ flex:1, minWidth:180 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>{c.cliente}</span>
          <span style={{ fontSize:11, background:st.color, color:"#fff", borderRadius:6, padding:"2px 7px", fontWeight:700 }}>
            {dias<0?`Venceu há ${Math.abs(dias)}d`:`Vence em ${dias}d`}
          </span>
        </div>
        <div style={{ fontSize:12, color:"#4a5568" }}>
          {c.tipo} · <b>{c.apolice}</b> · {c.seguradora}
          {c.placa&&<span style={{ marginLeft:6, background:"#edf2f7", borderRadius:4, padding:"1px 6px", fontFamily:"monospace", fontWeight:700, fontSize:11 }}>🚗 {c.placa}</span>}
        </div>
        <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>📅 {fmt(c.vencimento)} · 📞 {c.contato}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
        <div style={{ fontSize:13, fontWeight:700 }}>R$ {Number(c.premio||0).toLocaleString("pt-BR")}</div>
        <button onClick={onPreview} style={{ display:"inline-flex", alignItems:"center", gap:6, background:WA, color:"#fff", border:"none", borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          <WaIcon/> Enviar WhatsApp
        </button>
      </div>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario]           = useState(() => { try { return JSON.parse(localStorage.getItem("crm_usuario")||"null"); } catch { return null; } });
  const [clientes, setClientes]         = useState([]);
  const [leads, setLeads]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erro, setErro]                 = useState(null);
  const [filtroStatus, setFS]           = useState("Todos");
  const [filtroTipo, setFT]             = useState("Todos");
  const [busca, setBusca]               = useState("");
  const [buscaLead, setBuscaLead]       = useState("");
  const [tab, setTab]                   = useState("dashboard");
  const [formApolice, setFormApolice]   = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [preview, setPreview]           = useState(null);
  const [copied, setCopied]             = useState(false);
  const [editLead, setEditLead]         = useState(null);
  const [salvando, setSalvando]         = useState(false);
  const [nl, setNL]                     = useState(NL_VAZIO);

  function handleLogin(u) {
    localStorage.setItem("crm_usuario", JSON.stringify(u));
    setUsuario(u);
  }
  function handleLogout() {
    localStorage.removeItem("crm_usuario");
    setUsuario(null);
    setClientes([]); setLeads([]);
  }

  if (!usuario) return <TelaLogin onLogin={handleLogin}/>;

  async function carregarDados() {
    try {
      setLoading(true); setErro(null);
      const email = encodeURIComponent(usuario.email);
      const [cls, lds] = await Promise.all([
        sbFetch("clientes", { params:`?user_email=eq.${email}&order=created_at.desc` }),
        sbFetch("leads",    { params:`?user_email=eq.${email}&order=created_at.desc` }),
      ]);
      setClientes(cls); setLeads(lds);
    } catch { setErro("Erro ao carregar dados."); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, []);

  const dados = useMemo(()=>
    clientes.map(c=>({ ...c, status:getStatus(c.vencimento), dias:diffDays(c.vencimento,today) })),
    [clientes]
  );
  const filtrados = useMemo(()=>dados.filter(c=>{
    const s=filtroStatus==="Todos"||c.status.label===filtroStatus;
    const t=filtroTipo==="Todos"||c.tipo===filtroTipo;
    const b=!busca||c.cliente.toLowerCase().includes(busca.toLowerCase())||(c.apolice||"").toLowerCase().includes(busca.toLowerCase())||(c.placa||"").toLowerCase().includes(busca.toLowerCase());
    return s&&t&&b;
  }),[dados,filtroStatus,filtroTipo,busca]);
  const leadsFiltrados = useMemo(()=>leads.filter(l=>
    !buscaLead||l.nome.toLowerCase().includes(buscaLead.toLowerCase())||(l.interesse||"").toLowerCase().includes(buscaLead.toLowerCase())
  ),[leads,buscaLead]);
  const stats = useMemo(()=>({
    total:dados.length, vigentes:dados.filter(c=>c.status.label==="Vigente").length,
    breve:dados.filter(c=>c.status.label==="Vence em breve").length,
    vencidos:dados.filter(c=>c.status.label==="Vencido").length,
    premio:dados.reduce((s,c)=>s+Number(c.premio||0),0),
    leadsNovos:leads.filter(l=>l.status==="Novo").length,
  }),[dados,leads]);
  const alertas = useMemo(()=>dados.filter(c=>c.status.label!=="Vigente").sort((a,b)=>a.dias-b.dias),[dados]);

  function abrirPreview(c) {
    const dias=diffDays(c.vencimento,today);
    const msg=dias<0?gerarMsgVencido(c):gerarMsgVencendo(c);
    setPreview({ c, msg, link:linkWA(c.contato,msg) }); setCopied(false);
  }
  function abrirPreviewLead(l) {
    const msg=gerarMsgLead(l);
    setPreview({ c:{cliente:l.nome,contato:l.contato}, msg, link:linkWA(l.contato,msg) }); setCopied(false);
  }

  async function salvarApolice(f) {
    if (!f.cliente||!f.vencimento) return;
    setSalvando(true);
    try {
      const payload = { ...f, premio:parseFloat(f.premio)||0, inicio:f.inicio||null, placa:f.placa||null, user_email:usuario.email };
      if (f.id) {
        const { id, status, dias, created_at, ...body } = payload;
        await sbFetch("clientes", { method:"PATCH", params:`?id=eq.${f.id}`, body });
      } else {
        const { id, status, dias, ...body } = payload;
        await sbFetch("clientes", { method:"POST", body });
      }
      setFormApolice(null); await carregarDados();
    } catch { setErro("Erro ao salvar apólice."); }
    setSalvando(false);
  }

  async function excluirCliente(id) {
    if (!confirm("Remover esta apólice?")) return;
    try { await sbFetch("clientes",{ method:"DELETE", params:`?id=eq.${id}` }); setClientes(p=>p.filter(c=>c.id!==id)); }
    catch { setErro("Erro ao excluir."); }
  }

  function abrirEdicao(c) {
    setFormApolice({ ...c, inicio:toISO(c.inicio), vencimento:toISO(c.vencimento), placa:c.placa||"" });
  }

  async function salvarLead() {
    if (!nl.nome) return;
    setSalvando(true);
    try {
      if (editLead) {
        await sbFetch("leads",{ method:"PATCH", params:`?id=eq.${editLead}`, body:nl });
        setEditLead(null);
      } else {
        await sbFetch("leads",{ method:"POST", body:{ ...nl, data:new Date().toLocaleDateString("pt-BR"), user_email:usuario.email } });
      }
      setNL(NL_VAZIO); setShowLeadForm(false); await carregarDados();
    } catch { setErro("Erro ao salvar lead."); }
    setSalvando(false);
  }

  async function excluirLead(id) {
    if (!confirm("Remover este lead?")) return;
    try { await sbFetch("leads",{ method:"DELETE", params:`?id=eq.${id}` }); setLeads(p=>p.filter(l=>l.id!==id)); }
    catch { setErro("Erro ao excluir."); }
  }

  function abrirEditLead(l) {
    setNL({ nome:l.nome, contato:l.contato, interesse:l.interesse, origem:l.origem, status:l.status, observacao:l.observacao||"" });
    setEditLead(l.id); setShowLeadForm(true);
  }

  async function converterLead(l) {
    await sbFetch("leads",{ method:"PATCH", params:`?id=eq.${l.id}`, body:{ status:"Convertido" } });
    setLeads(p=>p.map(x=>x.id===l.id?{...x,status:"Convertido"}:x));
    setFormApolice({ ...NC_VAZIO, cliente:l.nome, contato:l.contato, tipo:l.interesse });
    setTab("lista");
  }

  const inp = { padding:"8px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13, width:"100%", background:"#f8fafc", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4, display:"block" };

  const Card = ({ label, value, sub, color, bg }) => (
    <div style={{ background:bg||"#fff", border:`1px solid ${color}22`, borderRadius:12, padding:"14px 16px", flex:1, minWidth:110 }}>
      <div style={{ fontSize:10, color:"#718096", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      {sub&&<div style={{ fontSize:11, color:"#a0aec0", marginTop:4 }}>{sub}</div>}
    </div>
  );

  const TABS = [["dashboard","📊 Dashboard"],["alertas","📣 Alertas"],["leads","🎯 Leads"],["lista","📋 Lista"]];

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#f1f5f9", gap:16 }}>
      <div style={{ width:40, height:40, border:"4px solid #e2e8f0", borderTop:"4px solid #2e6da4", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <div style={{ color:"#718096", fontSize:14 }}>Carregando dados...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f1f5f9", minHeight:"100vh" }}>

      {erro&&(
        <div style={{ background:"#fff5f5", border:"1px solid #fc8181", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#c53030", fontSize:13 }}>⚠️ {erro}</span>
          <button onClick={()=>setErro(null)} style={{ background:"none", border:"none", color:"#c53030", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a3a5c 0%,#2e6da4 100%)", padding:"18px 16px 0", color:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:-0.5 }}>🛡️ CRM Seguros</div>
            <div style={{ fontSize:11, opacity:0.75, marginTop:1 }}>
              Olá, <b>{usuario.nome}</b> · {new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long"})}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
            <button onClick={carregarDados} title="Atualizar" style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, padding:"7px 11px", fontSize:13, cursor:"pointer" }}>🔄</button>
            {alertas.length>0&&(
              <button onClick={()=>setTab("alertas")} style={{ background:WA, color:"#fff", border:"none", borderRadius:8, padding:"7px 11px", fontWeight:700, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <WaIcon size={13}/>
                <span style={{ background:"#fff", color:WA2, borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:800 }}>{alertas.length}</span>
              </button>
            )}
            <button onClick={()=>{ setShowLeadForm(true); setEditLead(null); setNL(NL_VAZIO); }} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, padding:"7px 11px", fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Lead</button>
            <button onClick={()=>setFormApolice({...NC_VAZIO})} style={{ background:"#fff", color:"#1a3a5c", border:"none", borderRadius:8, padding:"7px 11px", fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Apólice</button>
            <button onClick={handleLogout} title="Sair" style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"7px 10px", fontSize:12, cursor:"pointer" }}>Sair</button>
          </div>
        </div>
        <div style={{ display:"flex", gap:2, overflowX:"auto" }}>
          {TABS.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:"8px 14px", border:"none", borderRadius:"8px 8px 0 0", cursor:"pointer", fontWeight:600, fontSize:12, whiteSpace:"nowrap", background:tab===k?"#f1f5f9":"transparent", color:tab===k?"#1a3a5c":"rgba(255,255,255,0.75)" }}>
              {l}
              {k==="alertas"&&alertas.length>0&&<span style={{ marginLeft:4, background:WA, color:"#fff", borderRadius:10, padding:"1px 5px", fontSize:9 }}>{alertas.length}</span>}
              {k==="leads"&&stats.leadsNovos>0&&<span style={{ marginLeft:4, background:"#e53e3e", color:"#fff", borderRadius:10, padding:"1px 5px", fontSize:9 }}>{stats.leadsNovos}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:14 }}>

        {/* Dashboard */}
        {tab==="dashboard"&&<>
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <Card label="Total"       value={stats.total}      sub="apólices"      color="#2e6da4" bg="#fff"/>
            <Card label="Vigentes"    value={stats.vigentes}   sub="com cobertura" color="#276749" bg="#f0fff4"/>
            <Card label="Vencem 30d"  value={stats.breve}      sub="atenção"       color="#b7791f" bg="#fffff0"/>
            <Card label="Vencidas"    value={stats.vencidos}   sub="sem cobertura" color="#c53030" bg="#fff5f5"/>
            <Card label="Leads Novos" value={stats.leadsNovos} sub="aguardando"    color="#553c9a" bg="#faf5ff"/>
          </div>
          <div style={{ background:"#1a3a5c", borderRadius:12, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>💰 Prêmio Total da Carteira</div>
            <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>R$ {stats.premio.toLocaleString("pt-BR")}</div>
          </div>

          {dados.length===0&&leads.length===0&&(
            <div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0", marginBottom:14 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🛡️</div>
              <div style={{ fontWeight:700, fontSize:16, color:"#1a3a5c", marginBottom:6 }}>Bem-vindo, {usuario.nome}!</div>
              <div style={{ fontSize:13, color:"#718096", marginBottom:20 }}>Comece adicionando sua primeira apólice ou lead.</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>setFormApolice({...NC_VAZIO})} style={{ background:"#1a3a5c", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Adicionar Apólice</button>
                <button onClick={()=>{ setShowLeadForm(true); setEditLead(null); setNL(NL_VAZIO); }} style={{ background:"#553c9a", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Adicionar Lead</button>
              </div>
            </div>
          )}

          {alertas.length>0&&(
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#1a202c" }}>📣 Precisam de contato</div>
                <button onClick={()=>setTab("alertas")} style={{ background:WA, color:"#fff", border:"none", borderRadius:7, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <WaIcon size={11}/> Ver todos
                </button>
              </div>
              {alertas.slice(0,3).map(c=>(
                <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f1f5f9", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:c.status.color, display:"inline-block", flexShrink:0 }}/>
                    <span style={{ fontWeight:600, color:"#1a202c", fontSize:13 }}>{c.cliente}</span>
                    <span style={{ fontSize:11, color:"#718096" }}>{c.tipo}{c.placa?` · 🚗 ${c.placa}`:""}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ color:c.status.color, fontWeight:700, fontSize:11 }}>{c.dias<0?`Venceu há ${Math.abs(c.dias)}d`:`Vence em ${c.dias}d`}</span>
                    <button onClick={()=>abrirPreview(c)} style={{ display:"inline-flex", alignItems:"center", gap:3, background:WA, color:"#fff", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      <WaIcon size={11}/> Avisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {leads.filter(l=>l.status==="Novo").length>0&&(
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#1a202c" }}>🎯 Leads novos</div>
                <button onClick={()=>setTab("leads")} style={{ background:"#553c9a", color:"#fff", border:"none", borderRadius:7, padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Ver todos</button>
              </div>
              {leads.filter(l=>l.status==="Novo").map(l=>(
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f1f5f9", gap:8 }}>
                  <div>
                    <span style={{ fontWeight:600, color:"#1a202c", fontSize:13 }}>{l.nome}</span>
                    <span style={{ marginLeft:6, fontSize:11, color:"#718096" }}>{l.interesse} · {l.origem}</span>
                  </div>
                  <button onClick={()=>abrirPreviewLead(l)} style={{ display:"inline-flex", alignItems:"center", gap:3, background:WA, color:"#fff", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    <WaIcon size={11}/> Contatar
                  </button>
                </div>
              ))}
            </div>
          )}

          {dados.length>0&&(
            <div style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#1a202c", marginBottom:10 }}>📈 Carteira por tipo</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {TIPOS.slice(1).map(tipo=>{ const count=dados.filter(c=>c.tipo===tipo).length; if(!count) return null; const pct=Math.round(count/dados.length*100);
                  return (<div key={tipo} style={{ flex:1, minWidth:85, background:"#f8fafc", borderRadius:8, padding:"8px 10px", border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:10, color:"#718096" }}>{tipo}</div>
                    <div style={{ fontWeight:800, fontSize:18, color:"#2e6da4" }}>{count}</div>
                    <div style={{ height:3, background:"#e2e8f0", borderRadius:2, marginTop:4 }}><div style={{ height:3, width:`${pct}%`, background:"#2e6da4", borderRadius:2 }}/></div>
                  </div>);
                })}
              </div>
            </div>
          )}
        </>}

        {/* Alertas */}
        {tab==="alertas"&&<>
          <div style={{ background:"#f0fff4", border:"1px solid #9ae6b4", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#4a5568", display:"flex", alignItems:"center", gap:8 }}>
            <WaIcon size={16}/> Clique em <b>"Enviar WhatsApp"</b> para abrir o WhatsApp com a mensagem pronta.
          </div>
          {dados.filter(c=>c.status.label==="Vencido").length>0&&(
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#c53030", display:"inline-block" }}/>
                <span style={{ fontWeight:700, fontSize:13, color:"#c53030" }}>Vencidas — contato urgente</span>
              </div>
              {dados.filter(c=>c.status.label==="Vencido").sort((a,b)=>a.dias-b.dias).map(c=><AlertaCard key={c.id} c={c} onPreview={()=>abrirPreview(c)}/>)}
            </div>
          )}
          {dados.filter(c=>c.status.label==="Vence em breve").length>0&&(
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#d69e2e", display:"inline-block" }}/>
                <span style={{ fontWeight:700, fontSize:13, color:"#b7791f" }}>Vencem nos próximos 30 dias</span>
              </div>
              {dados.filter(c=>c.status.label==="Vence em breve").sort((a,b)=>a.dias-b.dias).map(c=><AlertaCard key={c.id} c={c} onPreview={()=>abrirPreview(c)}/>)}
            </div>
          )}
          {alertas.length===0&&<div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0" }}><div style={{ fontSize:32, marginBottom:8 }}>🎉</div><div style={{ fontWeight:700, color:"#276749" }}>Tudo em dia!</div></div>}
        </>}

        {/* Leads */}
        {tab==="leads"&&<>
          <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center", flexWrap:"wrap" }}>
            <input placeholder="🔍 Buscar lead..." value={buscaLead} onChange={e=>setBuscaLead(e.target.value)} style={{ ...inp, width:180, flex:"none" }}/>
            <span style={{ fontSize:12, color:"#718096", marginLeft:"auto" }}>{leads.length} lead(s)</span>
            <button onClick={()=>{ setShowLeadForm(true); setEditLead(null); setNL(NL_VAZIO); }} style={{ background:"#553c9a", color:"#fff", border:"none", borderRadius:8, padding:"8px 12px", fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Novo Lead</button>
          </div>
          <div style={{ display:"flex", gap:7, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
            {STATUS_LEAD.map(s=>{ const count=leads.filter(l=>l.status===s).length; const st=SL[s];
              return (<div key={s} style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:10, padding:"8px 12px", minWidth:95, textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:9, color:st.color, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{s}</div>
                <div style={{ fontSize:20, fontWeight:800, color:st.color, marginTop:2 }}>{count}</div>
              </div>);
            })}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {leadsFiltrados.map(l=>{ const st=SL[l.status]||SL["Novo"]; return (
              <div key={l.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>{l.nome}</span>
                      <span style={{ fontSize:11, background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:20, padding:"2px 7px", fontWeight:700 }}>{l.status}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#4a5568", marginBottom:2 }}>🎯 {l.interesse} · 📍 {l.origem} · 📅 {l.data}</div>
                    <div style={{ fontSize:12, color:"#718096" }}>📞 {l.contato}</div>
                    {l.observacao&&<div style={{ fontSize:12, color:"#4a5568", marginTop:3, fontStyle:"italic" }}>💬 {l.observacao}</div>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <button onClick={()=>abrirPreviewLead(l)} style={{ display:"inline-flex", alignItems:"center", gap:4, background:WA, color:"#fff", border:"none", borderRadius:7, padding:"6px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}><WaIcon size={12}/> Contatar</button>
                    <button onClick={()=>abrirEditLead(l)} style={{ background:"#ebf4ff", border:"1px solid #90cdf4", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", color:"#2e6da4" }}>✏️ Editar</button>
                    {l.status!=="Convertido"&&<button onClick={()=>converterLead(l)} style={{ background:"#f0fff4", border:"1px solid #68d391", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", color:"#276749" }}>✅ Converter</button>}
                    <button onClick={()=>excluirLead(l.id)} style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 10px", fontSize:11, color:"#718096", cursor:"pointer" }}>✕ Remover</button>
                  </div>
                </div>
              </div>
            );})}
            {leadsFiltrados.length===0&&<div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0", color:"#a0aec0" }}>Nenhum lead encontrado.</div>}
          </div>
        </>}

        {/* Lista Apólices */}
        {tab==="lista"&&<>
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
            <input placeholder="🔍 Nome, apólice ou placa..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ ...inp, width:200, flex:"none" }}/>
            <select value={filtroStatus} onChange={e=>setFS(e.target.value)} style={{ ...inp, width:155, flex:"none" }}>{STATUS_AP.map(s=><option key={s}>{s}</option>)}</select>
            <select value={filtroTipo}   onChange={e=>setFT(e.target.value)} style={{ ...inp, width:135, flex:"none" }}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select>
            <span style={{ fontSize:12, color:"#718096", marginLeft:"auto" }}>{filtrados.length} resultado(s)</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtrados.map(c=>(
              <div key={c.id} style={{ background:"#fff", border:`1px solid ${c.status.border}`, borderRadius:12, padding:"13px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:14, color:"#1a202c" }}>{c.cliente}</span>
                      <span style={{ fontSize:11, background:c.status.bg, color:c.status.color, border:`1px solid ${c.status.border}`, borderRadius:20, padding:"2px 7px", fontWeight:700 }}>{c.status.icon} {c.status.label}</span>
                      {c.placa&&<span style={{ background:"#edf2f7", borderRadius:6, padding:"2px 8px", fontFamily:"monospace", fontWeight:800, fontSize:12, color:"#2d3748" }}>🚗 {c.placa}</span>}
                    </div>
                    <div style={{ fontSize:12, color:"#4a5568", marginBottom:2 }}>{c.tipo} · <b>{c.apolice}</b> · {c.seguradora}</div>
                    <div style={{ fontSize:12, color:"#718096" }}>
                      📅 Vence: {fmt(c.vencimento)} ·{" "}
                      <span style={{ color:c.status.color, fontWeight:600 }}>{c.dias<0?`Venceu há ${Math.abs(c.dias)}d`:`Faltam ${c.dias}d`}</span>
                      {" "}· 💰 R$ {Number(c.premio||0).toLocaleString("pt-BR")}
                    </div>
                    <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>📞 {c.contato} · CPF: {c.cpf}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {c.status.label!=="Vigente"&&(
                      <button onClick={()=>abrirPreview(c)} style={{ display:"inline-flex", alignItems:"center", gap:4, background:WA, color:"#fff", border:"none", borderRadius:7, padding:"6px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                        <WaIcon size={12}/> Avisar
                      </button>
                    )}
                    <button onClick={()=>abrirEdicao(c)} style={{ background:"#ebf4ff", border:"1px solid #90cdf4", borderRadius:7, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", color:"#2e6da4" }}>✏️ Editar</button>
                    <button onClick={()=>excluirCliente(c.id)} style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 10px", fontSize:11, color:"#718096", cursor:"pointer" }}>✕ Remover</button>
                  </div>
                </div>
              </div>
            ))}
            {filtrados.length===0&&<div style={{ background:"#fff", borderRadius:12, padding:40, textAlign:"center", border:"1px solid #e2e8f0", color:"#a0aec0" }}>Nenhuma apólice encontrada.</div>}
          </div>
        </>}
      </div>

      {/* Modal Prévia WhatsApp */}
      {preview&&(
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
                <div style={{ fontSize:10, color:"#a0aec0", textAlign:"right", marginTop:6 }}>{new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} ✓✓</div>
              </div>
            </div>
            <div style={{ padding:"14px 18px", display:"flex", gap:8, flexDirection:"column" }}>
              <a href={preview.link} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:WA, color:"#fff", borderRadius:10, padding:"11px 18px", fontWeight:700, fontSize:14, textDecoration:"none" }}>
                <WaIcon size={17}/> Abrir no WhatsApp Web
              </a>
              <button onClick={()=>{ navigator.clipboard.writeText(preview.msg); setCopied(true); }} style={{ background:copied?"#f0fff4":"#f8fafc", border:`1px solid ${copied?"#9ae6b4":"#e2e8f0"}`, borderRadius:10, padding:"9px 18px", fontWeight:600, fontSize:13, cursor:"pointer", color:copied?"#276749":"#4a5568" }}>
                {copied?"✓ Copiado!":"📋 Copiar mensagem"}
              </button>
              <button onClick={()=>setPreview(null)} style={{ background:"none", border:"none", color:"#a0aec0", cursor:"pointer", fontSize:12 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Apólice */}
      {formApolice!==null&&<FormApolice inicial={formApolice} onSalvar={salvarApolice} onFechar={()=>setFormApolice(null)} salvando={salvando}/>}

      {/* Modal Lead */}
      {showLeadForm&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:998, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:22, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#1a3a5c" }}>🎯 {editLead?"Editar Lead":"Novo Lead"}</div>
              <button onClick={()=>{ setShowLeadForm(false); setEditLead(null); }} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:16, color:"#718096" }}>✕</button>
            </div>
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
                <select value={nl.interesse} onChange={e=>setNL(p=>({...p,interesse:e.target.value}))} style={inp}>{TIPOS.slice(1).map(t=><option key={t}>{t}</option>)}</select>
              </div>
              <div>
                <label style={lbl}>Origem</label>
                <select value={nl.origem} onChange={e=>setNL(p=>({...p,origem:e.target.value}))} style={inp}>{ORIGENS.map(o=><option key={o}>{o}</option>)}</select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={nl.status} onChange={e=>setNL(p=>({...p,status:e.target.value}))} style={inp}>{STATUS_LEAD.map(s=><option key={s}>{s}</option>)}</select>
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={lbl}>Observação</label>
                <textarea value={nl.observacao} onChange={e=>setNL(p=>({...p,observacao:e.target.value}))} style={{ ...inp, height:70, resize:"vertical" }} placeholder="Detalhes, interesses, anotações..."/>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16, justifyContent:"flex-end" }}>
              <button onClick={()=>{ setShowLeadForm(false); setEditLead(null); }} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontWeight:600, fontSize:13 }}>Cancelar</button>
              <button onClick={salvarLead} disabled={salvando} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#553c9a", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, opacity:salvando?0.7:1 }}>
                {salvando?"Salvando...":editLead?"Salvar alterações":"Adicionar Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}