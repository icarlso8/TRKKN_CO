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

  section.innerHTML = `<legend>🌐 Audiencia (Factores Contextuales)</legend>`;

  if (!productoId) {
    const msg = document.createElement("div");
    msg.textContent = "Selecciona el producto para validar audiencias y factores contextuales disponibles 👌";
    msg.style.fontStyle = "italic";
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

  // Ahora solo mostrar factores que están disponibles para las audiencias seleccionadas (opcional)
  // Por simplicidad mostramos todos los factores (puedes filtrar si quieres)
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
}

