export async function cargarPrompts() {
  try {
    const response = await fetch("../../Anunciante/TQ/json/prompts.json");
    if (!response.ok) {
      throw new Error(`Error al cargar prompts: ${response.status}`);
    }

    const prompts = await response.json();
    const select = document.getElementById("promptSelect");

    // Limpia opciones previas
    select.innerHTML = "";

    // Agrega las opciones
    prompts.forEach(prompt => {
      const option = document.createElement("option");
      option.value = prompt.id;
      option.textContent = prompt.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando prompts:", error);
  }
}

