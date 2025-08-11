// Anunciante/TQ/js/audienciaFactores.js

export async function cargarAudienciaFactores(productoId) {
  const jsonPath = "../../Anunciante/TQ/json/";
  const form = document.getElementById("formulario");

  // Limpia contenido previo para evitar duplicados si se llama varias veces
  form.innerHTML = "";

  // Crear sección fieldset para audiencia y factores
  const section = document.createElement("fieldset");
  section.className = "form-group";
  section.innerHTML = `<legend>🌐 Audiencia (Factores Contextuales)</legend>`;
  form.appendChild(section);

  // --- Cargar audiencias por producto ---
  let audienciasPorProducto;
  try {
    const respAud = await fetch(`${jsonPath}audiencias.json`);
    audienciasPorProducto = await respAud.json();
  } catch (error) {
    console.error("Error cargando audiencias.json", error);
    section.innerHTML += `<p style="color:red;">Error cargando audiencias.</p>`;
    return;
  }

  const audiencias = audienciasPorProducto[productoId] || [];

  if (audiencias.length === 0) {
    section.innerHTML += `<p>No hay audiencias definidas para este producto.</p>`;
    return;
  }

  // Título Audiencia
  const tituloAud = document.createElement("div");
  tituloAud.className = "form-section";
  tituloAud.innerHTML = `<strong>🎯 Audiencia:</strong>`;
  section.appendChild(tituloAud);

  // Opciones de audiencia con checkboxes
  const divAud = document.createElement("div");
  divAud.className = "form-section checkbox-opciones";

  audiencias.forEach(aud => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "audiencia";
    checkbox.value = aud.id;
    checkbox.id = `aud_${aud.id}`;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.style.marginRight = "16px";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${aud.emoji || ""} ${aud.nombre}`));

    divAud.appendChild(label);
  });
  section.appendChild(divAud);

  // --- Cargar factores globales ---
  let factoresGlobales;
  try {
    const respFact = await fetch(`${jsonPath}factores.json`);
    factoresGlobales = await respFact.json();
  } catch (error) {
    console.error("Error cargando factores.json", error);
    section.innerHTML += `<p style="color:red;">Error cargando factores.</p>`;
    return;
  }

  // Extraer factores usados por las audiencias
  const factoresIds = new Set();
  audiencias.forEach(aud => {
    (aud.factores_disponibles || []).forEach(f => factoresIds.add(f));
  });

  // Filtrar factores globales solo para los usados
  const factoresFiltrados = factoresGlobales.filter(factor => factoresIds.has(factor.id));

  // Renderizar factores y opciones
  factoresFiltrados.forEach(factor => {
    const tituloFactor = document.createElement("div");
    tituloFactor.className = "form-section";
    tituloFactor.innerHTML = `<strong>${factor.emoji} ${factor.nombre}:</strong>`;
    section.appendChild(tituloFactor);

    const divOpciones = document.createElement("div");
    divOpciones.className = "form-section checkbox-opciones";

    if (factor.tipo === "checkbox" && Array.isArray(factor.opciones)) {
      factor.opciones.forEach(op => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = factor.id;
        checkbox.value = op.id;
        checkbox.id = `fact_${factor.id}_${op.id}`;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.style.marginRight = "16px";
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${op.emoji || ""} ${op.nombre}`));

        divOpciones.appendChild(label);
      });
    }

    section.appendChild(divOpciones);
  });
}
