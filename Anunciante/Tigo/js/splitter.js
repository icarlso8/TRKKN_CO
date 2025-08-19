export function initSplitter() {
  const splitter = document.getElementById('splitter');
  const colCanvas = document.getElementById('col-canvas');
  const colGemini = document.getElementById('col-gemini');
  const colFlexContainer = document.getElementById('col-flex-container');
  
  let isResizing = false;
  let startX, startCanvasWidth, startGeminiWidth;

  // Configuración de límites
  const MIN_CANVAS_WIDTH = 300;
  const MAX_CANVAS_WIDTH = 800;
  const MIN_GEMINI_WIDTH = 250;
  const MAX_GEMINI_WIDTH = 500;

  splitter.addEventListener('mousedown', function(e) {
    isResizing = true;
    startX = e.clientX;
    startCanvasWidth = colCanvas.offsetWidth;
    startGeminiWidth = colGemini.offsetWidth;
    
    // Estilos durante el arrastre
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    
    e.preventDefault();
  });

  function handleMouseMove(e) {
    if (!isResizing) return;
    
    const containerWidth = colFlexContainer.offsetWidth;
    const dx = e.clientX - startX;
    
    // Calcular nuevos anchos
    let newCanvasWidth = startCanvasWidth + dx;
    let newGeminiWidth = startGeminiWidth - dx;

    // Aplicar límites a la columna canvas
    newCanvasWidth = Math.max(newCanvasWidth, MIN_CANVAS_WIDTH);
    newCanvasWidth = Math.min(newCanvasWidth, MAX_CANVAS_WIDTH);
    
    // Aplicar límites a la columna gemini
    newGeminiWidth = Math.max(newGeminiWidth, MIN_GEMINI_WIDTH);
    newGeminiWidth = Math.min(newGeminiWidth, MAX_GEMINI_WIDTH);

    // Ajustar para que no exceda el ancho total disponible
    const totalWidth = newCanvasWidth + newGeminiWidth + splitter.offsetWidth;
    if (totalWidth > containerWidth) {
      const excess = totalWidth - containerWidth;
      newGeminiWidth -= excess;
      newGeminiWidth = Math.max(newGeminiWidth, MIN_GEMINI_WIDTH);
    }

    // Aplicar los nuevos anchos
    colCanvas.style.width = `${newCanvasWidth}px`;
    colCanvas.style.flex = `0 0 ${newCanvasWidth}px`;
    
    colGemini.style.width = `${newGeminiWidth}px`;
    colGemini.style.flex = `0 0 ${newGeminiWidth}px`;
  }

  function stopResizing() {
    if (!isResizing) return;
    
    isResizing = false;
    
    // Restaurar estilos
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  }

  // Prevenir arrastre accidental
  splitter.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}
