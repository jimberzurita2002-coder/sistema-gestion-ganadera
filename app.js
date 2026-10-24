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
const photoFile = f.get("animalPhoto");
delete a.animalPhoto;
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
  let photoPath = null;

  if (photoFile && photoFile.size > 0) {
    if (!photoFile.type.startsWith("image/")) {
      toast("Selecciona un archivo de imagen.");
      return;
    }

    if (photoFile.size > 5 * 1024 * 1024) {
      toast("La foto no puede superar los 5 MB.");
      return;
    }

    const extension = photoFile.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    if (!allowedExtensions.includes(extension)) {
      toast("Usa una foto JPG, PNG o WEBP.");
      return;
    }

    const fileName = `${user.id}/${Date.now()}-${a.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.${extension}`;

    const { data: uploadedFile, error: uploadError } =
      await supabaseClient.storage
        .from("fotos-bovinos")
        .upload(fileName, photoFile, {
          upsert: true,
          contentType: photoFile.type
        });

    if (uploadError) {
      console.error("Error subiendo foto:", uploadError);
      toast("No se pudo subir la foto: " + uploadError.message);
      return;
    }

    photoPath = uploadedFile.path;
  }
  const record = {
    animal_code: a.id,
    name: a.name || null,
    breed: a.breed || null,
    sex: a.sex || null,
    birth_date: a.birth || null,
    category: a.category || null,
    notes: a.notes || null,
    photo_path: photoPath,
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

  $("#animalsTable").addEventListener("click", async e => {
    const edit = e.target.closest("[data-edit-animal]");
    const del = e.target.closest("[data-delete-animal]");
    const view = e.target.closest("[data-view-animal]");
if (view) {
  const id = view.dataset.viewAnimal;
  const animal = data.animals.find(
    a => String(a.id) === String(id)
  );

  if (!animal) {
    alert("No se encontró el bovino.");
    return;
  }

  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  const user = sessionData?.session?.user;

  if (sessionError || !user) {
    toast("Inicia sesión nuevamente.");
    return;
  }

  let photoUrl = "";

  if (animal.photoPath) {
    const { data: signedPhoto, error: photoError } =
      await supabaseClient.storage
        .from("fotos-bovinos")
        .createSignedUrl(animal.photoPath, 300);

    if (!photoError && signedPhoto) {
      photoUrl = signedPhoto.signedUrl;
    }
  }

  const photoHtml = photoUrl
    ? `<img src="${photoUrl}" alt="Foto del bovino" style="width:100%;max-height:280px;object-fit:contain;border-radius:12px;margin-bottom:12px;">`
    : `<p>Este bovino todavía no tiene una foto guardada.</p>`;

  const profileWindow = window.open("", "_blank");

  if (!profileWindow) {
    toast("Permite las ventanas emergentes para ver la ficha.");
    return;
  }

  profileWindow.document.write(`
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Ficha del bovino ${animal.id}</title>
    </head>
    <body style="font-family:Arial,sans-serif;max-width:650px;margin:24px auto;padding:16px;color:#24352b;">
      <h2>Ficha del bovino</h2>
      ${photoHtml}
      <p><b>Arete/ID:</b> ${animal.id}</p>
      <p><b>Nombre:</b> ${animal.name || "Sin nombre"}</p>
      <p><b>Raza:</b> ${animal.breed || "No registrada"}</p>
      <p><b>Sexo:</b> ${animal.sex || "No registrado"}</p>
      <p><b>Nacimiento:</b> ${animal.birth || "No registrado"}</p>
      <p><b>Peso:</b> ${animal.weight || "No registrado"}</p>
      <p><b>Estado:</b> ${animal.status || "No registrado"}</p>
      <p><b>Observaciones:</b> ${animal.notes || "Ninguna"}</p>
    </body>
    </html>
  `);

  profileWindow.document.close();
  return;
}
    if (edit) {
      editingAnimalId = edit.dataset.editAnimal;
      const a = data.animals.find(x => x.id === editingAnimalId);
      if (!a) return;

      const form = $("#animalForm");
      Object.entries(a).forEach(([k, v]) => {
        if (form.elements[k]) form.elements[k].value = v ?? "";
      });

      openDialog("animalDialog");
      return;
    }

    if (!del) return;

    const id = del.dataset.deleteAnimal;
    const password = prompt(
      "Ingresa la contraseña para eliminar este bovino:"
    );

    if (password === null) return;

    if (password !== "13126172Z") {
      toast("Contraseña incorrecta. No se eliminó el bovino.");
      return;
    }

    if (!confirm(`¿Eliminar el bovino ${id}?`)) return;

    try {
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      const user = sessionData?.session?.user;

      if (sessionError || !user) {
        toast("Inicia sesión nuevamente.");
        return;
      }

      const { data: deleted, error } = await supabaseClient
        .from("animals")
        .delete()
        .eq("animal_code", String(id))
        .eq("user_id", user.id)
        .select();

      if (error) throw error;

      if (!deleted || deleted.length === 0) {
        toast("No se eliminó. Revisa los permisos de Supabase.");
        return;
      }

      data.animals = data.animals.filter(
        a => String(a.id) !== String(id)
      );

      persist();
      renderAll();

      if (typeof renderCattle3D === "function") {
        renderCattle3D();
      }

      if (typeof renderCharts3D === "function") {
        renderCharts3D();
      }

      toast("Bovino eliminado de Supabase.");
    } catch (error) {
      console.error("Error eliminando bovino:", error);
      toast("Error al eliminar: " + (error.message || "Revisa Supabase."));
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

  loginForm.reset();

  $("#loginEmail").value = "";
  $("#loginPassword").value = "";
  loginMessage.textContent = "";

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
      notes: a.notes || "",
      photoPath: a.photo_path || ""
    }));

    renderAll();
    if (typeof renderCattle3D === "function") {
      renderCattle3D();
    }

    if (typeof renderCharts3D === "function") {
      renderCharts3D();
    }
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
  const logoutBtn = document.querySelector("#logoutBtn");

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;

    const { error } = await supabaseClient.auth.signOut();

    logoutBtn.disabled = false;

    if (error) {
      alert("No se pudo cerrar la sesión. Intenta nuevamente.");
      return;
    }

    await checkSession();
  });
  setToday();
renderAll();
checkSession();
setTimeout(renderCharts3D, 1000);
setTimeout(initCattle3D, 1200);
  
  let cattleScene, cattleCamera, cattleRenderer, cattleControls;
  let cattleGroup;
  let selectedCattle = null;
  let cattleRaycaster, cattleMouse;
  let cattleAnimationStarted = false;
    const animatedCattle = [];

  function animateCattleModels(time) {
    animatedCattle.forEach((cow, index) => {
      const t = time * 0.0018 + index * 1.7;

      cow.position.y = Math.abs(Math.sin(t * 2)) * 0.035;
      cow.rotation.y = Math.sin(t * 0.7) * 0.10;

      cow.userData.legs?.forEach((leg, legIndex) => {
        leg.rotation.x =
          Math.sin(t * 3 + (legIndex % 2) * Math.PI) * 0.22;
      });

      if (cow.userData.tail) {
        cow.userData.tail.rotation.x =
          -0.55 + Math.sin(t * 4) * 0.25;
        cow.userData.tail.rotation.z = Math.sin(t * 2) * 0.18;
      }
    });
  }
  function initCattle3D() {
    const container = document.getElementById("cattle3D");
    if (!container || typeof THREE === "undefined") return;

    if (cattleRenderer) {
      renderCattle3D();
      return;
    }

    container.innerHTML = "";

    cattleScene = new THREE.Scene();
    cattleScene.background = new THREE.Color(0xc9dfcf);

    cattleCamera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / 380,
      0.1,
      1000
    );
    cattleCamera.position.set(10, 9, 13);

    cattleRenderer = new THREE.WebGLRenderer({ antialias: true });
    cattleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cattleRenderer.setSize(container.clientWidth, 380);
    cattleRenderer.shadowMap.enabled = true;
    container.appendChild(cattleRenderer.domElement);

    cattleControls = new THREE.OrbitControls(
      cattleCamera,
      cattleRenderer.domElement
    );
    cattleControls.enableDamping = true;
    cattleControls.target.set(0, 0, 0);
    cattleControls.maxPolarAngle = Math.PI / 2.05;

    cattleScene.add(new THREE.HemisphereLight(0xffffff, 0x59734b, 2));

    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    cattleScene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 18),
      new THREE.MeshStandardMaterial({ color: 0x72a85a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    cattleScene.add(ground);

    const grid = new THREE.GridHelper(22, 22, 0x567b48, 0x85b56f);
    grid.position.y = 0;
    cattleScene.add(grid);

    // Cerca del potrero
    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x79512f
    });

    function fencePost(x, z) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 1.15, 0.16),
        fenceMaterial
      );
      post.position.set(x, 0.52, z);
      post.castShadow = true;
      cattleScene.add(post);
    }

    for (let x = -10; x <= 10; x += 2) {
      fencePost(x, -8);
      fencePost(x, 8);
    }

    for (let z = -6; z <= 6; z += 2) {
      fencePost(-10, z);
      fencePost(10, z);
    }

    function rail(x1, z1, x2, z2, y) {
      const length = Math.hypot(x2 - x1, z2 - z1);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.09, 0.09),
        fenceMaterial
      );
      bar.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      bar.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      cattleScene.add(bar);
    }

    [[-10, -8, 10, -8], [-10, 8, 10, 8],
      [-10, -8, -10, 8], [10, -8, 10, 8]].forEach(edge => {
      rail(edge[0], edge[1], edge[2], edge[3], 0.35);
      rail(edge[0], edge[1], edge[2], edge[3], 0.75);
    });

    cattleGroup = new THREE.Group();
    cattleScene.add(cattleGroup);

    cattleRaycaster = new THREE.Raycaster();
    cattleMouse = new THREE.Vector2();

    cattleRenderer.domElement.addEventListener("click", selectCattle3D);

    if (!document.getElementById("cattleSelectedInfo")) {
      const info = document.createElement("div");
      info.id = "cattleSelectedInfo";
      info.style.cssText =
        "padding:12px;color:#244832;background:#edf5ed;font-size:14px;";
      info.textContent =
        "Selecciona un bovino haciendo clic sobre él.";
      container.appendChild(info);
    }

    if (!cattleAnimationStarted) {
      cattleAnimationStarted = true;

      function animate() {
        requestAnimationFrame(animate);
        cattleControls.update();
        animateCattleModels(performance.now());
        cattleRenderer.render(cattleScene, cattleCamera);
      }
      animate();
    }

    renderCattle3D();
  }

  function renderCattle3D() {
    if (!cattleGroup) return;

    while (cattleGroup.children.length) {
      const obj = cattleGroup.children[0];
      cattleGroup.remove(obj);
      obj.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    const animals = data.animals.filter(a => a.status === "Activo");
    const count = animals.length;

    const limit = Math.min(count, 80);
    const columns = Math.max(1, Math.ceil(Math.sqrt(limit * 1.3)));
    const rows = Math.ceil(limit / columns);

    const info = document.getElementById("cattleSelectedInfo");
    if (info) {
      info.textContent = count
        ? `Bovinos activos: ${count}. Se muestran hasta ${limit} figuras.`
        : "Aún no hay bovinos activos. Registra un bovino para visualizarlo.";
    }

    for (let i = 0; i < limit; i++) {
      const animal = animals[i];
      const cow = new THREE.Group();
      cow.userData.animal = animal;

      const x = (i % columns) * 2.0 - ((columns - 1) * 2.0) / 2;
      const z = Math.floor(i / columns) * 2.0 - ((rows - 1) * 2.0) / 2;

      cow.position.set(x, 0, z);

      const brown = new THREE.MeshStandardMaterial({ color: 0x80502f });
      const dark = new THREE.MeshStandardMaterial({ color: 0x35251c });
      const white = new THREE.MeshStandardMaterial({ color: 0xe7dfce });

      function part(geometry, material, px, py, pz) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(px, py, pz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        cow.add(mesh);
        return mesh;
      }

      // Cuerpo y cuello
      part(new THREE.SphereGeometry(0.48, 16, 12), brown, 0, 0.85, 0);
      part(new THREE.SphereGeometry(0.25, 12, 10), brown, 0, 1.05, 0.38);

      // Cabeza y hocico
      part(new THREE.SphereGeometry(0.23, 12, 10), brown, 0, 1.12, 0.65);
      part(new THREE.SphereGeometry(0.15, 12, 10), white, 0, 1.04, 0.82);

      // Orejas
      part(new THREE.SphereGeometry(0.10, 8, 8), dark, -0.25, 1.24, 0.55);
      part(new THREE.SphereGeometry(0.10, 8, 8), dark, 0.25, 1.24, 0.55);

           const legs = [];

      for (const lx of [-0.28, 0.28]) {
        for (const lz of [-0.28, 0.28]) {
          const leg = part(
            new THREE.CylinderGeometry(0.055, 0.07, 0.48, 8),
            dark,
            lx,
            0.28,
            lz
          );

          legs.push(leg);
        }
      }

      cow.userData.legs = legs;

      // Cola
      const tail = part(
        new THREE.CylinderGeometry(0.025, 0.035, 0.45, 6),
        dark,
        0,
        0.75,
        -0.52
      );
      tail.rotation.x = -0.55;
      cow.userData.tail = tail;

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd54f })
      );
      marker.position.set(0, 1.65, 0);
      marker.visible = false;
      cow.add(marker);
      cow.userData.marker = marker;
      animatedCattle.push(cow);
      cattleGroup.add(cow);
    }
  }

  function selectCattle3D(event) {
    if (!cattleRenderer || !cattleCamera) return;

    const rect = cattleRenderer.domElement.getBoundingClientRect();
    cattleMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    cattleMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    cattleRaycaster.setFromCamera(cattleMouse, cattleCamera);
    const hits = cattleRaycaster.intersectObjects(cattleGroup.children, true);

    if (!hits.length) return;

    let cow = hits[0].object;
    while (cow.parent && cow.parent !== cattleGroup) {
      cow = cow.parent;
    }

    if (!cow.userData.animal) return;

    if (selectedCattle && selectedCattle.userData.marker) {
      selectedCattle.userData.marker.visible = false;
    }

    selectedCattle = cow;
    if (cow.userData.marker) cow.userData.marker.visible = true;

    const a = cow.userData.animal;
    const info = document.getElementById("cattleSelectedInfo");

    if (info) {
      info.textContent =
        `Bovino: ${a.id} | Nombre: ${a.name || "Sin nombre"} | ` +
        `Raza: ${a.breed || "No indicada"} | Sexo: ${a.sex || "No indicado"}`;
    }
  }

  window.addEventListener("resize", () => {
    const container = document.getElementById("cattle3D");
    if (!container || !cattleRenderer || !cattleCamera) return;

    const width = container.clientWidth;
    if (!width) return;

    cattleCamera.aspect = width / 380;
    cattleCamera.updateProjectionMatrix();
    cattleRenderer.setSize(width, 380);
  });
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
