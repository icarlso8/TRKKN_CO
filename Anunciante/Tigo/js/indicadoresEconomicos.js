// === Configuración de la barra de indicadores ===
class BarraIndicadores {
    constructor() {
        this.indicadores = [];
        this.intervalId = null;
        this.paused = false;
        this.currentIndex = 0;
        this.velocidad = 3000; // 3 segundos por indicador
        this.prompts = {}; // Para almacenar los prompts cargados
        this.contextoActual = {}; // Para almacenar el contexto actual
        
        this.init();
    }

    // Inicializar la barra
    init() {
        this.createBarraDOM();
        this.cargarPrompts().then(() => {
            this.cargarIndicadoresIniciales();
        });
        this.iniciarAnimacion();
        this.setupEventListeners();
    }

    // Crear la estructura HTML de la barra
    createBarraDOM() {
        // Verificar si la barra ya existe para no duplicarla
        if (document.getElementById('barra-indicadores')) return;
        
        const barraContainer = document.createElement('div');
        barraContainer.id = 'barra-indicadores';
        barraContainer.innerHTML = `
            <div class="indicadores-container">
                <button id="btn-play-pause" class="btn-control">⏸️</button>
                <div class="indicadores-scroll">
                    <div class="indicadores-content" id="indicadores-content"></div>
                </div>
                <button id="btn-ver-mas" class="btn-control">VER MÁS</button>
            </div>
        `;
        
        // Insertar al inicio del body
        document.body.insertBefore(barraContainer, document.body.firstChild);
        
        // Añadir estilos
        this.addStyles();
    }

    // Añadir estilos CSS
    addStyles() {
        // Verificar si los estilos ya fueron añadidos
        if (document.getElementById('estilos-barra-indicadores')) return;
        
        const styles = `
            #barra-indicadores {
                background: #fff;
                color: #000;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
                font-family: 'Mulish', sans-serif;
                position: relative;
                z-index: 1000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .indicadores-container {
                display: flex;
                align-items: center;
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .btn-control {
                background: #f5f5f5;
                border: 1px solid #ddd;
                color: #333;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-family: 'Mulish', sans-serif;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }
            
            .btn-control:hover {
                background: #e8e8e8;
                transform: translateY(-1px);
            }
            
            .indicadores-scroll {
                flex: 1;
                overflow: hidden;
                margin: 0 20px;
                height: 28px;
                position: relative;
            }
            
            .indicadores-content {
                display: flex;
                transition: transform 0.5s ease-in-out;
                white-space: nowrap;
                position: absolute;
                height: 100%;
                align-items: center;
            }
            
            .indicador-item {
                padding: 0 25px;
                font-size: 15px;
                display: flex;
                align-items: center;
                border-right: 1px solid #eee;
                height: 100%;
                color: #000;
            }
            
            .indicador-item:last-child {
                border-right: none;
            }
            
            .indicador-emoji {
                margin-right: 10px;
                font-size: 18px;
            }
            
            @media (max-width: 768px) {
                #btn-ver-mas {
                    display: none;
                }
                
                .indicadores-container {
                    padding: 0 15px;
                }
                
                .btn-control {
                    padding: 6px 12px;
                    font-size: 12px;
                }
                
                .indicador-item {
                    padding: 0 15px;
                    font-size: 13px;
                }
                
                .indicador-emoji {
                    font-size: 16px;
                    margin-right: 8px;
                }
            }

            @media (max-width: 480px) {
                #barra-indicadores {
                    padding: 6px 0;
                }
                
                .indicadores-scroll {
                    margin: 0 10px;
                    height: 24px;
                }
                
                .indicador-item {
                    padding: 0 12px;
                    font-size: 12px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'estilos-barra-indicadores';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Cargar prompts desde el archivo JSON
    async cargarPrompts() {
        try {
            const resp = await fetch('../../Anunciante/Tigo/json/prompts.json', { cache: "no-store" });
            if (!resp.ok) throw new Error("No se pudo cargar prompts.json");
            const data = await resp.json();
            
            // Convertir el array a un objeto con claves por id
            this.prompts = {};
            data.prompts.forEach(prompt => {
                this.prompts[prompt.id] = prompt.plantilla;
            });
            
            // DEBUG: Mostrar todos los prompts cargados
            console.log("📝 Prompts cargados:", Object.keys(this.prompts));
            console.log("🔍 Prompt 'barra_insights':", this.prompts['barra_insights']);
            
        } catch (error) {
            console.error('Error cargando prompts:', error);
        }
    }

    // Cargar indicadores iniciales basados en el anunciante
    async cargarIndicadoresIniciales() {
        const anunciante = this.detectarAnunciante();
        
        // Usar el prompt específico para barra de insights
        const promptBase = this.prompts['barra_insights'] || "Genera 5 insights breves (máximo 60 caracteres cada uno) con emojis relevantes sobre el sector de {{anunciante}} en Colombia.";
        
        // Reemplazar placeholders básicos
        let prompt = promptBase.replace('{{anunciante}}', anunciante);
        
        // Mostrar en consola el análisis del prompt
        console.log("=== BARRA INDICADORES - PROMPT ANALYSIS ===");
        console.log("📋 Prompt inicial (template):");
        console.log(promptBase);
        console.log("🔄 Prompt final (con placeholders reemplazados):");
        console.log(prompt);
        console.log("📊 Contexto utilizado:");
        console.log({ anunciante });
        console.log("=======================");
        
        try {
            const insights = await this.obtenerInsightsGemini(prompt);
            this.indicadores = insights;
            this.mostrarIndicadores();
        } catch (error) {
            console.error('Error cargando insights:', error);
            // Indicadores por defecto
            this.indicadores = [
                '📊 Sector en crecimiento constante',
                '🚀 Oportunidades digitales emergentes',
                '👥 Audiencia activa en redes sociales',
                '💡 Innovación constante en el sector',
                '📈 Tendencia positiva en engagement'
            ];
            this.mostrarIndicadores();
        }
    }

    // Detectar anunciante desde la URL
    detectarAnunciante() {
        const m = location.pathname.match(/\/Anunciante\/([^\/]+)/i);
        return (m && m[1]) ? decodeURIComponent(m[1]) : "este sector";
    }

    // Obtener insights de Gemini
    async obtenerInsightsGemini(prompt) {
        try {
            const GAS_URL = "https://script.google.com/macros/s/AKfycbwVXklQ2ljmMUxys7fCh5ygUyS3jheoHQO3SIYvLr9ETQcOABgrMdaLrCEiiDBpStmW/exec";
            const OMNI_TOKEN = "gIe1TET33hc4i1w9K0WvcS6DHMIYjCgm5fgRqUWS";
            
            const resp = await fetch(GAS_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({ 
                    omniToken: OMNI_TOKEN, 
                    action: "geminiPrompt", 
                    prompt: prompt 
                })
            });
            
            const data = await resp.json();
            if (!data.ok) throw new Error(data.error);
            
            // Procesar la respuesta para extraer insights
            return this.procesarRespuestaInsights(data.output);
            
        } catch (error) {
            console.error('Error obteniendo insights:', error);
            throw error;
        }
    }

    // Procesar la respuesta de Gemini para extraer insights
    procesarRespuestaInsights(respuesta) {
        // Intentar extraer insights numerados o con emojis
        const lines = respuesta.split('\n')
            .map(line => line.trim())
            .filter(line => 
                line.length > 0 && 
                line.length < 80 &&
                (line.includes('•') || 
                 line.match(/[🚀📊👥💡📈🎯❤️💰🔍📦💼]/) ||
                 line.match(/^\d+[\.\)\-]/) ||
                 !line.includes('  ') && line.split(' ').length <= 12)
            );
        
        if (lines.length >= 3) {
            return lines.slice(0, 8).map(line => 
                line.replace(/^[•\d\s\.\)\-]+/, '').trim()
            );
        }
        
        // Fallback: dividir por puntos y tomar frases cortas
        return respuesta.split(/[\.!?]/)
            .map(phrase => phrase.trim())
            .filter(phrase => phrase.length > 15 && phrase.length < 70)
            .slice(0, 6)
            .map(phrase => {
                // Añadir emoji basado en contenido
                const emoji = this.obtenerEmoji(phrase);
                return emoji !== '📌' ? `${emoji} ${phrase}.` : `${phrase}.`;
            });
    }

    // Mostrar indicadores en la barra
    mostrarIndicadores() {
        const content = document.getElementById('indicadores-content');
        if (!content || this.indicadores.length === 0) return;
        
        content.innerHTML = this.indicadores
            .map(indicador => `
                <div class="indicador-item">
                    <span class="indicador-texto">${indicador}</span>
                </div>
            `)
            .join('');
        
        // Reiniciar animación
        this.currentIndex = 0;
        this.actualizarPosicion();
    }

    // Obtener emoji apropiado para el texto
    obtenerEmoji(texto) {
        const emojis = {
            'crecimiento|aumento|incremento|sube': '📈',
            'digital|tecnología|app|online|internet': '💻',
            'redes|social|facebook|instagram|twitter': '👥',
            'innovación|nuevo|moderno|avanzado': '💡',
            'éxito|logro|triunfo|ganar|vencer': '🏆',
            'tendencia|moda|popular|viral': '🚀',
            'datos|estadística|número|porcentaje': '📊',
            'ventas|precio|oferta|descuento|compra': '💰',
            'engagement|interacción|comentario|like': '❤️',
            'oportunidad|potencial|futuro|crecer': '🎯',
            'audiencia|cliente|usuario|persona': '👥',
            'campaña|marketing|publicidad|promoción': '🎯',
            'producto|servicio|item|artículo': '📦',
            'segmento|nicho|mercado|target': '🔍',
            'negocio|empresa|marca|compañía': '💼',
            'calidad|excelente|premium|mejor': '⭐',
            'rápido|velocidad|inmediato|instantáneo': '⚡',
            'ahorro|económico|barato|precio': '💲',
            'seguro|protección|confianza|garantía': '🛡️',
            'sostenible|ecológico|ambiente|verde': '🌱'
        };
        
        const textoLower = texto.toLowerCase();
        for (const [palabras, emoji] of Object.entries(emojis)) {
            const regex = new RegExp(palabras.split('|').join('|'), 'i');
            if (regex.test(textoLower)) return emoji;
        }
        
        return '📌'; // Emoji por defecto
    }

    // Iniciar animación de la barra
    iniciarAnimacion() {
        if (this.intervalId) clearInterval(this.intervalId);
        
        this.intervalId = setInterval(() => {
            if (this.paused || this.indicadores.length <= 1) return;
            
            this.currentIndex = (this.currentIndex + 1) % this.indicadores.length;
            this.actualizarPosicion();
        }, this.velocidad);
    }

    // Actualizar posición del scroll
    actualizarPosicion() {
        const content = document.getElementById('indicadores-content');
        if (!content || this.indicadores.length === 0) return;
        
        const itemWidth = content.scrollWidth / this.indicadores.length;
        content.style.transform = `translateX(-${this.currentIndex * itemWidth}px)`;
    }

    // Configurar event listeners
    setupEventListeners() {
        const btnPlayPause = document.getElementById('btn-play-pause');
        const btnVerMas = document.getElementById('btn-ver-mas');
        
        if (btnPlayPause) {
            btnPlayPause.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (btnVerMas) {
            btnVerMas.addEventListener('click', () => this.verMas());
        }
    }

    // Toggle play/pause
    togglePlayPause() {
        this.paused = !this.paused;
        const btn = document.getElementById('btn-play-pause');
        if (btn) {
            btn.textContent = this.paused ? '▶️' : '⏸️';
            btn.title = this.paused ? 'Reanudar' : 'Pausar';
        }
    }

    // Acción para Ver Más
    verMas() {
        // Podría abrir un modal con insights detallados
        const modalContent = this.indicadores.map((insight, index) => 
            `${index + 1}. ${insight}`
        ).join('\n\n');
        
        alert(`💡 Insights detallados:\n\n${modalContent}`);
    }

    // Método para añadir nuevos indicadores dinámicamente
    agregarIndicadores(nuevosIndicadores) {
        this.indicadores = [...this.indicadores, ...nuevosIndicadores];
        this.mostrarIndicadores();
    }

    // Método para actualizar con datos del formulario
    async actualizarConContexto(contexto) {
        this.contextoActual = contexto;
        
        // Usar el prompt específico para barra de insights
        const promptBase = this.prompts['barra_insights'] || "Genera 3 insights breves (máximo 60 caracteres) con emojis para {{anunciante}} sobre el producto {{producto}} dirigido a {{audiencia}}. Considera: {{factores_contextuales}}";
        
        // Reemplazar placeholders con el contexto actual
        let prompt = promptBase;
        const contextoUtilizado = {};
        
        for (const [key, value] of Object.entries(contexto)) {
            if (value) {
                const placeholder = `{{${key}}}`;
                if (prompt.includes(placeholder)) {
                    prompt = prompt.replace(new RegExp(placeholder, 'gi'), value);
                    contextoUtilizado[key] = value;
                }
            }
        }
        
        // Mostrar en consola el análisis del prompt
        console.log("=== BARRA INDICADORES - PROMPT ANALYSIS ===");
        console.log("📋 Prompt inicial (template):");
        console.log(promptBase);
        console.log("🔄 Prompt final (con placeholders reemplazados):");
        console.log(prompt);
        console.log("📊 Contexto utilizado:");
        console.log(contextoUtilizado);
        console.log("=======================");
        
        try {
            const insights = await this.obtenerInsightsGemini(prompt);
            this.agregarIndicadores(insights);
        } catch (error) {
            console.error('Error actualizando insights:', error);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.barraIndicadores = new BarraIndicadores();
});

// Función global para actualizar desde otros scripts
window.actualizarBarraIndicadores = function(contexto) {
    if (window.barraIndicadores && typeof window.barraIndicadores.actualizarConContexto === 'function') {
        window.barraIndicadores.actualizarConContexto(contexto);
    }
};
