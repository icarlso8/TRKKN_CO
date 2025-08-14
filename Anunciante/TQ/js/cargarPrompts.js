document.addEventListener("DOMContentLoaded", function () {
    const promptSelect = document.getElementById("promptSelect");

    // Cargar prompts desde JSON
    fetch("../json/prompts.json")
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar prompts.json");
            return response.json();
        })
        .then(prompts => {
            prompts.forEach(prompt => {
                const option = document.createElement("option");
                option.value = prompt.id;
                option.textContent = prompt.nombre;
                option.dataset.descripcion = prompt.descripcion;
                option.dataset.plantilla = prompt.plantilla;
                promptSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error cargando prompts:", error);
        });
});

