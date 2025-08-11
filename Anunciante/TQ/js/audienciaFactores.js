export async function cargarAudienciaFactores(productoId) {
  const jsonPath = "../../Anunciante/TQ/json/";
  const form = document.getElementById("formulario");

  let section = document.getElementById("audiencia-factores-section");
  if (!section) {
    section = document.createElement("fieldset");
    section.id = "audiencia-factores-section";
    section.className = "form-group";
    section.innerHTML = `<legend>🌐 Audiencia (Factores Contextuales)</legend>`;
    form.appendChild(section);
  } else {
    section.querySelectorAll(":scope > *:not(legend)").forEach(el => el.remove());
  }

  if (!productoId) {
    section.innerHTML += `<p>Selecciona un producto para ver las audiencias y factores.</p>`;
    return;
  }

  const audienciasPorProducto = await fetch(`${jsonPath}audiencias.json`).then(r => r.json());
  const audiencias = audienciasPorProducto[productoId] || [];

  // Título Audiencia
  const tituloAud = document.createElement("div");
  tituloAud.className = "form-section";
  tituloAud.innerHTML = `<strong>🎯 Audiencia:</strong>`;
  section.appendChild(tituloAud);

  const divAud = document.createElement("div");
  divAud.className = "form-section checkbox-opciones";

  audiencias.forEach(aud => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "audiencia";
    checkbox.value = aud.id;

    const span = document.createElement("span");
    span.textContent = ` ${aud.emoji || ""} ${aud.nombre}`;

    const wrapper = document.createElement("label");
    wrapper.appendChild(checkbox);
    wrapper.appendChild(span);
    wrapper.style.marginRight = "16px";
    divAud.appendChild(wrapper);
  });
  section.appendChild(divAud);

  const factoresGlobales = await fetch(`${jsonPath}factores.json`).then(r => r.json());

  const factoresIds = new Set();
  audiencias.forEach(aud => {
    (aud.factores_disponibles || []).forEach(f => factoresIds.add(f));
  });

  const factoresFiltrados = factoresGlobales.filter(factor => factoresIds.has(factor.id));

  factoresFiltrados.forEach(factor => {
    const tituloFactor = document.createElement("div");
    tituloFactor.className = "form-section";
    tituloFactor.innerHTML = `<strong>${factor.emoji} ${factor.nombre}:</strong>`;
    section.appendChild(tituloFactor);

    const divOpciones = document.createElement("div");
    divOpciones.className = "form-section checkbox-opciones";

    if (factor.tipo === "checkbox") {
      factor.opciones.forEach(op => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = factor.id;
        checkbox.value = op.id;

        const span = document.createElement("span");
        span.textContent = `${op.emoji || ""} ${op.nombre}`;

        const wrapper = document.createElement("label");
        wrapper.appendChild(checkbox);
        wrapper.appendChild(span);
        wrapper.style.marginRight = "16px";

        divOpciones.appendChild(wrapper);
      });
    }
    section.appendChild(divOpciones);
  });
}
