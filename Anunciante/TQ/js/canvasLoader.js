export async function cargarTamanosYCanvas() {
  const jsonPath = "../../Anunciante/TQ/json/";
  const canvasContainer = document.getElementById("canvasContainer");

  if (!window.canvasRefs) window.canvasRefs = {};

  const checkboxes = document.querySelectorAll('input[name="tamanos"]:checked');
  const tamanosSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  // Quitar canvases que ya no estén seleccionados
  Object.keys(window.canvasRefs).forEach(id => {
    if (!tamanosSeleccionados.includes(id)) {
      const ref = window.canvasRefs[id];
      if (ref.canvas && typeof ref.canvas.dispose === "function") {
        ref.canvas.dispose();
      }
      ref.wrapper.remove();
      delete window.canvasRefs[id];
    }
  });

  // Si no hay tamaños seleccionados, mostrar aviso
  if (tamanosSeleccionados.length === 0) {
    if (!canvasContainer.querySelector(".aviso-sin-tamanos")) {
      const aviso = document.createElement("div");
      aviso.textContent = "Selecciona los tamaños para desplegar los canvas ✅";
      aviso.style.fontSize = "14px";
      aviso.className = "aviso-sin-tamanos";
      canvasContainer.appendChild(aviso);
    }
    return;
  } else {
    const aviso = canvasContainer.querySelector(".aviso-sin-tamanos");
    if (aviso) aviso.remove();
  }

  const tamanos = await fetch(`${jsonPath}tamaños.json`).then(r => r.json());
  const tamanosFiltrados = tamanos.filter(t => tamanosSeleccionados.includes(t.id));

  tamanosFiltrados.forEach(t => {
    if (window.canvasRefs[t.id]) return; // Si ya existe, no recrear

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "24px";

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `check_${t.id}`;
    checkbox.checked = true;
    checkbox.style.margin = "0 6px";

    // Label con formato: 🖼️ 300 x 250 ( [checkbox] Controles)
    const label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.style.marginBottom = "8px";
    label.style.fontWeight = "bold";
    label.style.display = "inline-flex";
    label.style.alignItems = "center";

    const textoInicial = document.createTextNode(`🖼️ ${t.nombre} /`);
    const textoFinal = document.createTextNode("Controles)");

    label.appendChild(textoInicial);
    label.appendChild(checkbox);
    label.appendChild(textoFinal);

    // Canvas
    const canvas = document.createElement("canvas");
    canvas.id = `canvas_${t.id}`;
    canvas.width = t.ancho;
    canvas.height = t.alto;

    // Armado en el wrapper
    wrapper.appendChild(label);
    wrapper.appendChild(canvas);
    canvasContainer.appendChild(wrapper);

    const fabricCanvas = new fabric.Canvas(canvas.id, {
      backgroundColor: "#ffffff",
      selection: true,
    });

    window.canvasRefs[t.id] = {
      canvas: fabricCanvas,
      activo: checkbox.checked,
      wrapper: wrapper,
      controles: null,
      galeriaId: null,
    };

    function crearControles() {
      if (window.canvasRefs[t.id].controles) return;

      const ref = window.canvasRefs[t.id];
      const controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.gap = "10px";
      controls.style.marginTop = "10px";
      controls.style.marginBottom = "20px";
      controls.className = "controles-canvas";

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

      import("./controlesCanvas.js").then(mod => {
        const [fontSelector, colorPicker, shadowToggle] = mod.crearControlesTexto(ref);
        controls.appendChild(fontSelector);
        controls.appendChild(colorPicker);
        controls.appendChild(shadowToggle);
      });

      const galeria = document.createElement("div");
      galeria.className = "galeria-thumbs";
      galeria.id = `galeria_${t.id}`;
      ref.galeriaId = galeria.id;

      ref.wrapper.appendChild(controls);
      ref.wrapper.appendChild(galeria);
      ref.controles = controls;
    }

    function eliminarControles() {
      const ref = window.canvasRefs[t.id];
      if (ref.controles) {
        ref.controles.remove();
        ref.controles = null;
      }
      const galeria = ref.wrapper.querySelector(".galeria-thumbs");
      if (galeria) galeria.remove();
      ref.galeriaId = null;
    }

    if (checkbox.checked) {
      crearControles();
      canvas.style.opacity = "1";
    } else {
      canvas.style.opacity = "0.3";
    }

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

