// splitter.js
export function initSplitter() {
  if (window.__splitterInitialized) {
    console.log("splitter: ya inicializado");
    return;
  }
  console.log("splitter: init llamada");

  const setup = () => {
    const splitter = document.getElementById("splitter");
    const colCentral = document.getElementById("col-canvas");
    const colAgentes = document.getElementById("col-gemini");
    const colFlexContainer = document.getElementById("col-flex-container");

    if (!splitter || !colCentral || !colAgentes || !colFlexContainer) return false;

    let isDown = false;
    const minCentral = 300;
    const minAgentes = 250;
    const getSplitterW = () => splitter.offsetWidth || 8;

    function resizeAt(clientX) {
      const rect = colFlexContainer.getBoundingClientRect();
      let newCentral = clientX - rect.left;
      newCentral = Math.max(minCentral, Math.min(newCentral, rect.width - minAgentes - getSplitterW()));
      colCentral.style.flex = "none";
      colAgentes.style.flex = "none";
      colCentral.style.width = newCentral + "px";
      colAgentes.style.width = (rect.width - newCentral - getSplitterW()) + "px";
    }

    function onPointerDown(e) {
      e.preventDefault();
      isDown = true;
      try { splitter.setPointerCapture && splitter.setPointerCapture(e.pointerId); } catch (_) {}
    }
    function onPointerMove(e) {
      if (!isDown) return;
      resizeAt(e.clientX);
    }
    function onPointerUp(e) {
      isDown = false;
      try { splitter.releasePointerCapture && splitter.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    // pointer events (preferred)
    splitter.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    // fallback mouse events
    splitter.addEventListener("mousedown", onPointerDown);
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mouseup", onPointerUp);

    window.__splitterInitialized = true;
    console.log("splitter: inicializado");
    return true;
  };

  const observeBodyVisible = () => {
    const mo = new MutationObserver(() => {
      if (document.body && document.body.style.display !== "none") {
        mo.disconnect();
        requestAnimationFrame(() => {
          if (!setup()) console.warn("splitter: elementos no encontrados tras mostrar body");
        });
      }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    // fallback polling (3s)
    let tries = 0;
    const interval = setInterval(() => {
      tries++;
      if (document.body && document.body.style.display !== "none") {
        clearInterval(interval);
        mo.disconnect();
        requestAnimationFrame(() => {
          if (!setup()) console.warn("splitter: elementos no encontrados tras polling");
        });
      } else if (tries > 15) {
        clearInterval(interval);
        mo.disconnect();
        console.warn("splitter: timeout esperando body visible");
      }
    }, 200);
  };

  // intento inmediato
  if (!setup()) {
    // no hay elementos aún -> esperar DOM y/o body visible
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        if (document.body && document.body.style.display !== "none") {
          requestAnimationFrame(() => { if (!setup()) console.warn("splitter: elementos no encontrados post DOMContentLoaded"); });
        } else {
          observeBodyVisible();
        }
      });
    } else {
      if (document.body && document.body.style.display !== "none") {
        requestAnimationFrame(() => { if (!setup()) console.warn("splitter: elementos no encontrados (readyState)"); });
      } else {
        observeBodyVisible();
      }
    }
  }
}
