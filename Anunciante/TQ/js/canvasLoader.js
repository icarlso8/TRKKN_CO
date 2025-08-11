import { mostrarGaleriaLogos, mostrarGaleriaIconos, agregarTexto, limpiarCanvas, agregarThumbnail, crearControlesTexto } from "./controlesCanvas.js";

export async function cargarTamanosYCanvas() {
  const jsonPath = "../../Anunciante/TQ/json/";
  const canvasContainer = document.getElementById("canvasContainer");

  // Limpiar canvasContainer antes de cargar (por si recargas)
  canvasContainer.innerHTML = "";

  // Leer tamaños seleccionados del formulario
  const checkboxes = document.querySelectorAll('input[name="tamanos"]:checked');
  const tamanosSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  if (tamanosSeleccionados.length === 0) {
    // No hay tamaños seleccionados
    const aviso = document.createElement("div");
    aviso.textContent = "⚠️ Selecciona al menos un tamaño para mostrar los canvas.";
    aviso.style.color = "red";
    canvasContainer.appendChild(aviso);
    return;
  }

  const tamanos = await fetch(`${jsonPath}tamaños.json`).then(r => r.json());

  // Filtrar tamaños.json para cargar solo seleccionados
  const tamanosFiltrados = tamanos.filter(t => tamanosSeleccionados.includes(t.id));

  // Limpiar referencias anteriores
  window.canvasRefs = window.canvasRefs || {};

  tamanosFiltrados.forEach(t => {
    // Crear wrapper contenedor
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "24px";

    // Checkbox para activar/desactivar canvas
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `check_${t.id}`;
    checkbox.checked = false; // NO seleccionado por defecto
    checkbox.style.marginBottom = "8px";

    const label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = `🖼️ ${t.nombre}`;
    label.style.marginBottom = "8px";
    label.style.fontWeight = "bold";

    // Canvas
    const canvas = document.createElement("canvas");
    canvas.id = `canvas_${t.id}`;
    canvas.width = t.ancho;
    canvas.height = t.alto;
    canvas.style.opacity = "0.3"; // Por defecto deshabilitado (opaco)

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    wrapper.appendChild(canvas);
    canvasContainer.appendChild(wrapper);

    // Crear instancia Fabric.js
    const fabricCanvas = new fabric.Canvas(canvas.id, {
      backgroundColor: "#ffffff",
      selection: true
    });

    // Guardar referencia global
    window.canvasRefs[t.id] = {
      canvas: fabricCanvas,
      activo: false,
      galeriaId: null,
      wrapper
    };

    // Función para crear controles (botones, galería)
    function crearControles() {
      // Eliminar controles existentes si los hay
      const controlesExistentes = wrapper.querySelector(".controles-canvas");
      if (controlesExistentes) controlesExistentes.remove();

      const galeriaExistente = wrapper.querySelector(".galeria-thumbs");
      if (galeriaExistente) galeriaExistente.remove();

      // Crear contenedor controles
      const controls = document.createElement("div");
      controls.className = "controles-canvas";
      controls.style.display = "flex";
      controls.style.gap = "10px";
      controls.style.marginTop = "10px";
      controls.style.marginBottom = "20px";

      const ref = window.canvasRefs[t.id];

      // Botones
      const btnLogo = document.createElement("button");
      btnLogo.textContent = "➕logo";
      btnLogo.onclick = () => mostrarGaleriaLogos(ref.canvas);

      const btnIcono = document.createElement("button");
      btnIcono.textContent = "➕ícono";
      btnIcono.onclick = () => mostrarGaleriaIconos(ref.canvas);

      const btnTexto = document.createElement("button");
      btnTexto.textContent = "📝texto";
      btnTexto.onclick = () => {
        agregarTexto(ref.canvas);
        setTimeout(() => agregarThumbnail(ref.canvas, ref.galeriaId), 200);
      };

      const btnLimpiar = document.createElement("button");
      btnLimpiar.textContent = "🧽Limpiar";
      btnLimpiar.onclick = () => {
        limpiarCanvas(ref.canvas);
        setTimeout(() => agregarThumbnail(ref.canvas, ref.galeriaId), 200);
      };

      controls.appendChild(btnLogo);
      controls.appendChild(btnIcono);
      controls.appendChild(btnTexto);
      controls.appendChild(btnLimpiar);

      // Controles texto
      const [fontSelector, colorPicker, shadowToggle] = crearControlesTexto(ref);
      controls.appendChild(fontSelector);
      controls.appendChild(colorPicker);
      controls.appendChild(shadowToggle);

      // Galería miniaturas
      const galeria = document.createElement("div");
      galeria.className = "galeria-thumbs";
      galeria.id = `galeria_${t.id}`;
      ref.galeriaId = galeria.id;

      wrapper.appendChild(controls);
      wrapper.appendChild(galeria);
    }

    // Listener checkbox para activar/desactivar canvas y controles
    checkbox.addEventListener("change", () => {
      const ref = window.canvasRefs[t.id];
      ref.activo = checkbox.checked;
      canvas.style.opacity = checkbox.checked ? "1" : "0.3";

      if (checkbox.checked) {
        crearControles();
      } else {
        // Remover controles y galería si desactivado
        const controlesExistentes = wrapper.querySelector(".controles-canvas");
        if (controlesExistentes) controlesExistentes.remove();

        const galeriaExistente = wrapper.querySelector(".galeria-thumbs");
        if (galeriaExistente) galeriaExistente.remove();
      }
    });
  });
}
