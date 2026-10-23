(() => {
  "use strict";
  const SUPABASE_URL = "https://bbazyngcorewknknnhgx.supabase.co";
  const SUPABASE_KEY = "sb_publishable_xGaO7pZT5QHytxpFV7tEUw_PgLyimBf";
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const STORE_KEY = "los-hermanos-z-ganaderia-v1";
  const blankData = () => ({animals:[], health:[], reproduction:[], weights:[], paddocks:[]});
  let data = loadData();
  let editingAnimalId = null;
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const todayISO = () => new Date().toISOString().slice(0,10);
  const dateLabel = v => v ? new Date(v + "T12:00:00").toLocaleDateString("es-BO") : "—";
  const escapeHTML = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function loadData(){try{return {...blankData(),...JSON.parse(localStorage.getItem(STORE_KEY) || "{}")}}catch{return blankData()}}
  function persist(){try{localStorage.setItem(STORE_KEY, JSON.stringify(data));return true}catch(e){toast("No se pudieron guardar los datos en este navegador.");return false}}
  function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2800)}
  function animalName(id){const a=data.animals.find(x=>x.id===id);return a?`${a.id}${a.name?" · "+a.name:""}`:id||"—"}
  function setToday(){const d=new Date();$("#today").textContent=d.toLocaleDateString("es-BO",{weekday:"short",day:"numeric",month:"short",year:"numeric"});$("#year").textContent=d.getFullYear()}
  function switchView(view){$$(".view").forEach(el=>el.classList.add("hidden"));const target=$("#"+view+"View");if(target)target.classList.remove("hidden");$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));const labels={dashboard:"Panel principal",animals:"Registro de bovinos",health:"Sanidad animal",reproduction:"Reproducción",weights:"Peso y producción",paddocks:"Potreros",reports:"Reportes"};$("#pageTitle").textContent=labels[view]||"Sistema ganadero";$("#sidebar").classList.remove("open");renderAll()}
  function openDialog(id){if(id==="animalDialog"&&editingAnimalId===null)$("#animalForm").reset();if(["healthDialog","reproDialog","weightDialog"].includes(id)){const form=$("#"+id+" form");form.reset();const date=$('input[name="date"]',form);if(date)date.value=todayISO();fillAnimalOptions()}if(id==="animalDialog")$("#animalDialogTitle").textContent=editingAnimalId?"Editar bovino":"Nuevo bovino";$("#"+id).showModal()}
  function closeDialog(id){$("#"+id).close()}
  function fillAnimalOptions(){const opts=data.animals.filter(a=>a.status==="Activo").map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(animalName(a.id))}</option>`).join("");$$(".animal-options").forEach(s=>{s.innerHTML='<option value="">Seleccionar animal</option>'+opts})}
  function renderAnimals(){const q=$("#animalSearch").value.trim().toLowerCase();const breed=$("#animalFilter").value;const items=data.animals.filter(a=>(!q||[a.id,a.name,a.breed,a.sex].some(v=>String(v||"").toLowerCase().includes(q)))&&(!breed||a.breed===breed));$("#animalsTable").innerHTML=items.map(a=>`<tr><td>${escapeHTML(a.id)}</td><td>${escapeHTML(a.name||"—")}</td><td>${escapeHTML(a.breed)}</td><td>${escapeHTML(a.sex)}</td><td>${dateLabel(a.birth)}</td><td>${a.weight?escapeHTML(a.weight):"—"}</td><td><span class="tag ${a.status!=="Activo"?"warn":""}">${escapeHTML(a.status)}</span></td><td><button class="action-link" data-view-animal="${escapeHTML(a.id)}">Ver animal</button>
<button class="action-link" data-edit-animal="${escapeHTML(a.id)}">Editar</button>
<button class="action-link" data-delete-animal="${escapeHTML(a.id)}">Eliminar</button></td></tr>`).join("");$("#animalsEmpty").classList.toggle("show",items.length===0);$("#animalsEmpty b").textContent=data.animals.length&&items.length===0?"No hay coincidencias":"No hay bovinos registrados";$("#animalsEmpty p").textContent=data.animals.length&&items.length===0?"Prueba con otro término o raza.":"Usa “Nuevo bovino” para agregar el primero."}
  function renderHealth(){$("#healthTable").innerHTML=[...data.health].sort((a,b)=>b.date.localeCompare(a.date)).map(h=>`<tr><td>${dateLabel(h.date)}</td><td>${escapeHTML(animalName(h.animalId))}</td><td>${escapeHTML(h.type)}</td><td>${escapeHTML(h.detail)}</td><td>${dateLabel(h.nextDate)}</td><td>${escapeHTML(h.notes||"—")}</td></tr>`).join("");$("#healthEmpty").classList.toggle("show",data.health.length===0)}
  function renderRepro(){$("#reproTable").innerHTML=[...data.reproduction].sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<tr><td>${dateLabel(r.date)}</td><td>${escapeHTML(animalName(r.animalId))}</td><td>${escapeHTML(r.type)}</td><td>${escapeHTML(r.sire||"—")}</td><td>${escapeHTML(r.result||"—")}</td></tr>`).join("");$("#reproEmpty").classList.toggle("show",data.reproduction.length===0)}
  function renderWeights(){$("#weightsTable").innerHTML=[...data.weights].sort((a,b)=>b.date.localeCompare(a.date)).map(w=>`<tr><td>${dateLabel(w.date)}</td><td>${escapeHTML(animalName(w.animalId))}</td><td>${escapeHTML(w.weight)}</td><td>${escapeHTML(w.notes||"—")}</td></tr>`).join("");$("#weightsEmpty").classList.toggle("show",data.weights.length===0)}
  function renderPaddocks(){$("#paddockList").innerHTML=data.paddocks.map(p=>`<div class="paddock-card"><strong>⌖ ${escapeHTML(p.name)}</strong><span>Superficie: ${escapeHTML(p.area||0)} ha</span><button class="action-link" data-delete-paddock="${escapeHTML(p.id)}">Eliminar</button></div>`).join("");$("#paddockEmpty").classList.toggle("hidden",data.paddocks.length>0)}
  function renderReports(){const active=data.animals.filter(a=>a.status==="Activo");$("#statAnimals").textContent=data.animals.length;$("#statHealth").textContent=data.health.length;$("#statRepro").textContent=data.reproduction.length;$("#statWeights").textContent=data.weights.length;$("#reportAnimals").textContent=data.animals.length;$("#reportFemales").textContent=data.animals.filter(a=>a.sex==="Hembra").length;$("#reportMales").textContent=data.animals.filter(a=>a.sex==="Macho").length;$("#reportPaddocks").textContent=data.paddocks.length;const breeds=["Brahman","Nelore","Gyr","Cruce","Otra"];const max=Math.max(1,...breeds.map(b=>data.animals.filter(a=>a.breed===b).length));$("#breedReport").innerHTML=breeds.map(b=>{const n=data.animals.filter(a=>a.breed===b).length;return `<div class="breed-row"><span>${b}</span><div class="bar"><span style="width:${n/max*100}%"></span></div><b>${n}</b></div>`}).join("");const events=[...data.animals.map(a=>({date:a.createdAt||"",label:`Bovino registrado: ${a.id}`,type:"Ganado"})),...data.health.map(h=>({date:h.date,label:`${h.type}: ${animalName(h.animalId)}`,type:"Sanidad"})),...data.reproduction.map(r=>({date:r.date,label:`${r.type}: ${animalName(r.animalId)}`,type:"Reproducción"})),...data.weights.map(w=>({date:w.date,label:`Pesaje de ${animalName(w.animalId)}: ${w.weight} kg`,type:"Peso"}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);$("#recentActivity").classList.toggle("empty-state",events.length===0);$("#recentActivity").innerHTML=events.length?events.map(e=>`<div class="activity-row" style="padding:10px 0;border-bottom:1px solid #edf1ed;display:flex;justify-content:space-between;gap:10px"><div><b style="font-size:11px">${escapeHTML(e.label)}</b><div style="color:#8a968c;font-size:10px;margin-top:4px">${dateLabel(e.date)}</div></div><span class="tag">${escapeHTML(e.type)}</span></div>`).join(""):'<div class="empty-icon">▤</div><b>Aún no hay actividad</b><p>Cuando registres animales o eventos, aparecerán aquí.</p>'}
  function renderAll(){renderAnimals();renderHealth();renderRepro();renderWeights();renderPaddocks();renderReports();fillAnimalOptions()}
  function exportData(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),farm:"Estancia Los Hermanos Z",data},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="respaldo-los-hermanos-z.json";a.click();URL.revokeObjectURL(url);toast("Respaldo descargado. Guárdalo en un lugar seguro.")}
  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));$$("[data-open]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.open;switchView(v);if(v==="animals")openDialog("animalDialog");else if(v==="health")openDialog("healthDialog");else if(v==="reproduction")openDialog("reproDialog");else if(v==="weights")openDialog("weightDialog")}));
  $("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));$("#addAnimalBtn").addEventListener("click",()=>{editingAnimalId=null;$("#animalForm").reset();openDialog("animalDialog")});$("#addHealthBtn").addEventListener("click",()=>openDialog("healthDialog"));$("#addReproBtn").addEventListener("click",()=>openDialog("reproDialog"));$("#addWeightBtn").addEventListener("click",()=>openDialog("weightDialog"));$("#addPaddockBtn").addEventListener("click",()=>{$("#paddockName").focus()});$("#animalSearch").addEventListener("input",renderAnimals);$("#animalFilter").addEventListener("change",renderAnimals);$("#exportBtn").addEventListener("click",exportData);$("#exportBtn2").addEventListener("click",exportData);
  $$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeDialog(b.dataset.close)));$$("dialog").forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close()}));
  
$("#animalForm").addEventListener("submit", async e => {
  e.preventDefault();

  const f = new FormData(e.currentTarget);
  const a = Object.fromEntries(f.entries());
  a.id = String(a.id || "").trim();

  if (!a.id) {
    toast("El arete o ID es obligatorio.");
    return;
  }

  const duplicate = data.animals.some(
    x => String(x.id).toLowerCase() === a.id.toLowerCase()
      && String(x.id) !== String(editingAnimalId)
  );

  if (duplicate) {
    toast("Ya existe un animal con ese arete/ID.");
    return;
  }

  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  const user = sessionData?.session?.user;

  if (sessionError || !user) {
    toast("Sesión no activa. Vuelve a iniciar sesión.");
    return;
  }

  const record = {
    animal_code: a.id,
    name: a.name || null,
    breed: a.breed || null,
    sex: a.sex || null,
    birth_date: a.birth || null,
    category: a.category || null,
    notes: a.notes || null,
    user_id: user.id
  };

  try {
    let result;

    if (editingAnimalId !== null) {
      result = await supabaseClient
        .from("animals")
        .update(record)
        .eq("animal_code", String(editingAnimalId))
        .eq("user_id", user.id)
        .select();

      if (!result.error && (!result.data || result.data.length === 0)) {
        throw new Error("No se encontró el bovino para actualizar. Revisa los permisos RLS.");
      }
    } else {
      result = await supabaseClient
        .from("animals")
        .insert(record)
        .select();

      if (!result.error && (!result.data || result.data.length === 0)) {
        throw new Error("Supabase no confirmó el registro.");
      }
    }

    if (result.error) throw result.error;

    a.weight = a.weight ? Number(a.weight) : "";
    a.createdAt = editingAnimalId !== null
      ? (data.animals.find(x => String(x.id) === String(editingAnimalId))?.createdAt || todayISO())
      : todayISO();

    if (editingAnimalId !== null) {
      const index = data.animals.findIndex(
        x => String(x.id) === String(editingAnimalId)
      );

      const oldId = String(editingAnimalId);

      if (index !== -1) {
        data.animals[index] = a;
      } else {
        data.animals.push(a);
      }

      if (oldId !== a.id) {
        ["health", "reproduction", "weights"].forEach(k => {
          data[k].forEach(x => {
            if (String(x.animalId) === oldId) x.animalId = a.id;
          });
        });
      }

      toast("Bovino actualizado en Supabase.");
    } else {
      data.animals.push(a);
      toast("Bovino guardado en Supabase.");
    }

    persist();
    closeDialog("animalDialog");
    editingAnimalId = null;
    renderAll();

  } catch (error) {
    console.error("Error guardando bovino:", error);
    toast("Error al guardar: " + (error.message || "Revisa Supabase y los permisos RLS."));
  }
});

  $("#animalsTable").addEventListener("click",e=>{const edit=e.target.closest("[data-edit-animal]");const del=e.target.closest("[data-delete-animal]");if(edit){editingAnimalId=edit.dataset.editAnimal;const a=data.animals.find(x=>x.id===editingAnimalId);if(!a)return;const form=$("#animalForm");Object.entries(a).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v??""});openDialog("animalDialog")}
if(del){
  const id=del.dataset.deleteAnimal;
  const password=prompt("Ingresa la contraseña para eliminar este bovino:");
  if(password==="LHZ2026"){
    if(confirm(`¿Eliminar el bovino ${id}? Los eventos anteriores se conservarán con su ID.`)){
      data.animals=data.animals.filter(a=>a.id!==id);
      persist();
      renderAll();
      toast("Bovino eliminado.");
    }
  }else if(password!==null){
    toast("Contraseña incorrecta. No se eliminó el bovino.");
  }
}
});
  $("#healthForm").addEventListener("submit",e=>{e.preventDefault();const h=Object.fromEntries(new FormData(e.currentTarget).entries());if(!h.animalId){toast("Primero registra un bovino.");return}data.health.push({...h,id:crypto.randomUUID?crypto.randomUUID():String(Date.now())});persist();closeDialog("healthDialog");renderAll();toast("Evento sanitario guardado.")});
  $("#reproForm").addEventListener("submit",e=>{e.preventDefault();const r=Object.fromEntries(new FormData(e.currentTarget).entries());if(!r.animalId){toast("Primero registra un bovino.");return}data.reproduction.push({...r,id:crypto.randomUUID?crypto.randomUUID():String(Date.now())});persist();closeDialog("reproDialog");renderAll();toast("Registro reproductivo guardado.")});
  $("#weightForm").addEventListener("submit",e=>{e.preventDefault();const w=Object.fromEntries(new FormData(e.currentTarget).entries());if(!w.animalId){toast("Primero registra un bovino.");return}w.weight=Number(w.weight);data.weights.push({...w,id:crypto.randomUUID?crypto.randomUUID():String(Date.now())});const a=data.animals.find(x=>x.id===w.animalId);if(a)a.weight=w.weight;persist();closeDialog("weightDialog");renderAll();toast("Pesaje guardado.")});
  $("#savePaddockBtn").addEventListener("click",()=>{const name=$("#paddockName").value.trim(),area=Number($("#paddockArea").value);if(!name){toast("Escribe el nombre del potrero.");return}if($("#paddockArea").value!==""&&area<0){toast("La superficie no puede ser negativa.");return}data.paddocks.push({id:String(Date.now()),name,area:area||0});persist();$("#paddockName").value="";$("#paddockArea").value="";renderAll();toast("Potrero guardado.")});
  $("#paddockList").addEventListener("click",e=>{const b=e.target.closest("[data-delete-paddock]");if(b&&confirm("¿Eliminar este potrero?")){data.paddocks=data.paddocks.filter(p=>p.id!==b.dataset.deletePaddock);persist();renderAll();toast("Potrero eliminado.")}});
   
    const loginPanel = $("#loginPanel");
  const loginForm = $("#loginForm");
  const loginMessage = $("#loginMessage");

  async function checkSession() {
    const { data: sessionData, error } =
      await supabaseClient.auth.getSession();

    if (error || !sessionData.session) {
      loginPanel.style.display = "flex";
      return;
    }

    loginPanel.style.display = "none";

    const user = sessionData.session.user;

    const { data: animals, error: animalsError } =
      await supabaseClient
        .from("animals")
        .select("*")
        .eq("user_id", user.id);

    if (animalsError) {
      console.error("Error cargando bovinos:", animalsError.message);
      toast("No se pudieron cargar los bovinos de Supabase.");
      return;
    }

    data.animals = (animals || []).map(a => ({
      id: a.animal_code,
      name: a.name || "",
      breed: a.breed || "",
      sex: a.sex || "",
      birth: a.birth_date || "",
      weight: "",
      origin: "",
      status: a.category || "Activo",
      notes: a.notes || ""
    }));

    renderAll();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "Verificando acceso...";

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: $("#loginEmail").value.trim(),
      password: $("#loginPassword").value
    });

    if (error) {
      loginMessage.textContent = "Correo o contraseña incorrectos.";
      return;
    }

    loginMessage.textContent = "Acceso correcto.";
    await checkSession();
  });

  setToday();
  renderAll();
  checkSession();
  setTimeout(renderCharts3D, 1000);


  function renderCharts3D() {
    if (typeof Plotly === "undefined") return;

    const breedBox = document.getElementById("breedChart3D");
    const statsBox = document.getElementById("statsChart3D");
    if (!breedBox || !statsBox) return;

    const breeds = ["Brahman", "Nelore", "Gyr", "Cruce", "Otra"];
    const breedCounts = breeds.map(b =>
      data.animals.filter(a => a.breed === b).length
    );

    Plotly.react("breedChart3D", [{
      type: "scatter3d",
      mode: "markers+text",
      x: breeds.map((_, i) => i + 1),
      y: breedCounts,
      z: breedCounts.map((n, i) => i + 1),
      text: breeds.map((b, i) => `${b}: ${breedCounts[i]}`),
      textposition: "top center",
      marker: {
        size: breedCounts.map(n => Math.max(6, Math.min(18, n + 6))),
        color: breedCounts,
        colorscale: "Greens",
        opacity: 0.9
      },
      hovertemplate: "%{text}<extra></extra>"
    }], {
      title: "Bovinos por raza",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#315344" },
      scene: {
        xaxis: { title: "Raza", tickvals: [1,2,3,4,5], ticktext: breeds },
        yaxis: { title: "Cantidad", rangemode: "tozero" },
        zaxis: { title: "Nivel visual" }
      },
      margin: { l: 0, r: 0, t: 45, b: 0 }
    }, { responsive: true });

    const labels = ["Animales", "Sanidad", "Reproducción", "Pesajes", "Potreros"];
    const values = [
      data.animals.length,
      data.health.length,
      data.reproduction.length,
      data.weights.length,
      data.paddocks.length
    ];

    Plotly.react("statsChart3D", [{
      type: "scatter3d",
      mode: "markers+text",
      x: labels.map((_, i) => i + 1),
      y: values,
      z: values.map((n, i) => n + i * 0.1),
      text: labels.map((label, i) => `${label}: ${values[i]}`),
      textposition: "top center",
      marker: {
        size: values.map(n => Math.max(6, Math.min(18, n + 6))),
        color: values,
        colorscale: "Viridis",
        opacity: 0.9
      },
      hovertemplate: "%{text}<extra></extra>"
    }], {
      title: "Registros de la estancia",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#315344" },
      scene: {
        xaxis: { title: "Tipo", tickvals: [1,2,3,4,5], ticktext: labels },
        yaxis: { title: "Cantidad", rangemode: "tozero" },
        zaxis: { title: "Nivel visual" }
      },
      margin: { l: 0, r: 0, t: 45, b: 0 }
    }, { responsive: true });
  }

  const originalRenderReports = renderReports;
  renderReports = function() {
    originalRenderReports();
    renderCharts3D();
  };

  window.addEventListener("resize", () => {
    if (typeof Plotly !== "undefined") {
      ["breedChart3D", "statsChart3D"].forEach(id => {
        const el = document.getElementById(id);
        if (el) Plotly.Plots.resize(el);
      });
    }
  });

})();
