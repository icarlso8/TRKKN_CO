<script type="module">
  // === Config: backend GAS ===
  const GAS_URL   = window.GAS_URL   || "https://script.google.com/macros/s/AKfycbwVXklQ2ljmMUxys7fCh5ygUyS3jheoHQO3SIYvLr9ETQcOABgrMdaLrCEiiDBpStmW/exec";
  const OMNI_TOKEN = window.OMNI_TOKEN || "TU_OMNI_TOKEN_AQUI"; // <-- reemplaza por tu token (o define window.OMNI_TOKEN antes)

  // === Ruta del prompts.json (ya guardado en Anunciante/Tigo/js) ===
  const PROMPTS_URL = "./js/prompts.json";

  // --- Utilidades ---
  const byId = (id) => document.getElementById(id);
  const getVal = (...ids) => {
    for (const id of ids) { 
      const el = byId(id);
      if (el && typeof el.value === "string") return el.value.trim();
    }
    return "";
  };
  const getCheckedValuesByName = (name) =>
    Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => (el.value || "").trim()).filter(Boolean);

  // Intenta deducir el anunciante por la ruta /Anunciante/{X}/
  const detectarAnunciante = () => {
    const m = location.pathname.match(/\/Anunciante\/([^\/]+)/i);
    return (m && m[1]) ? decodeURIComponent(m[1]) : "Anunciante";
  };

  // Factores contextuales en forma { factor: [opciones...] }
  const getFactoresSeleccionados = () => {
    const factores = {};
    const inputs = document.querySelectorAll('fieldset.form-group input[type="checkbox"]');
    inputs.forEach(input => {
      const name = input.name;
      if (!name) return;
      if (!factores[name]) factores[name] = [];
      if (input.checked) factores[name].push(input.value);
    });
    // limpiamos ruidos/agrupaciones que no son factores reales
    delete factores["audiencia"];
    delete factores["tamanos"];
    return factores;
  };

  const toBullets = (arr) => arr && arr.length ? arr.map(a => `• ${a}`).join("\n") : "";
  const factoresResumen = (obj) => {
    const entries = Object.entries(obj).filter(([, vals]) => vals && vals.length);
    const nombres = entries.map(([k]) => k);
    const lineas  = entries.map(([k, vals]) => `${k}: ${vals.join(", ")}`);
    return {
      listaFactores: nombres,
      detalleFactores: lineas
    };
  };

  // Reemplaza {{placeholder}} con valores; soporta tildes/ñ
  const fillTemplate = (template, map) =>
    (template || "").replace(/\{\{([^}]+)\}\}/g, (_, rawKey) => {
      const key = rawKey.trim();
      return (map[key] ?? map[normalizarClave(key)] ?? "");
    });

  // Permite que {{campaña}} y {{campania}} apunten al mismo dato, etc.
  const normalizarClave = (k) =>
    k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // quita tildes
     .replace(/[^\w]/g, "_")                            // espacios/raros -> _
     .toLowerCase();

  // Construye el contexto desde los formularios
  const buildContext = () => {
    const anunciante = detectarAnunciante();                // p.ej. "Tigo"
    const segmento   = getVal("segmento");
    const negocio    = getVal("negocio");
    const producto   = getVal("producto");
    const campania   = getVal("campaña", "campania");       // soporta id con y sin ñ
    const descripcion= getVal("descripcion", "descripcionGeneral", "descripcion_campania");

    const audSel     = getCheckedValuesByName("audiencia");
    const audTexto   = toBullets(audSel);

    const facObj     = getFactoresSeleccionados();
    const { listaFactores, detalleFactores } = factoresResumen(facObj);
    const facNombres = toBullets(listaFactores);
    const facDetalle = detalleFactores.join("\n");

    // Mapa para placeholders
    const values = {
      "anunciante": anunciante,
      "segmento": segmento,
      "negocio": negocio,
      "producto": producto,
      "campaña": campania,
      "campania": campania,                // alias sin tilde
      "descripcion": descripcion,
      "audiencia": audTexto,               // puede ser multi
      "factores_contextuales": facNombres, // lista de factores seleccionados
      "factores_contextuales_seleccion": facDetalle // factor: opciones
    };

    // Copia normalizada (para llaves con/sin tilde, espacios, etc.)
    const normalized = {};
    Object.entries(values).forEach(([k, v]) => normalized[normalizarClave(k)] = v);

    return { raw: values, norm: normalized };
  };

  // Llama a GAS (geminiPrompt)
  async function callGemini(promptText) {
    const resp = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ omniToken: OMNI_TOKEN, action: "geminiPrompt", prompt: promptText })
    });
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || "Error desconocido");
    return data.output || "";
  }

  // Carga prompts.json
  async function loadPrompts() {
    const resp = await fetch(PROMPTS_URL, { cache: "no-store" });
    if (!resp.ok) throw new Error("No se pudo cargar prompts.json");
    return await resp.json();
  }

  // Vincula cada botón con su clave de prompt y su contenedor de salida
  function wireButtons(prompts) {
    const mapSeccion = {
      copies:      { match: "Copies",       out: "#agente-output-copies" },
      insights:    { match: "Insights",     out: "#agente-output-insights" },
      competencia: { match: "Competencia",  out: "#agente-output-competencia" },
      tendencias:  { match: "Tendencias",   out: "#agente-output-tendencias" }
    };

    document.querySelectorAll("#col-gemini section.agente-section").forEach(section => {
      const btn = section.querySelector(".agente-btn");
      const out = section.querySelector(".agente-output");
      if (!btn || !out) return;

      const label = (btn.textContent || "").trim();
      const clave = Object.keys(mapSeccion).find(k => label.includes(mapSeccion[k].match));
      if (!clave) return;

      btn.addEventListener("click", async () => {
        const pdef = prompts[clave];
        if (!pdef || !pdef.template) {
          out.textContent = "⚠️ No hay template para esta sección en prompts.json";
          return;
        }

        const ctx = buildContext();
        // Soporta llaves como {{audiencia}} o {{campaña}} y su versión normalizada
        const promptFinal = fillTemplate(pdef.template, { ...ctx.raw, ...ctx.norm });

        out.textContent = "⏳ Generando...";
        btn.disabled = true;
        try {
          const texto = await callGemini(promptFinal);
          out.textContent = texto || "Sin respuesta";
        } catch (err) {
          console.error(err);
          out.textContent = `❌ Error: ${err.message || err}`;
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  // Init
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const prompts = await loadPrompts();
      wireButtons(prompts);
      console.log("✅ Agentes Gemini listos.");
    } catch (e) {
      console.error("❌ Error iniciando agentes:", e);
    }
  });
</script>
