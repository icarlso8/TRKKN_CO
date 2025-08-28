// === Configuración de la barra de indicadores ===
class BarraIndicadores {
    constructor() {
        this.indicadores = [];
        this.intervalId = null;
        this.paused = false;
        this.currentIndex = 0;
        this.velocidad = 3000; // 3 segundos por indicador
        
        this.init();
    }

    // Inicializar la barra
    init() {
        this.createBarraDOM();
        this.cargarIndicadoresIniciales();
        this.iniciarAnimacion();
        this.setupEventListeners();
    }

    // Crear la estructura HTML de la barra
    createBarraDOM() {
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
        const styles = `
            #barra-indicadores {
                background: linear-gradient(90deg, #2c3e50, #34495e);
                color: white;
                padding: 8px 0;
                border-bottom: 2px solid #e74c3c;
                font-family: 'Arial', sans-serif;
                position: relative;
                z-index: 1000;
            }
            
            .indicadores-container {
                display: flex;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 15px;
            }
            
            .btn-control {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s;
            }
            
            .btn-control:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .indicadores-scroll {
                flex: 1;
                overflow: hidden;
                margin: 0 15px;
                height: 24px;
            }
            
            .indicadores-content {
                display: flex;
                transition: transform 0.5s ease-in-out;
                white-space: nowrap;
            }
            
            .indicador-item {
                padding: 0 20px;
                font-size: 14px;
                display: flex;
                align-items: center;
                border-right: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .indicador-item:last-child {
                border-right: none;
            }
            
            .indicador-emoji {
                margin-right: 8px;
                font-size: 16px;
            }
            
            @media (max-width: 768px) {
                #btn-ver-mas {
                    display: none;
                }
                
                .indicador-item {
                    padding: 0 10px;
                    font-size: 12px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Cargar indicadores iniciales basados en el anunciante
    async cargarIndicadoresIniciales() {
        const anunciante = this.detectarAnunciante();
        
        // Prompt para insights del sector
        const prompt = `Como experto en marketing digital y análisis de sector, genera 5 insights breves (máximo 60 caracteres cada uno) con emojis relevantes sobre el sector de ${anunciante} en Colombia. Los insights deben ser datos interesantes, estadísticas relevantes o tendencias del sector.`;
        
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
        const lines = respuesta.split('\n').filter(line => 
            line.trim().length > 0 && 
            (line.includes('•') || line.includes('🚀') || line.includes('📊') || 
             line.match(/^\d+[\.\)]/) || line.length < 100)
        );
        
        if (lines.length >= 3) {
            return lines.slice(0, 5).map(line => 
                line.replace(/^[•\d\s\.\)\-]+/, '').trim()
            );
        }
        
        // Fallback: dividir por puntos y tomar frases cortas
        return respuesta.split(/[\.!?]/)
            .filter(phrase => phrase.trim().length > 10 && phrase.trim().length < 80)
            .slice(0, 5)
            .map(phrase => phrase.trim() + '.');
    }

    // Mostrar indicadores en la barra
    mostrarIndicadores() {
        const content = document.getElementById('indicadores-content');
        if (!content || this.indicadores.length === 0) return;
        
        content.innerHTML = this.indicadores
            .map(indicador => `
                <div class="indicador-item">
                    <span class="indicador-emoji">${this.obtenerEmoji(indicador)}</span>
                    <span class="indicador-texto">${indicador}</span>
                </div>
            `)
            .join('');
    }

    // Obtener emoji apropiado para el indicador
    obtenerEmoji(texto) {
        const emojis = {
            'crecimiento': '📈',
            'digital': '💻',
            'redes': '👥',
            'innovación': '💡',
            'éxito': '🏆',
            'tendencia': '🚀',
            'datos': '📊',
            'ventas': '💰',
            'engagement': '❤️',
            'oportunidad': '🎯'
        };
        
        for (const [palabra, emoji] of Object.entries(emojis)) {
            if (texto.toLowerCase().includes(palabra)) return emoji;
        }
        
        return '📌'; // Emoji por defecto
    }

    // Iniciar animación de la barra
    iniciarAnimacion() {
        if (this.intervalId) clearInterval(this.intervalId);
        
        this.intervalId = setInterval(() => {
            if (this.paused) return;
            
            this.currentIndex = (this.currentIndex + 1) % this.indicadores.length;
            this.actualizarPosicion();
        }, this.velocidad);
    }

    // Actualizar posición del scroll
    actualizarPosicion() {
        const content = document.getElementById('indicadores-content');
        if (!content) return;
        
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
        }
    }

    // Acción para Ver Más
    verMas() {
        // Aquí puedes redirigir a una página con más información
        // o mostrar un modal con insights detallados
        console.log('Ver más insights del sector');
    }

    // Método para añadir nuevos indicadores dinámicamente
    agregarIndicadores(nuevosIndicadores) {
        this.indicadores = [...this.indicadores, ...nuevosIndicadores];
        this.mostrarIndicadores();
    }

    // Método para actualizar con datos del formulario
    actualizarConContexto(contexto) {
        const prompt = `Genera 3 insights breves (máximo 60 caracteres) con emojis para ${contexto.anunciante} sobre el producto ${contexto.producto} dirigido a ${contexto.audiencia}. Considera: ${contexto.factores_contextuales_seleccion || 'factores contextuales'}`;
        
        this.obtenerInsightsGemini(prompt)
            .then(insights => {
                this.agregarIndicadores(insights);
            })
            .catch(error => {
                console.error('Error actualizando insights:', error);
            });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.barraIndicadores = new BarraIndicadores();
});

// Exportar para uso en otros archivos
window.BarraIndicadores = BarraIndicadores;