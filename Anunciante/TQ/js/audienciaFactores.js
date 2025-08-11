export async function cargarAudienciaFactores(productoId) {
  const jsonPath = "../../Anunciante/TQ/json/";
  const form = document.getElementById("formulario");

  // Buscar si ya existe el fieldset audiencia (para limpiarlo)
  let section = form.querySelector("fieldset#audienciaFactores");
  if (section) {
    section.innerHTML = ""; // limpio el contenido
  } else {
    section = document.createElement("fieldset");
    section.id = "audienciaFactores";
    section.className = "form-group";
    form.appendChild(section);
  }

  section.innerHTML = `<legend>🌐 Audiencia (Factores Contextuales)</legend>`;

  if (!productoId) {
    // Mostrar mensaje para seleccionar producto
    const msg = document.createElement("div");
    msg.textContent = "Por favor selecciona un producto para ver las audiencias y factores.";
    msg.style.fontStyle = "italic";
    section.appendChild(msg);
    return;  // nada más se muestra
  }

  // Aquí haces fetch a audiencias y factores completos
  const audiencias = await fetch(`${jsonPath}audiencias.json`).then(r => r.json());
  const factores = await fetch(`${jsonPath}factores.json`).then(r => r.json());

  // Filtrar audiencias que aplican para productoId (si tu JSON audiencias tiene relación con producto)
  const audienciasFiltradas = audiencias.filter(a => a.productos && a.productos.includes(productoId));
  // Similar para factores, si aplican filtros...

  // --- Rellenar audiencias con checkboxes ---
  const tituloAud = document.createElement("div");
  tituloAud.className = "form-section";
  tituloAud.innerHTML = `<strong>🎯 Audiencia:</strong>`;
  section.appendChild(tituloAud);

  const divAud = document.createElement("div");
  divAud.className = "form-section checkbox-opciones";

  audienciasFiltradas.forEach(aud => {
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

  // --- Rellenar factores contextuales (igual filtrados si es necesario) ---
  factores.forEach(factor => {
    // Si tienes que filtrar factores por producto, hazlo aquí.
    const tituloFactor = document.createElement("div");
    tituloFactor.className = "form-section";
    tituloFactor.innerHTML = `<strong>${factor.emoji} ${factor.nombre}:</strong>`;
    section.appendChild(tituloFactor);

    const divOpciones = document.createElement("div");
    divOpciones.className = "form-section checkbox-opciones";

    if (factor.tipo === "checkbox") {
      factor.opciones.forEach(op => {
        // Si filtras opciones por producto, hazlo aquí

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
