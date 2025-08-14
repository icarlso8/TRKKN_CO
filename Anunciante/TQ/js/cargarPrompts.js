async function cargarPrompts() {
  try {
    const res = await fetch('../../json/prompts.json');
    const prompts = await res.json();

    const select = document.getElementById('promptSelect');
    prompts.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.nombre;
      select.appendChild(option);
    });

    // Guardar prompts en memoria para usarlos luego
    window.promptsGuardados = prompts;

  } catch (error) {
    console.error("Error cargando prompts.json:", error);
  }
}

// Llamar al cargar la página

cargarPrompts();
