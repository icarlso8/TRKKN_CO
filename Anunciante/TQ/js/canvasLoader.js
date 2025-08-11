export async function cargarTamanosYCanvas() {
  const jsonPath = "../../Anunciante/TQ/json/";
  const canvasContainer = document.getElementById("canvasContainer");

  canvasContainer.innerHTML = "";

  const checkboxes = document.querySelectorAll('input[name="tamanos"]:checked');
  const tamanosSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  if (tamanosSeleccionados.length === 0) {
    const aviso = document.createElement("div");
    aviso.textContent = "Selecciona los tamaños para desplegar los canvas ✅";
    // aviso.style.color = "red";
    canvasContainer.appendChild(aviso);
    return;
  }

  const tamanos = await fetch(`${jsonPath}tamaños.json`).then(r => r.json());

  const tamanosFiltrados = tamanos.filter(t => tamanosSeleccionados.includes(t.id));

  tamanosFiltrados.forEach(t => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "24px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `check_${t.id}`;
    checkbox.checked = true;
    checkbox.style.marginBottom = "8px";

    const label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = `🖼️ ${t.nombre}`;
    label.style.marginBottom = "8px";
    label.style.fontWeight = "bold";

    const canvas = document.createElement("canvas");
    canvas.id = `canvas_${t.id}`;
    canvas.width = t.ancho;
    canvas.height = t.alto;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    wrapper.appendChild(canvas);
    canvasContainer.appendChild(wrapper);

    // Aquí usamos fabric global
    const fabricCanvas = new fabric.Canvas(canvas.id, {
      backgroundColor: "#ffffff",
      selection: true,
    });

    if (!window.canvasRefs) window.canvasRefs = {};
    window.canvasRefs[t.id] = {
      canvas: fabricCanvas,
      activo: checkbox.checked,
    };

    checkbox.addEventListener("change", () => {
      window.canvasRefs[t.id].activo = checkbox.checked;
      canvas.style.opacity = checkbox.checked ? "1" : "0.3";
    });
  });
}

