// === Config: backend GAS ===
const GAS_URL   = window.GAS_URL   || "https://script.google.com/macros/s/AKfycbwVXklQ2ljmMUxys7fCh5ygUyS3jheoHQO3SIYvLr9ETQcOABgrMdaLrCEiiDBpStmW/exec";
const OMNI_TOKEN = window.OMNI_TOKEN || "gIe1TET33hc4i1w9K0WvcS6DHMIYjCgm5fgRqUWS";

// === Ruta del prompts.json (CORREGIDA) ===
const PROMPTS_URL = "../../Anunciante/Tigo/json/prompts.json";

// --- utilidades ---
const byId = (id) => document.getElementById(id);
const getVal = (...ids) => {
  for (const id of ids) { 
    const el = byId(id);
    if (el && typeof el.value === "string") return el.value.trim();
  }
  return "";
};
const getCheckedValuesByName = (name) =>
  Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => (el.value || "").trim()).filter(Boolean);

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

// Reemplaza {{placeholder}}
const fillTemplate = (template, map) =>
  (template || "").replace(/\{\{([^}]+)\}\}/g, (_, rawKey) => {
    const key = rawKey.trim();
    return (map[key] ?? map[normalizarClave(key)] ?? "");
  });

// Normaliza llaves
const normalizarClave = (k) =>
  k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // quita tildes
   .replace(/[^\w]/g, "_")                            // espacios/raros -> _
   .toLowerCase();

// Construye el contexto
const buildContext = () => {
  const anunciante = detectarAnunciante();
  const segmento   = getVal("segmento");
  const negocio    = getVal("negocio");
  const producto   = getVal("producto");
  const campania   = getVal("campana");
  const descripcion= getVal("descripcion");

  const audSel     = getCheckedValuesByName("audiencia");
  const audTexto   = toBullets(audSel);

  const facObj     = getFactoresSeleccionados();
  const { listaFactores, detalleFactores } = factoresResumen(facObj);
  const facNombres = toBullets(listaFactores);
  const facDetalle = detalleFactores.join("\n");

  const values = {
    "anunciante": anunciante,
    "segmento": segmento,
    "negocio": negocio,
    "producto": producto,
    "campaña": campania,
    "campania": campania,
    "descripcion": descripcion,
    "audiencia": audTexto,
    "factores_contextuales": facNombres,
    "factores_contextuales_seleccion": facDetalle
  };

  const normalized = {};
  Object.entries(values).forEach(([k, v]) => normalized[normalizarClave(k)] = v);

  return { raw: values, norm: normalized };
};

// Llama a GAS
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
  const data = await resp.json();
  
  // Convertir el array a un objeto con claves por id
  const promptsMap = {};
  data.prompts.forEach(prompt => {
    promptsMap[prompt.id] = {
      template: prompt.plantilla,
      titulo: prompt.titulo,
      descripcion: prompt.descripcion
    };
  });
  
  return promptsMap;
}

// === SOLUCIÓN COMPLETA: Función setupClearButtons corregida ===
function setupClearButtons() {
  // Función para borrar contenido de un área específica
  const clearOutput = (outputSelector) => {
    const outputElement = document.querySelector(outputSelector);
    if (outputElement) {
      outputElement.textContent = "";
      console.log(`✅ Contenido borrado: ${outputSelector}`);
    }
  };

  // Mapeo de botones de borrado y sus áreas correspondientes
  const clearButtonsConfig = {
    "btn-clear-copies": "#agente-output-copies",
    "btn-clear-insights": "#agente-output-insights",
    "btn-clear-competencia": "#agente-output-competencia",
    "btn-clear-tendencias": "#agente-output-tendencias"
  };

  // Función para configurar un botón individual (VERSIÓN CORREGIDA)
  const setupButton = (buttonId, outputSelector) => {
    const button = document.getElementById(buttonId);
    if (button) {
      // ✅ ELIMINAR TODA la sobrescritura de estilos - dejar que CSS controle todo
      // SOLO agregar el evento de clic
      
      // Configurar el evento de clic
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearOutput(outputSelector);
      });
      
      return true;
    }
    return false;
  };

  // Configurar botones existentes inmediatamente
  let buttonsConfigured = 0;
  Object.entries(clearButtonsConfig).forEach(([buttonId, outputSelector]) => {
    if (setupButton(buttonId, outputSelector)) {
      buttonsConfigured++;
    }
  });

  // Si no encontramos botones, usar un observador más agresivo
  if (buttonsConfigured === 0) {
    console.log("⏳ Botones de borrado no encontrados, iniciando observador...");
    
    const observer = new MutationObserver(() => {
      let foundCount = 0;
      Object.entries(clearButtonsConfig).forEach(([buttonId, outputSelector]) => {
        if (document.getElementById(buttonId) && setupButton(buttonId, outputSelector)) {
          foundCount++;
        }
      });
      
      if (foundCount === Object.keys(clearButtonsConfig).length) {
        observer.disconnect();
        console.log("✅ Todos los botones de borrado configurados");
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // También intentar después de un delay por si los botones se cargan async
    setTimeout(() => {
      Object.entries(clearButtonsConfig).forEach(([buttonId, outputSelector]) => {
        if (!document.getElementById(buttonId)?.hasAttribute('data-listener-set')) {
          setupButton(buttonId, outputSelector);
        }
      });
    }, 1000);
  } else {
    console.log(`✅ ${buttonsConfigured} botones de borrado configurados`);
  }
}

// Vincula botones
function wireButtons(prompts) {
  const mapSeccion = {
    "btn-copies":      { key: "copies",      out: "#agente-output-copies" },
    "btn-insights":    { key: "insights",    out: "#agente-output-insights" },
    "btn-competencia": { key: "competencia", out: "#agente-output-competencia" },
    "btn-tendencias":  { key: "tendencias",  out: "#agente-output-tendencias" }
  };

  Object.entries(mapSeccion).forEach(([btnId, { key, out }]) => {
    const btn = document.getElementById(btnId);
    const outDiv = document.querySelector(out);
    if (!btn || !outDiv) return;

    btn.addEventListener("click", async () => {
      const pdef = prompts[key];
      if (!pdef || !pdef.template) {
        outDiv.textContent = "⚠️ No hay template para esta sección en prompts.json";
        return;
      }

      const ctx = buildContext();
      const promptFinal = fillTemplate(pdef.template, { ...ctx.raw, ...ctx.norm });

      // ✅ NUEVO: Mostrar en consola el prompt inicial y el final
      console.log("=== PROMPT ANALYSIS ===");
      console.log(`🔍 Sección: ${key}`);
      console.log("📋 Prompt inicial (template):");
      console.log(pdef.template);
      console.log("🔄 Prompt final (con placeholders reemplazados):");
      console.log(promptFinal);
      console.log("📊 Contexto utilizado:");
      console.log(ctx.norm);
      console.log("=======================");

      outDiv.textContent = "⏳ Generando...";
      btn.disabled = true;
      try {
        const texto = await callGemini(promptFinal);
        outDiv.textContent = texto || "Sin respuesta";
      } catch (err) {
        console.error(err);
        outDiv.textContent = `❌ Error: ${err.message || err}`;
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
    
    // Esperar un poco más para asegurar que los botones de borrado estén en el DOM
    setTimeout(() => {
      setupClearButtons();
    }, 300);
    
    console.log("✅ Agentes Gemini listos.");
  } catch (e) {
    console.error("❌ Error iniciando agentes:", e);
  }
});
