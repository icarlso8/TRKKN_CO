document.addEventListener("DOMContentLoaded", function () {
    const btnGenerarGas = document.getElementById("btnGenerarGas");

    btnGenerarGas.addEventListener("click", function () {
        const promptSelect = document.getElementById("promptSelect");
        const descripcionTextarea = document.getElementById("descripcion");

        // Validaciones básicas
        if (!promptSelect.value) {
            alert("Por favor selecciona un prompt.");
            return;
        }
        if (!descripcionTextarea.value.trim()) {
            alert("Por favor ingresa una descripción.");
            return;
        }

        // Obtener plantilla del prompt seleccionado
        const selectedOption = promptSelect.options[promptSelect.selectedIndex];
        const plantilla = selectedOption.dataset.plantilla;

        // Obtener valores del sistema (ajusta según tu jerarquía real)
        const producto = document.getElementById("productoSelect")?.value || "Producto no definido";
        const audiencia = document.getElementById("audienciaSelect")?.value || "Audiencia no definida";
        const descripcion = descripcionTextarea.value.trim();

        // Reemplazar variables en la plantilla
        const promptFinal = plantilla
            .replace("{producto}", producto)
            .replace("{audiencia}", audiencia)
            .replace("{descripcion}", descripcion);

        console.log("Prompt generado:", promptFinal);

        // Aquí puedes enviar el prompt a Gemini o al backend
        alert("Prompt generado:\n\n" + promptFinal);
    });
});