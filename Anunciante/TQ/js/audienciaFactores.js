export async function cargarAudienciaFactores(productoId) {
  const jsonPath = "../../Anunciante/TQ/json/";
  const form = document.getElementById("formulario");

  let section = form.querySelector("fieldset#audienciaFactores");
  if (section) {
    section.innerHTML = "";
  } else {
    section = document.createElement("fieldset");
    section.id = "audienciaFactores";
    section.className = "form-group";
    form.appendChild(section);
  }

  section.innerHTML = `<legend>🌐 Audiencias (Factores Contextuales)</legend>`;

  if (!productoId) {
    const msg = document.createElement("div");
    msg.textContent = "Selecciona el producto para validar audiencias y factores contextuales disponibles ✅";
    msg.style.fontSize = "14px";
    msg.style.fontStyle = "normal";
    section.appendChild(msg);
    return;
  }

  // Cargo audiencias y factores desde JSON
  const todasAudiencias = await fetch(`${jsonPath}audiencias.json`).then(r => r.json());
  const factores = await fetch(`${jsonPath}factores.json`).then(r => r.json());

  // Obtengo solo las audiencias para el productoId
  const audiencias = todasAudiencias[productoId] || [];

  // Rellenar audiencias con checkboxes
  const tituloAud = document.createElement("div");
  tituloAud.className = "form-section";
  tituloAud.innerHTML = `<strong>🎯 Audiencias:</strong>`;
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

  // Mostrar factores (sin filtro por audiencias para simplificar)
  factores.forEach(factor => {
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

  // --- NUEVO: Mostrar tamaños disponibles a partir de todos los factores ---
  const tamañosSet = new Set();
  factores.forEach(factor => {
    if (factor.tamanos_disponibles && factor.tamanos_disponibles.length > 0) {
      factor.tamanos_disponibles.forEach(t => tamañosSet.add(t));
    }
  });
  const tamañosDisponibles = Array.from(tamañosSet);

  const tituloTamanos = document.createElement("div");
  tituloTamanos.className = "form-section";
  tituloTamanos.innerHTML = `<strong>📐 Tamaños:</strong>`;
  section.appendChild(tituloTamanos);

  const divTamanos = document.createElement("div");
  divTamanos.className = "form-section checkbox-opciones";

  tamañosDisponibles.forEach(tamaño => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "tamanos";
    checkbox.value = tamaño;
    checkbox.id = `tamaño_${tamaño}`;
    checkbox.checked = true; // marcado por defecto

    const label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = ` ${tamaño}`;
    label.style.marginRight = "16px";

    divTamanos.appendChild(checkbox);
    divTamanos.appendChild(label);
  });

  section.appendChild(divTamanos);
}
