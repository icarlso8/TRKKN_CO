export async function cargarTamanosYCanvas() {
  const jsonPath = "../../Anunciante/TQ/json/";
  const canvasContainer = document.getElementById("canvasContainer");

  canvasContainer.innerHTML = "";

  const checkboxes = document.querySelectorAll('input[name="tamanos"]:checked');
  const tamanosSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  if (tamanosSeleccionados.length === 0) {
    const aviso = document.createElement("div");
    aviso.textContent = "Selecciona los tamaños para desplegar los canvas ✅";
    aviso.style.fontSize = "14px";
    canvasContainer.appendChild(aviso);
    return;
  }

  const tamanos = await fetch(`${jsonPath}tamaños.json`).then(r => r.json());

  const tamanosFiltrados = tamanos.filter(t => tamanosSeleccionados.includes(t.id));

  if (!window.canvasRefs) window.canvasRefs = {};

  tamanosFiltrados.forEach(t => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "24px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `check_${t.id}`;
    checkbox.checked = true; // O cambia a false si quieres que no inicie activo
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

    // Crear instancia fabric
    const fabricCanvas = new fabric.Canvas(canvas.id, {
      backgroundColor: "#ffffff",
      selection: true,
    });

    // Guardar referencias
    window.canvasRefs[t.id] = {
      canvas: fabricCanvas,
      activo: checkbox.checked,
      wrapper: wrapper,    // Para facilitar manejo de controles
      controles: null,     // Aquí guardaremos contenedor controles si se crea
      galeriaId: null,
    };

    // Función para crear controles (botones y galería)
    function crearControles() {
      // Si controles ya existen, no crear de nuevo
      if (window.canvasRefs[t.id].controles) return;

      const ref = window.canvasRefs[t.id];

      const controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.gap = "10px";
      controls.style.marginTop = "10px";
      controls.style.marginBottom = "20px";
      controls.className = "controles-canvas";

      // Botones
      const btnLogo = document.createElement("button");
      btnLogo.textContent = "➕logo";
      btnLogo.onclick = () => {
        import("./controlesCanvas.js").then(mod => mod.mostrarGaleriaLogos(ref.canvas));
      };

      const btnIcono = document.createElement("button");
      btnIcono.textContent = "➕ícono";
      btnIcono.onclick = () => {
        import("./controlesCanvas.js").then(mod => mod.mostrarGaleriaIconos(ref.canvas));
      };

      const btnTexto = document.createElement("button");
      btnTexto.textContent = "📝texto";
      btnTexto.onclick = () => {
        import("./controlesCanvas.js").then(mod => {
          mod.agregarTexto(ref.canvas);
          setTimeout(() => mod.agregarThumbnail(ref.canvas, ref.galeriaId), 200);
        });
      };

      const btnLimpiar = document.createElement("button");
      btnLimpiar.textContent = "🧽Limpiar";
      btnLimpiar.onclick = () => {
        import("./controlesCanvas.js").then(mod => {
          mod.limpiarCanvas(ref.canvas);
          setTimeout(() => mod.agregarThumbnail(ref.canvas, ref.galeriaId), 200);
        });
      };

      controls.appendChild(btnLogo);
      controls.appendChild(btnIcono);
      controls.appendChild(btnTexto);
      controls.appendChild(btnLimpiar);

      // Controles texto
      import("./controlesCanvas.js").then(mod => {
        const [fontSelector, colorPicker, shadowToggle] = mod.crearControlesTexto(ref);
        controls.appendChild(fontSelector);
        controls.appendChild(colorPicker);
        controls.appendChild(shadowToggle);
      });

      // Galería miniaturas
      const galeria = document.createElement("div");
      galeria.className = "galeria-thumbs";
      galeria.id = `galeria_${t.id}`;
      ref.galeriaId = galeria.id;

      ref.wrapper.appendChild(controls);
      ref.wrapper.appendChild(galeria);

      // Guardar controles creados
      ref.controles = controls;
    }

    // Función para eliminar controles
    function eliminarControles() {
      const ref = window.canvasRefs[t.id];
      if (ref.controles) {
        ref.controles.remove();
        ref.controles = null;
      }
      // También elimina la galería miniaturas si existe
      const galeria = ref.wrapper.querySelector(".galeria-thumbs");
      if (galeria) galeria.remove();
      ref.galeriaId = null;
    }

    // Inicialmente, si checkbox está activo, crear controles
    if (checkbox.checked) {
      crearControles();
      canvas.style.opacity = "1";
    } else {
      canvas.style.opacity = "0.3";
    }

    // Listener checkbox para activar/desactivar canvas y controles
    checkbox.addEventListener("change", () => {
      window.canvasRefs[t.id].activo = checkbox.checked;
      canvas.style.opacity = checkbox.checked ? "1" : "0.3";

      if (checkbox.checked) {
        crearControles();
      } else {
        eliminarControles();
      }
    });
  });
}
