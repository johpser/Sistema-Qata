let productosGuardados = [];
// Contadores con persistencia en LocalStorage
let contadorOC = localStorage.getItem('contadorQata') ? parseInt(localStorage.getItem('contadorQata')) : 431;
let contadorGuia = localStorage.getItem('contadorGuiaQata') ? parseInt(localStorage.getItem('contadorGuiaQata')) : 100;

// --- FUNCIÓN PARA DETECTAR LA RUTA DEL LOGO SEGÚN LA CARPETA ---
function obtenerRutaLogo() {
    if (window.location.pathname.includes("/page/")) {
        return "../imagenes/LOGO QATA.png";
    }
    return "imagenes/LOGO QATA.png";
}

document.addEventListener("DOMContentLoaded", () => {
    const hoy = new Date();
    const fechaElem = document.getElementById('fecha');
    if (fechaElem) fechaElem.innerText = `Fecha: ${hoy.toLocaleDateString()}`;
    actualizarNumeros(); 
});

function actualizarNumeros() {
    const hoy = new Date();
    const ocNum = `OC-${hoy.getFullYear()}-${contadorOC}`;
    const grNum = `GR-${hoy.getFullYear()}-${contadorGuia}`;
    
    if (document.getElementById('ocNumero')) {
        document.getElementById('ocNumero').innerText = ocNum;
    }
    window.guiaAsignada = grNum;
}

function agregarProducto() {
    const desc = document.getElementById('producto').value;
    const cant = parseFloat(document.getElementById('cantidad').value);
    const prec = parseFloat(document.getElementById('precio').value);

    if (!desc || isNaN(cant) || isNaN(prec)) {
        alert("Por favor, complete descripción, cantidad y precio.");
        return;
    }

    productosGuardados.push({
        prod: desc.toUpperCase(),
        cant: cant,
        prec: prec,
        subtotal: cant * prec
    });

    document.getElementById('producto').value = "";
    document.getElementById('cantidad').value = "";
    document.getElementById('precio').value = "";
    renderizarTabla();
}

function renderizarTabla() {
    const tbody = document.getElementById('detalle');
    if (!tbody) return;
    tbody.innerHTML = "";
    let sumaSubtotal = 0;
    const moneda = document.getElementById('moneda').value;

    productosGuardados.forEach((p, index) => {
        sumaSubtotal += p.subtotal;
        tbody.innerHTML += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${p.prod}</td>
                <td class="text-center">${p.cant}</td>
                <td class="text-end">${moneda} ${p.prec.toFixed(2)}</td>
                <td class="text-end">${moneda} ${p.subtotal.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">X</button>
                </td>
            </tr>`;
    });

    const igv = sumaSubtotal * 0.18;
    const total = sumaSubtotal + igv;

    document.getElementById('subtotal').innerText = `${moneda} ${sumaSubtotal.toFixed(2)}`;
    document.getElementById('igv').innerText = `${moneda} ${igv.toFixed(2)}`;
    document.getElementById('total').innerText = `${moneda} ${total.toFixed(2)}`;
}

function eliminarProducto(index) {
    productosGuardados.splice(index, 1);
    renderizarTabla();
}

function finalizarOC() {
    if (productosGuardados.length === 0) {
        alert("Debe agregar al menos un producto.");
        return;
    }

    const oc = {
        numero: document.getElementById('ocNumero').innerText,
        numeroGuia: window.guiaAsignada,
        fechaEmision: new Date().toLocaleDateString(),
        proveedor: document.getElementById('razonProv').value.toUpperCase() || "",
        ruc: document.getElementById('rucProv').value || "",
        direccion: document.getElementById('dirProv').value.toUpperCase() || "",
        vendedor: document.getElementById('vendedorProv').value.toUpperCase() || "",
        correo: document.getElementById('correoV').value || "",
        celular: document.getElementById('celularV').value || "",
        cotizacion: document.getElementById('cotizacionV').value || "---",
        entrega: document.getElementById('FechaE').value || "---",
        pago: document.getElementById('terminoPago').value,
        comprador: document.getElementById('compradorNombre').value.toUpperCase() || "",
        compradorCel: document.getElementById('compradorCel').value || "",
        compradorCorreo: document.getElementById('compradorCorreo').value || "",
        obra: document.getElementById('obra').value.toUpperCase() || "",
        ubicacion: document.getElementById('ubicacionObra').value.toUpperCase() || "",
        moneda: document.getElementById('moneda').value,
        productos: [...productosGuardados], 
        subtotal: document.getElementById('subtotal').innerText,
        igv: document.getElementById('igv').innerText,
        total: document.getElementById('total').innerText,
        estado: "Activa"
    };

    let historial = JSON.parse(localStorage.getItem('historialOC')) || [];
    historial.push(oc);
    localStorage.setItem('historialOC', JSON.stringify(historial));

    // Generar Documentos
    generarPDF(oc);
    generarGuiaPDF(oc);

    // Actualizar Contadores
    contadorOC++;
    contadorGuia++;
    localStorage.setItem('contadorQata', contadorOC);
    localStorage.setItem('contadorGuiaQata', contadorGuia);
    
    alert("Orden de Compra y Guía de Remisión generadas correctamente.");
    window.location.reload();
}

// --- GENERACIÓN DE PDF ORDEN DE COMPRA ---
function generarPDF(oc) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    const logo = new Image();
    logo.src = obtenerRutaLogo();

    logo.onload = function () {
        // ENCABEZADO
        doc.addImage(logo, "PNG", 10, 10, 45, 20);
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(20); doc.setTextColor(0, 123, 255);
        doc.text("GRUPO QATA", 105, 15, { align: "center" });
        
        doc.setFontSize(14); doc.setTextColor(0, 0, 0);
        doc.text("QATA ASOCIADOS S.A.C.", 105, 22, { align: "center" });
        
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text("RUC: 20605226362", 105, 27, { align: "center" });
        doc.text("AV. CAMINO REAL 1236, SAN ISIDRO, LIMA", 105, 31, { align: "center" });
        
        doc.setTextColor(0, 123, 255);
        doc.text("Correo: Paster@grupoqata.pe - Jalejandro@grupoqata.pe", 105, 36, { align: "center" });
        
        doc.setTextColor(0, 0, 0);
        doc.text("Cel: 957 254 498", 105, 41, { align: "center" });

        // CUADRO OC
        doc.setDrawColor(0); doc.setLineWidth(0.5);
        doc.rect(150, 10, 50, 32);
        doc.setFontSize(10); doc.setFont(undefined, 'bold');
        doc.text("ORDEN DE COMPRA", 175, 17, { align: "center" });
        doc.setTextColor(220, 53, 69);
        doc.setFontSize(12); doc.text(oc.numero, 175, 26, { align: "center" });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(`Fecha: ${oc.fechaEmision}`, 175, 34, { align: "center" });

        // SECCIONES DATOS
        doc.setLineWidth(0.1);
        doc.rect(10, 50, 92, 48);
        doc.setFont(undefined, 'bold'); doc.text("DATOS DE PROVEEDOR", 12, 55);
        doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        let yP = 60;
        [`Proveedor: ${oc.proveedor}`, `RUC: ${oc.ruc}`, `Vendedor: ${oc.vendedor}`, `Correo/Tel: ${oc.correo} / ${oc.celular}`, `Dirección: ${oc.direccion}`, `Cotización: ${oc.cotizacion}`, `Entrega: ${oc.entrega}`, `Pago: ${oc.pago}`].forEach(t => {
            const lines = doc.splitTextToSize(t, 88); doc.text(lines, 12, yP); yP += lines.length * 4.2;
        });

        doc.rect(108, 50, 92, 48);
        doc.setFontSize(9); doc.setFont(undefined, 'bold'); doc.text("ENTREGAR EN OBRA", 110, 55);
        doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        let yO = 60;
        [`Obra: ${oc.obra}`, `Ubicación: ${oc.ubicacion}`, `Comprador: ${oc.comprador}`, `Celular: ${oc.compradorCel}`, `Correo: ${oc.compradorCorreo}`].forEach(t => {
            const lines = doc.splitTextToSize(t, 88); doc.text(lines, 110, yO); yO += lines.length * 4.2;
        });

        // TABLA PRODUCTOS
        doc.autoTable({
            startY: 105,
            head: [["Item", "Descripción", "Cant", "Precio", "Subtotal"]],
            body: oc.productos.map((p, i) => [i + 1, p.prod, p.cant, `${oc.moneda} ${p.prec.toFixed(2)}`, `${oc.moneda} ${p.subtotal.toFixed(2)}`]),
            headStyles: { fillColor: [0, 123, 255] },
            styles: { fontSize: 8 },
            columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
        });

        let fy = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Subtotal: ${oc.subtotal}`, 195, fy, { align: "right" });
        doc.text(`IGV 18%: ${oc.igv}`, 195, fy + 5, { align: "right" });
        doc.setFont(undefined, 'bold'); doc.text(`TOTAL: ${oc.total}`, 195, fy + 12, { align: "right" });

        fy += 20;
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.5);
        doc.text(doc.splitTextToSize("NOTA TÉCNICA: Adjuntar certificados de calidad y garantías.", 185), 12, fy);
        
        fy += 8;
        doc.rect(10, fy - 4, 190, 12);
        doc.text(doc.splitTextToSize("CONDICIONES: 1. Aceptación total de términos. 2. Anotar OC en Guía y Factura.", 185), 12, fy);

        doc.save(`${oc.numero}.pdf`);
    };

    logo.onerror = function() {
        alert("Error cargando el logo. Se generará el PDF sin imagen.");
        logo.onload(); // Forzamos ejecución sin imagen
    };
}

// --- GENERACIÓN DE PDF GUÍA DE REMISIÓN ---
function generarGuiaPDF(oc) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    const logo = new Image();
    logo.src = obtenerRutaLogo();

    logo.onload = function () {
        doc.addImage(logo, "PNG", 10, 10, 40, 18);
        doc.setFontSize(9); doc.setFont(undefined, 'bold');
        doc.text("QATA ASOCIADOS S.A.C.", 10, 35);
        doc.setFont(undefined, 'normal'); doc.text("RUC: 20605226362", 10, 40);
        
        doc.rect(140, 10, 60, 30);
        doc.setFont(undefined, 'bold'); doc.setFontSize(12);
        doc.text("GUÍA DE REMISIÓN", 170, 18, { align: "center" });
        doc.text("RUC: 20605226362", 170, 25, { align: "center" });
        doc.setTextColor(220, 53, 69);
        doc.text("N° " + oc.numeroGuia, 170, 33, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.5);
        doc.text(`FECHA DE TRASLADO: ${oc.fechaEmision}`, 10, 48);

        doc.rect(10, 52, 190, 18);
        doc.setFont(undefined, 'bold'); doc.text("PUNTO DE PARTIDA (REMITENTE)", 12, 57);
        doc.setFont(undefined, 'normal'); doc.text(`${oc.proveedor} - RUC: ${oc.ruc}`, 12, 63);

        doc.rect(10, 72, 190, 18);
        doc.setFont(undefined, 'bold'); doc.text("PUNTO DE LLEGADA (DESTINATARIO)", 12, 77);
        doc.setFont(undefined, 'normal'); doc.text(`${oc.obra} - Ubicación: ${oc.ubicacion}`, 12, 83);

        doc.autoTable({
            startY: 95,
            head: [["Cant", "Descripción de Bienes", "Unidad"]],
            body: oc.productos.map(p => [p.cant, p.prod, "UND"]),
            headStyles: { fillColor: [100, 100, 100] },
            columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' } }
        });

        let fy = doc.lastAutoTable.finalY + 12;
        doc.rect(10, fy, 190, 15);
        doc.text("TRANSPORTE: Placa: ____________  Chofer: ____________________", 12, fy + 9);

        fy += 35;
        doc.line(30, fy, 80, fy); doc.text("RECIBIDO EN OBRA", 38, fy + 5);
        doc.line(130, fy, 180, fy); doc.text("DESPACHADO PROVEEDOR", 132, fy + 5);

        doc.save(`${oc.numeroGuia}.pdf`);
    };

    logo.onerror = function() {
        logo.onload();
    };
}