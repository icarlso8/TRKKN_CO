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

  // Configuración inicial automática
  function setupInitialLayout() {
    const containerWidth = colFlexContainer.offsetWidth;
    const availableWidth = containerWidth - splitter.offsetWidth;
    
    // Asignar 60% al canvas y 40% a gemini inicialmente
    const initialCanvasWidth = Math.min(availableWidth * 0.6, MAX_CANVAS_WIDTH);
    const initialGeminiWidth = availableWidth - initialCanvasWidth;
    
    // Aplicar límites
    const finalCanvasWidth = Math.max(Math.min(initialCanvasWidth, MAX_CANVAS_WIDTH), MIN_CANVAS_WIDTH);
    const finalGeminiWidth = Math.max(Math.min(initialGeminiWidth, MAX_GEMINI_WIDTH), MIN_GEMINI_WIDTH);
    
    colCanvas.style.width = `${finalCanvasWidth}px`;
    colCanvas.style.flex = `0 0 ${finalCanvasWidth}px`;
    
    colGemini.style.width = `${finalGeminiWidth}px`;
    colGemini.style.flex = `0 0 ${finalGeminiWidth}px`;
  }

  // Ejecutar configuración inicial
  setTimeout(setupInitialLayout, 100); // Pequeño delay para asegurar que el DOM esté renderizado

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

  // Reajustar layout cuando cambie el tamaño de la ventana
  window.addEventListener('resize', setupInitialLayout);
}
