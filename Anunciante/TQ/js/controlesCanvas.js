export function agregarTexto(canvas) {
  const text = new fabric.Textbox("Escribe aquí", {
    left: 50,
    top: 50,
    fontSize: 24,
    fill: "#000000",
    fontFamily: "Arial",
    editable: true
  });

  canvas.add(text);
  canvas.setActiveObject(text);  // Selecciona automáticamente el texto al añadirlo
  canvas.requestRenderAll();
}

export function limpiarCanvas(canvas) {
  canvas.clear();
  canvas.backgroundColor = "#ffffff";
  canvas.renderAll();
}

export function agregarThumbnail(canvas, galeriaId) {
  canvas.discardActiveObject().renderAll();
  const dataURL = canvas.toDataURL({ format: "png" });

  const galeria = document.getElementById(galeriaId);
  if (!galeria) return;

  const thumb = document.createElement("div");
  thumb.style.position = "relative";

  const img = document.createElement("img");
  img.src = dataURL;
  img.className = "thumbnail-preview";

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "✖";
  btnEliminar.style.position = "absolute";
  btnEliminar.style.top = "-6px";
  btnEliminar.style.right = "-6px";
  btnEliminar.style.padding = "2px 6px";
  btnEliminar.style.border = "none";
  btnEliminar.style.borderRadius = "50%";
  btnEliminar.style.backgroundColor = "#f44336";
  btnEliminar.style.color = "white";
  btnEliminar.style.cursor = "pointer";
  btnEliminar.style.fontSize = "12px";
  btnEliminar.title = "Eliminar miniatura";
  btnEliminar.onclick = () => thumb.remove();

  thumb.appendChild(img);
  thumb.appendChild(btnEliminar);
  galeria.appendChild(thumb);
}
  
export async function mostrarGaleriaLogos(canvas) {
  const contenedor = document.getElementById("galeriaLogos");
  contenedor.innerHTML = ""; // Limpiar antes de renderizar
  
  const response = await fetch("../../Anunciante/TQ/json/logos.json");
  const logos = await response.json();
  
  logos.forEach(logo => {
    const img = document.createElement("img");
    img.src = "../../Anunciante/TQ/assets/logos/" + logo.nombreArchivo;
    img.title = logo.nombre;
    img.style.width = "80px";
    img.style.cursor = "pointer";
    img.style.border = "1px solid #ccc";
    img.style.borderRadius = "4px";
    img.onclick = () => {
      fabric.Image.fromURL(img.src, function(fabImg) {
        fabImg.scaleToWidth(100);
        fabImg.set({ 
          left: 20, 
          top: 20, 
          hasBorders: true, 
          hasControls: true,
          selectable: true // ✅
        });
        canvas.add(fabImg).setActiveObject(fabImg);
      });
      document.getElementById("modalLogos").style.display = "none";
    };
  
    contenedor.appendChild(img);
  });
  
  document.getElementById("modalLogos").style.display = "flex";
}

export async function mostrarGaleriaIconos(canvas) {
  const contenedor = document.getElementById("galeriaIconos");
  contenedor.innerHTML = ""; // Limpiar antes de renderizar

  const response = await fetch("../../Anunciante/TQ/json/icons.json");
  const iconos = await response.json();

  iconos.forEach(icono => {
    const img = document.createElement("img");
    img.src = "../../Anunciante/TQ/assets/icons/" + icono.nombreArchivo;
    img.title = icono.nombre;
    img.style.width = "80px";
    img.style.cursor = "pointer";
    img.style.border = "1px solid #ccc";
    img.style.borderRadius = "4px";
    img.onclick = () => {
      fabric.Image.fromURL(img.src, function(fabImg) {
        fabImg.scaleToWidth(60);
        fabImg.set({ 
          left: 50, 
          top: 50, 
          hasBorders: true, 
          hasControls: true,
          selectable: true // ✅
        });
        canvas.add(fabImg).setActiveObject(fabImg);
      });
      document.getElementById("modalIconos").style.display = "none";
    };

    contenedor.appendChild(img);
  });

  document.getElementById("modalIconos").style.display = "flex";
}

export async function generarCreatividadesConFondos(canvas, audiencia, factorId, opcionId, tamañoId, producto, callback) {
  const rutasFondos = [
    `../../Anunciante/TQ/assets/fondos/${audiencia}/${factorId}/${opcionId}/${tamañoId}/fondos.json`,
    `../../Anunciante/TQ/assets/fondos/${audiencia}/${tamañoId}/fondos.json`
  ];
  const rutasDirectorios = rutasFondos.map(r => r.replace(/\/fondos\.json$/, ''));

  let fondos = null;
  let rutaEncontrada = null;

  // Buscar el primer fondos.json válido
  for (let i = 0; i < rutasFondos.length; i++) {
    try {
      const resp = await fetch(rutasFondos[i]);
      if (resp.ok) {
        const json = await resp.json();
        if (Array.isArray(json) && json.length > 0) {
          fondos = json;
          rutaEncontrada = rutasDirectorios[i];
          break;
        }
      }
    } catch (e) {
      // silencio: se intenta la siguiente ruta
    }
  }

  if (!fondos) {
    // No hay fondos.json en ninguna ruta probada -> informar como "sin fondo" y marcar done
    console.warn(`⚠️ No se encontraron fondos.json en: ${rutasDirectorios.join(', ')}`);
    callback(null, null, true, rutasDirectorios, true);
    return;
  }

  // Por cada archivo listado en fondos.json, generar una creatividad
  for (const archivo of fondos) {
    const fondoPath = `${rutaEncontrada}/${archivo}`;
    let img;
    try {
      img = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(fondoPath, function (oImg) {
          if (!oImg) return reject(new Error('No se pudo cargar imagen'));
          resolve(oImg);
        }, { crossOrigin: 'anonymous' });
      });
    } catch (e) {
      console.warn(`❌ No se pudo cargar: ${fondoPath}`);
      // continuar con el siguiente fondo
      continue;
    }

    // Crear canvas temporal con las mismas dimensiones que el canvas pasado
    const width = (typeof canvas.getWidth === 'function') ? canvas.getWidth() : (canvas.width || 300);
    const height = (typeof canvas.getHeight === 'function') ? canvas.getHeight() : (canvas.height || 250);
    const canvasTemp = new fabric.Canvas(null, { width, height });

    // Clonar objetos del canvas original al temporal
    const objetos = canvas.getObjects();
    for (const obj of objetos) {
      await new Promise(resolveClone => {
        obj.clone(clon => {
          clon.set({ selectable: true });
          canvasTemp.add(clon);
          resolveClone();
        });
      });
    }

    // Poner el fondo escalado y renderizar
    canvasTemp.setBackgroundImage(img, canvasTemp.renderAll.bind(canvasTemp), {
      scaleX: canvasTemp.getWidth() / img.width,
      scaleY: canvasTemp.getHeight() / img.height
    });

    await new Promise(r => setTimeout(r, 200)); // pequeña espera para asegurar render

    const dataURL = canvasTemp.toDataURL({ format: 'png', multiplier: 1 });

    // Contador global de creatividades
    if (typeof window.totalGeneradas === 'undefined') window.totalGeneradas = 0;
    window.totalGeneradas++;

    const nombreCreatividad = `OmniAdsAI_TQ_${audiencia}_${opcionId}_${tamañoId}_${String(window.totalGeneradas).padStart(4, "0")}.png`;

    // Llamamos callback por cada creatividad generada. done = false (aún no terminó la combinación)
    callback(dataURL, nombreCreatividad, false, [], false);
  }

  // Finalmente notificamos que la combinación terminó (done = true)
  callback(null, null, false, [], true);
}

export function borradoPorTeclado() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      const canvasRefs = window.canvasRefs;
      if (!canvasRefs) return;

      Object.values(canvasRefs).forEach(ref => {
        const obj = ref.canvas.getActiveObject();
        if (obj) {
          ref.canvas.remove(obj);
          ref.canvas.discardActiveObject().renderAll();
        }
      });
    }
  });
}

export function crearControlesTexto(ref) {
  const fontSelector = document.createElement("select");
  ["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia"].forEach(font => {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    fontSelector.appendChild(option);
  });
  fontSelector.onchange = () => {
    const active = ref.canvas.getActiveObject();
    if (active && (active.type === "textbox" || active.type === "text")) {
      active.set("fontFamily", fontSelector.value);
      ref.canvas.requestRenderAll();
    }
  };

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = "#000000";
  colorPicker.oninput = () => {
    const active = ref.canvas.getActiveObject();
    if (active && (active.type === "textbox" || active.type === "text")) {
      active.set("fill", colorPicker.value);
      ref.canvas.requestRenderAll();
    }
  };

  const shadowToggle = document.createElement("button");
  shadowToggle.textContent = "🌑 Sombra";
  shadowToggle.onclick = () => {
    const active = ref.canvas.getActiveObject();
    if (active && (active.type === "textbox" || active.type === "text")) {
      const hasShadow = !!active.shadow;
      active.set("shadow", hasShadow ? null : {
        color: "rgba(0,0,0,0.3)",
        blur: 5,
        offsetX: 2,
        offsetY: 2
      });
      ref.canvas.requestRenderAll();
    }
  };

  return [fontSelector, colorPicker, shadowToggle];
}
