// splitter.js - Módulo para manejar el redimensionamiento de columnas
export function inicializarSplitter() {
    const splitter = document.getElementById('canvas-gemini-splitter');
    const colCanvas = document.getElementById('col-canvas');
    const colGemini = document.getElementById('col-gemini');
    
    if (!splitter || !colCanvas || !colGemini) {
        console.warn('Elementos del splitter no encontrados');
        return;
    }
    
    let isResizing = false;
    
    splitter.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        const containerRect = document.getElementById('main-container').getBoundingClientRect();
        const rightEdge = containerRect.right;
        const geminiMinWidth = 480;
        const canvasMinWidth = 400;
        
        // Calcular nuevo ancho para la columna Gemini
        let newGeminiWidth = rightEdge - e.clientX - 6; // 6px es la mitad del splitter
        
        // Aplicar límites
        newGeminiWidth = Math.max(geminiMinWidth, newGeminiWidth);
        newGeminiWidth = Math.min(newGeminiWidth, rightEdge - containerRect.left - canvasMinWidth - 12);
        
        // Aplicar el nuevo tamaño
        colGemini.style.width = newGeminiWidth + 'px';
        colCanvas.style.flex = `0 0 calc(100% - ${newGeminiWidth + 12}px)`;
    });
    
    document.addEventListener('mouseup', function() {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
}