let itemsManuales = [];
// Carga del contador de Guía desde localStorage o inicia en 100
let contadorGuiaManual = localStorage.getItem('contadorGuiaQata') ? parseInt(localStorage.getItem('contadorGuiaQata')) : 100;

document.addEventListener("DOMContentLoaded", () => {
    actualizarNumeroGuia();
});

function actualizarNumeroGuia() {
    const hoy = new Date();
    const guiaElem = document.getElementById('guiaNumero');
    if (guiaElem) {
        guiaElem.innerText = `GR-${hoy.getFullYear()}-${contadorGuiaManual}`;
    }
}

function agregarItemManual() {
    const desc = document.getElementById('prodDesc').value;
    const cant = document.getElementById('prodCant').value;
    
    if (!desc || !cant) {
        alert("Por favor, ingrese descripción y cantidad.");
        return;
    }
    
    itemsManuales.push({ prod: desc, cant: cant });
    
    // Limpiar campos
    document.getElementById('prodDesc').value = "";
    document.getElementById('prodCant').value = "";
    
    renderTablaManual();
}

function renderTablaManual() {
    const tbody = document.getElementById('tablaManual');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    itemsManuales.forEach((item, i) => {
        tbody.innerHTML += `
            <tr>
                <td class="text-center fw-bold">${item.cant}</td>
                <td>${item.prod}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm" onclick="eliminarItem(${i})">X</button>
                </td>
            </tr>`;
    });
}

function eliminarItem(i) {
    itemsManuales.splice(i, 1);
    renderTablaManual();
}

function finalizarGuiaManual() {
    if (itemsManuales.length === 0) {
        return alert("Debe agregar al menos un producto a la tabla.");
    }

    const guia = {
        numeroGuia: document.getElementById('guiaNumero').innerText,
        fechaEmision: new Date().toLocaleDateString(),
        proveedor: document.getElementById('remitenteNom').value || "---",
        ruc: document.getElementById('remitenteRuc').value || "---",
        direccion: document.getElementById('puntoPartida').value || "---",
        obra: document.getElementById('destinatarioNom').value || "---",
        ubicacion: document.getElementById('puntoLlegada').value || "---",
        productos: itemsManuales.map(i => ({ prod: i.prod, cant: i.cant })),
        esSoloGuia: true
    };

    // Llamada a la función de PDF que reside en app.js
    if (typeof generarGuiaPDF === 'function') {
        generarGuiaPDF(guia);
    } else {
        alert("Error: No se encontró la función de generación de PDF. Verifique que app.js esté cargado.");
        return;
    }

    // Incrementar y guardar SOLO el contador de guía
    contadorGuiaManual++;
    localStorage.setItem('contadorGuiaQata', contadorGuiaManual);

    // Guardar en el historial general (usado en consultar.js)
    let historial = JSON.parse(localStorage.getItem('historialOC')) || [];
    historial.push({
        numero: "GUIA MANUAL",
        numeroGuia: guia.numeroGuia,
        fechaEmision: guia.fechaEmision,
        proveedor: guia.proveedor,
        obra: guia.obra,
        total: "---", // Las guías manuales no suelen llevar montos en el historial
        estado: "Activa",
        esSoloGuia: true,
        productos: guia.productos,
        ruc: guia.ruc
    });
    localStorage.setItem('historialOC', JSON.stringify(historial));

    alert("Guía Manual " + guia.numeroGuia + " generada exitosamente.");
    window.location.reload();
}