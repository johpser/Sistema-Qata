document.addEventListener("DOMContentLoaded", () => {
    cargarTabla();
});

function cargarTabla() {
    const historial = JSON.parse(localStorage.getItem('historialOC')) || [];
    const tbody = document.getElementById('listaHistorial');
    if(!tbody) return;
    tbody.innerHTML = "";

    // Mostramos lo más reciente primero sin alterar el array original
    const historialMostrar = [...historial].reverse();

    if (historialMostrar.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron registros.</td></tr>`;
        return;
    }

    historialMostrar.forEach((oc, indexReverso) => {
        // Mantenemos el índice real para las funciones del array original
        const indexOriginal = historial.length - 1 - indexReverso;
        
        const row = document.createElement('tr');
        if (oc.estado === "Anulada") row.classList.add('fila-anulada');

        const esManual = oc.esSoloGuia === true;

        row.innerHTML = `
            <td>
                <div class="fw-bold">${esManual ? '<span class="badge bg-info text-dark">GUÍA MANUAL</span>' : oc.numero}</div>
                <small class="text-muted">Guía: ${oc.numeroGuia || '---'}</small>
            </td>
            <td>${oc.fechaEmision}</td>
            <td>
                <div class="fw-bold">${oc.proveedor}</div>
                <small class="text-muted">${oc.ruc || 'S/RUC'}</small>
            </td>
            <td class="text-end fw-bold">${oc.total}</td>
            <td class="text-center">
                <span class="badge ${oc.estado === 'Activa' ? 'bg-success' : 'bg-danger'}">${oc.estado}</span>
            </td>
            <td class="text-center">
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-outline-primary" onclick="verDetalle(${indexOriginal})" title="Ver Detalle">👁️</button>
                    
                    ${!esManual ? 
                        `<button class="btn btn-sm btn-outline-dark" onclick="reimprimirOC(${indexOriginal})" title="Descargar OC">OC</button>` : 
                        `<button class="btn btn-sm btn-outline-secondary disabled" title="No tiene OC">OC</button>`
                    }
                    
                    <button class="btn btn-sm btn-outline-info" onclick="reimprimirGuia(${indexOriginal})" title="Descargar Guía">GR</button>
                    
                    <button class="btn btn-sm btn-outline-danger" onclick="anularOC(${indexOriginal})" ${oc.estado === 'Anulada' ? 'disabled' : ''} title="Anular">🚫</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filtrarTabla() {
    const input = document.getElementById('buscador');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#listaHistorial tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

function verDetalle(index) {
    const historial = JSON.parse(localStorage.getItem('historialOC')) || [];
    const oc = historial[index];
    const contenido = document.getElementById('contenidoDetalle');

    const monedaSimbolo = oc.moneda || "";

    contenido.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <h6 class="text-primary border-bottom pb-2 fw-bold">DATOS DEL PROVEEDOR</h6>
                <p class="mb-1 small"><strong>Razón:</strong> ${oc.proveedor}</p>
                <p class="mb-1 small"><strong>RUC:</strong> ${oc.ruc || 'No registrado'}</p>
                <p class="mb-1 small"><strong>Dirección:</strong> ${oc.direccion || '---'}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary border-bottom pb-2 fw-bold">DATOS DE ENTREGA</h6>
                <p class="mb-1 small"><strong>Obra:</strong> ${oc.obra}</p>
                <p class="mb-1 small"><strong>Ubicación:</strong> ${oc.ubicacion}</p>
                <p class="mb-1 small"><strong>Comprador:</strong> ${oc.comprador}</p>
            </div>
        </div>
        <hr>
        <table class="table table-sm table-bordered mt-3">
            <thead class="table-light text-center small">
                <tr><th>Producto / Descripción</th><th style="width: 80px;">Cant.</th>${!oc.esSoloGuia ? '<th style="width: 100px;">Subtotal</th>' : ''}</tr>
            </thead>
            <tbody class="small">
                ${oc.productos.map(p => `
                    <tr>
                        <td>${p.prod}</td>
                        <td class="text-center">${p.cant}</td>
                        ${!oc.esSoloGuia ? `<td class="text-end">${monedaSimbolo}${(p.subtotal || 0).toFixed(2)}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="text-end mt-3">
            ${!oc.esSoloGuia ? `<h5 class="fw-bold text-dark">TOTAL: ${oc.total}</h5>` : '<p class="text-muted small italic">Documento de solo traslado</p>'}
        </div>
    `;
    
    const myModal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    myModal.show();
}

// FUNCIONES DE IMPRESIÓN (Llaman a app.js)
function reimprimirOC(index) {
    const historial = JSON.parse(localStorage.getItem('historialOC')) || [];
    const oc = historial[index];
    if (typeof generarPDF === 'function') {
        generarPDF(oc);
    } else {
        alert("Error crítico: No se encuentra la función generarPDF en app.js");
    }
}

function reimprimirGuia(index) {
    const historial = JSON.parse(localStorage.getItem('historialOC')) || [];
    const oc = historial[index];
    if (typeof generarGuiaPDF === 'function') {
        generarGuiaPDF(oc);
    } else {
        alert("Error crítico: No se encuentra la función generarGuiaPDF en app.js");
    }
}

function anularOC(index) {
    if (confirm("¿Está seguro de ANULAR este documento? Esta acción aparecerá marcada en rojo en el historial.")) {
        let historial = JSON.parse(localStorage.getItem('historialOC')) || [];
        historial[index].estado = "Anulada";
        localStorage.setItem('historialOC', JSON.stringify(historial));
        cargarTabla();
    }
}

// Exponer funciones al objeto global window para asegurar compatibilidad con onclick HTML
window.filtrarTabla = filtrarTabla;
window.reimprimirOC = reimprimirOC;
window.reimprimirGuia = reimprimirGuia;
window.verDetalle = verDetalle;
window.anularOC = anularOC;