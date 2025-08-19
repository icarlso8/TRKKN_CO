// splitter.js
export function initSplitter() {
  console.log("📂 splitter.js cargado");
  const splitter = document.getElementById("splitter");
  const colCentral = document.getElementById("col-canvas");
  const colAgentes = document.getElementById("col-gemini");
  const colFlexContainer = document.getElementById("col-flex-container");
  if (!splitter || !colCentral || !colAgentes || !colFlexContainer) return;

  let isResizing = false;

  // Mouse
  splitter.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isResizing = true;
    document.addEventListener("mousemove", resizeMouse);
    document.addEventListener("mouseup", stopResize);
  });

  // Touch (soporta móviles/tabletas)
  splitter.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isResizing = true;
    document.addEventListener("touchmove", resizeTouch, { passive: false });
    document.addEventListener("touchend", stopResize);
  });

  function resizeMouse(e) { resizeAt(e.clientX); }
  function resizeTouch(e) { if (e.touches && e.touches[0]) resizeAt(e.touches[0].clientX); }

  function resizeAt(clientX) {
    if (!isResizing) return;
    const rect = colFlexContainer.getBoundingClientRect();
    const totalWidth = rect.width;
    // calcular nuevo ancho central y aplicarle límites mínimos
    const splitterW = splitter.offsetWidth || 8;
    const minCentral = 300;
    const minAgentes = 250;
    let newCentralWidth = clientX - rect.left;
    // clamp
    newCentralWidth = Math.max(minCentral, Math.min(newCentralWidth, totalWidth - minAgentes - splitterW));
    colCentral.style.flex = "none";
    colAgentes.style.flex = "none";
    colCentral.style.width = newCentralWidth + "px";
    colAgentes.style.width = (totalWidth - newCentralWidth - splitterW) + "px";
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resizeMouse);
    document.removeEventListener("mouseup", stopResize);
    document.removeEventListener("touchmove", resizeTouch);
    document.removeEventListener("touchend", stopResize);
  }
  console.log("⚡ initSplitter inicializado");
}


