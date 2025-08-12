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
  console.log("🛠️ Parámetros recibidos:");
  console.log("  audiencia:", audiencia);
  console.log("  factorId:", factorId); //EL ERROR ESTABA ACÁ "factorId: tamanos"
  console.log("  opcionId:", opcionId); //EL ERROR ESTABA ACÁ "opcionId: 300x250"
  console.log("  tamañoId:", tamañoId);
  console.log("  producto:", producto);
  
  // Validación rápida de parámetros
  if (!audiencia || !factorId || !opcionId || !tamañoId) {
    console.error("❌ Parámetros incompletos para construir ruta de fondos.");
    callback(null, null, true, [], true);
    return;
  }

  // --- SIN fallback: solo la ruta exacta ---
  const rutaBase = `../../Anunciante/TQ/assets/fondos/${audiencia}/${factorId}/${opcionId}/${tamañoId}`;
  console.log("📂 Ruta construida para fondos:", rutaBase);
  const rutaFondosJSON = `${rutaBase}/fondos.json`;

  // 1) validar existencia de fondos.json en la ruta exacta
  let fondos;
  try {
    const resp = await fetch(rutaFondosJSON, { cache: "no-store" });
    if (!resp.ok) throw new Error("fondos.json no encontrado");
    const parsed = await resp.json();
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("fondos.json vacío");
    fondos = parsed;
  } catch (err) {
    console.warn(`⚠️ No se encontró fondos.json en: ${rutaBase}`);
    // Informamos que la RUTA no cuenta con fondos y marcamos la COMBINACIÓN como terminada (done = true)
    callback(null, null, true, [rutaBase], true);
    return;
  }

  // 2) procesar secuencialmente cada archivo listado en fondos.json
  for (const archivo of fondos) {
    const rutaCompleta = `${rutaBase}/${archivo}`;

    // cargar la imagen como Promise
    let img;
    try {
      img = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(rutaCompleta, oImg => {
          if (!oImg) return reject(new Error("no se pudo cargar imagen"));
          resolve(oImg);
        }, { crossOrigin: "anonymous" });
      });
    } catch (e) {
      console.warn(`❌ No se pudo cargar el fondo: ${rutaCompleta}`);
      // saltamos a siguiente fondo
      continue;
    }

    // crear canvas temporal con las dimensiones del canvas original (usar getWidth/getHeight)
    const width = (typeof canvas.getWidth === "function") ? canvas.getWidth() : (canvas.width || 300);
    const height = (typeof canvas.getHeight === "function") ? canvas.getHeight() : (canvas.height || 250);
    const canvasTemp = new fabric.Canvas(null, { width, height });

    // clonar objetos (await por cada clone para asegurar consistencia)
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

    // poner fondo escalado y esperar a que se renderice
    await new Promise(resolveBg => {
      canvasTemp.setBackgroundImage(img, () => {
        canvasTemp.renderAll();
        resolveBg();
      }, {
        scaleX: canvasTemp.getWidth() / img.width,
        scaleY: canvasTemp.getHeight() / img.height
      });
    });

    // pequeña espera para asegurar render final
    await new Promise(r => setTimeout(r, 80));

    // generar dataURL
    const dataURL = canvasTemp.toDataURL({ format: "png", multiplier: 1 });

    // contador global (opcional, si lo usas)
    if (typeof window.totalGeneradas === "undefined") window.totalGeneradas = 0;
    window.totalGeneradas++;

    const nombreCreatividad = `OmniAdsAI_TQ_${audiencia}_${opcionId}_${tamañoId}_${String(window.totalGeneradas).padStart(4, "0")}.png`;

    // informar cada creatividad generada (done = false → la COMBINACIÓN aún NO terminó)
    callback(dataURL, nombreCreatividad, false, [], false);
  }

  // 3) cuando terminamos todos los fondos en esta combinación notificamos done = true
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
