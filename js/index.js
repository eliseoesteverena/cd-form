/*const header = document.querySelector("header")

header.innerHTML = `
<a href="#" class="active">Inicio</a> <input type="checkbox" id="open-menu" class="open-menu"><label class="label-open-sub" for="open-menu">Menú</label>
	<nav class="topnav" id="myTopnav"> <a class="link-correo-arg" href="correo-argentino-cd.html">Nueva CD Correo Argentino</a><a href="instrucciones.html">Instrucciones</a> <a href="about.html">Acerca de</a></nav>

`;*/

async function previewPDF(type) {
    try {
        // 1. Obtener la respuesta de generatePDF (Canvas o JPEG DataURL)
        const result = await generatePDF(type, 'preview');

        if (!result) {
            console.error('No se pudo obtener la vista previa.');
            return;
        }

        // 2. Convertir el resultado a DataURL si es un Canvas, o usar directamente si es string
        let imageSrc = '';
        if (result instanceof HTMLCanvasElement) {
            imageSrc = result.toDataURL('image/jpeg', 1.0);
        } else if (typeof result === 'string') {
            imageSrc = result;
        } else if (result && typeof result.toDataURL === 'function') {
            imageSrc = result.toDataURL('image/jpeg', 1.0);
        } else {
            console.error('El formato devuelto por generatePDF no es un Canvas ni una URL válida.');
            return;
        }

        // 3. Abrir nueva pestaña
        const previewWin = window.open('', '_blank');

        if (!previewWin) {
            alert('Por favor habilita las ventanas emergentes para ver la vista previa.');
            return;
        }

        // 4. Inyectar HTML estructurado con la hoja exacta (21.5cm x 35.5cm)
        previewWin.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Vista Previa - ${type === 'cd_correo_andreani' ? 'Andreani' : 'Correo Argentino'}</title>
                <style>
                    @page {
                        size: 21.5cm 35.5cm;
                        margin: 0;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        background-color: #323639;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 20px 0;
                        min-height: 100vh;
                        font-family: system-ui, -apple-system, sans-serif;
                    }
                    /* Contenedor exacto de 21.5 cm x 35.5 cm */
                    .sheet-container {
                        width: 21.5cm;
                        height: 35.5cm;
                        margin: 0;
                        padding: 0;
                        background-color: #ffffff;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                        position: relative;
                        overflow: hidden;
                    }
                    .sheet-image {
                        width: 100%;
                        height: 100%;
                        display: block;
                        object-fit: fill;
                    }
                    @media print {
                        body {
                            background: none;
                            padding: 0;
                        }
                        .sheet-container {
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="sheet-container">
                    <img src="${imageSrc}" class="sheet-image" alt="Vista Previa" />
                </div>
            </body>
            </html>
        `);

        previewWin.document.close();

    } catch (error) {
        console.error('Error al generar la vista previa:', error);
    }
}

// -------------------------------------------------------------
// 1. Crear e inyectar Overlay de Drag & Drop
// -------------------------------------------------------------
const dropOverlay = document.createElement('div');
dropOverlay.id = 'drop-overlay';
dropOverlay.innerHTML = `
    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Soltá tu archivo PDF o Word (.docx) aquí</h2>
    <p style="font-size: 1.1rem;">Extraeremos automáticamente los datos del Remitente, Destinatario y Cuerpo</p>
`;
document.body.appendChild(dropOverlay);

// Prevent defaults en eventos de arrastre
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

// Mostrar / Ocultar Overlay
let dragCounter = 0;
document.body.addEventListener('dragenter', () => {
    dragCounter++;
    dropOverlay.classList.add('active');
});

document.body.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter === 0) {
        dropOverlay.classList.remove('active');
    }
});

document.body.addEventListener('drop', async (e) => {
    dragCounter = 0;
    dropOverlay.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await processFileWithGemini(file);
});

// -------------------------------------------------------------
// 2. Procesamiento de archivos (PDF / Word) y envío a Gemini
// -------------------------------------------------------------
async function processFileWithGemini(file) {
    try {
        let inputContent = null;

        if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
            const base64Data = await fileToBase64(file);
            inputContent = {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64Data
                }
            };
        } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
            // Extracción limpia para .docx
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            inputContent = { text: result.value };
        } else if (file.name.endsWith('.doc') || file.type === "application/msword") {
            // Extracción de texto plano para .doc antiguo (Word 97-2003)
            const extractedText = await extractRawTextFromLegacyDoc(file);
            inputContent = { text: extractedText };
        } else {
            alert("Formato no soportado. Usa PDF, DOCX o DOC.");
            return;
        }

        await callGeminiExtractionAPI(inputContent);

    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        alert("Ocurrió un error al procesar el archivo.");
    }
}

// Función helper para extraer texto legible de un archivo .doc binario
async function extractRawTextFromLegacyDoc(file) {
    const arrayBuffer = await file.arrayBuffer();
    // Decodificar el binario como texto (Windows-1252 o UTF-8)
    const decoder = new TextDecoder('windows-1252');
    const rawString = decoder.decode(arrayBuffer);

    // Filtrar caracteres no imprimibles dejando solo texto, espacios y saltos de línea
    const cleanText = rawString
        .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return cleanText;
}

// Convertir archivo local a Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// -------------------------------------------------------------
// 3. Consulta a la API de Gemini con JSON Estructurado
// -------------------------------------------------------------
async function callGeminiExtractionAPI(inputContent) {
    const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputContent)
    });
    
    if (!response.ok) {
        throw new Error("Error al extraer datos");
    }
    
    const structuredData = await response.json();
    populateFormWithExtractedData(structuredData);
}
// -------------------------------------------------------------
// 4. Inyección de datos en los Inputs y Editor Quill
// -------------------------------------------------------------
function populateFormWithExtractedData(data) {
    if (data.remitente) {
        if (data.remitente.nombre) document.getElementById('nombre_rt').value = data.remitente.nombre;
        if (data.remitente.domicilio) document.getElementById('domicilio_rt').value = data.remitente.domicilio;
        if (data.remitente.cp) document.getElementById('cp_rt').value = data.remitente.cp;
        if (data.remitente.localidad) document.getElementById('localidad_rt').value = data.remitente.localidad;
        if (data.remitente.provincia) document.getElementById('provincia_rt').value = data.remitente.provincia;
    }

    if (data.destinatario) {
        if (data.destinatario.nombre) document.getElementById('nombre_dt').value = data.destinatario.nombre;
        if (data.destinatario.domicilio) document.getElementById('domicilio_dt').value = data.destinatario.domicilio;
        if (data.destinatario.cp) document.getElementById('cp_dt').value = data.destinatario.cp;
        if (data.destinatario.localidad) document.getElementById('localidad_dt').value = data.destinatario.localidad;
        if (data.destinatario.provincia) document.getElementById('provincia_dt').value = data.destinatario.provincia;
    }
/*
    if (data.cuerpo && typeof quill !== 'undefined') {
        quill.setText(data.cuerpo);
    }*/
}


 /* --------------------------- */
// 1. Obtener Parchment desde Quill
const Parchment = Quill.import('parchment');

// 2. Crear los attributors con las listas de valores ampliadas
const LineHeightStyle = new Parchment.Attributor.Style('line-height', 'line-height', {
    scope: Parchment.Scope.BLOCK,
    whitelist: ['0.5', '0.8', '1', '1.15', '1.5', '2', '2.5']
});
Quill.register(LineHeightStyle, true);

const SizeStyle = new Parchment.Attributor.Style('size', 'font-size', {
    scope: Parchment.Scope.INLINE,
    whitelist: ['7pt', '8pt', '9pt', '10pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '30pt']
});
Quill.register(SizeStyle, true);

// 3. Inicializar Quill con las opciones en el toolbar
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'size': ['7pt', '8pt', '9pt', '10pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '30pt'] }],
            [{ 'line-height': ['0.5', '0.8', '1', '1.15', '1.5', '2', '2.5'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': ['', 'center', 'right', 'justify'] }],
            ['clean']
        ]
    }
});

// 4. ESTABLECER TAMAÑO E INTERLINEADO POR DEFECTO AL INICIALIZAR
const DEFAULT_SIZE = '10pt'; // Define aquí el tamaño inicial deseado
const DEFAULT_LINE_HEIGHT = '1.15'; // Define aquí el interlineado inicial si lo deseas

// Aplicar al contenido HTML cargado inicialmente en el editor
quill.formatText(0, quill.getLength(), {
    'size': DEFAULT_SIZE,
    'line-height': DEFAULT_LINE_HEIGHT
});

// Posicionar el cursor al inicio y forzar el formato activo para el toolbar
quill.setSelection(0, 0);
quill.format('size', DEFAULT_SIZE);
quill.format('line-height', DEFAULT_LINE_HEIGHT);

async function generatePDF(correo, output = 'pdf') {
    const { jsPDF } = window.jspdf;
    
    // Recolectar datos del formulario
    const datos = {
        nombre_rt: document.getElementById('nombre_rt').value,
        domicilio_rt: document.getElementById('domicilio_rt').value,
        cp_rt: document.getElementById('cp_rt').value,
        localidad_rt: document.getElementById('localidad_rt').value,
        provincia_rt: document.getElementById('provincia_rt').value,
        nombre_dt: document.getElementById('nombre_dt').value,
        domicilio_dt: document.getElementById('domicilio_dt').value,
        cp_dt: document.getElementById('cp_dt').value,
        localidad_dt: document.getElementById('localidad_dt').value,
        provincia_dt: document.getElementById('provincia_dt').value,
        nombre_rt_bis: document.getElementById('nombre_rt').value,
        domicilio_rt_bis: document.getElementById('domicilio_rt').value,
        cp_rt_bis: document.getElementById('cp_rt').value,
        localidad_rt_bis: document.getElementById('localidad_rt').value,
        provincia_rt_bis: document.getElementById('provincia_rt').value,
        nombre_dt_bis: document.getElementById('nombre_dt').value,
        domicilio_dt_bis: document.getElementById('domicilio_dt').value,
        cp_dt_bis: document.getElementById('cp_dt').value,
        localidad_dt_bis: document.getElementById('localidad_dt').value,
        provincia_dt_bis: document.getElementById('provincia_dt').value,
        cuerpo_cd: quill.root.innerHTML // Usamos el HTML interno de Quill directamente para mantener estilos de forma nativa
    };

    // Configuración de posicionamiento por campo (en centímetros)
    const config = {
        nombre_rt: {
            sizesAndPos: {
                cd_correo_arg: { x: 2.54, y: 3, width: 8.13, height: 1.26 },
                cd_correo_andreani: { x: 1.37, y: 2.86, width: 9.3, height: 0.5 }
            },
            text: datos.nombre_rt
        },
        domicilio_rt: {
            sizesAndPos: {
                cd_correo_arg: { x: 2.54, y: 4.75, width: 8.12, height: 0.49 },
                cd_correo_andreani: { x: 1.37, y: 3.73, width: 9.3, height: 0.5 }
            },
            text: datos.domicilio_rt
        },
        cp_rt: {
            sizesAndPos: {
                cd_correo_arg: { x: 2.55, y: 5.56, width: 2.3, height: 0.47 },
                cd_correo_andreani: { x: 1.37, y: 4.6, width: 1.5, height: 0.5 }
            },
            text: datos.cp_rt
        },
        localidad_rt: {
            sizesAndPos: {
                cd_correo_arg: { x: 5, y: 5.56, width: 2.92, height: 0.47 },
                cd_correo_andreani: { x: 2.98, y: 4.6, width: 2.96, height: 0.5 }
            },
            text: datos.localidad_rt
        },
        provincia_rt: {
            sizesAndPos: {
                cd_correo_arg: { x: 8, y: 5.56, width: 2.57, height: 0.47 },
                cd_correo_andreani: { x: 6, y: 4.6, width: 4.67, height: 0.5 }
            },
            text: datos.provincia_rt
        },
        nombre_dt: {
            sizesAndPos: {
                cd_correo_arg: { x: 10.9, y: 3, width: 8.12, height: 1.263 },
                cd_correo_andreani: { x: 11.58, y: 2.86, width: 9.3, height: 0.5 }
            },
            text: datos.nombre_dt
        },
        domicilio_dt: {
            sizesAndPos: {
                cd_correo_arg: { x: 10.9, y: 4.75, width: 8.19, height: 0.486 },
                cd_correo_andreani: { x: 11.58, y: 3.73, width: 9.3, height: 0.5 }
            },
            text: datos.domicilio_dt
        },
        cp_dt: {
            sizesAndPos: {
                cd_correo_arg: { x: 10.9, y: 5.56, width: 2.3, height: 0.47 },
                cd_correo_andreani: { x: 11.58, y: 4.6, width: 1.5, height: 0.5 }
            },
            text: datos.cp_dt
        },
        localidad_dt: {
            sizesAndPos: {
                cd_correo_arg: { x: 13.4, y: 5.56, width: 2.92, height: 0.47 },
                cd_correo_andreani: { x: 13.19, y: 4.6, width: 2.96, height: 0.5 }
            },
            text: datos.localidad_dt
        },
        provincia_dt: {
            sizesAndPos: {
                cd_correo_arg: { x: 16.4, y: 5.56, width: 2.57, height: 0.47 },
                cd_correo_andreani: { x: 16.21, y: 4.6, width: 4.67, height: 0.5 }
            },
            text: datos.provincia_dt
        },
        nombre_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 2.54, y: 12.4, width: 8.13, height: 1.26 },
                cd_correo_andreani: { x: 1.37, y: 10.19, width: 9.3, height: 0.5 }
            },
            text: datos.nombre_rt_bis
        },
        domicilio_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 2.54, y: 14.15, width: 8.12, height: 0.49 },
                cd_correo_andreani: { x: 1.37, y: 11.06, width: 9.3, height: 0.5 }
            },
            text: datos.domicilio_rt_bis
        },
        cp_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 2.55, y: 14.96, width: 2.3, height: 0.47 },
                cd_correo_andreani: { x: 1.37, y: 11.93, width: 1.5, height: 0.5 }
            },
            text: datos.cp_rt_bis
        },
        localidad_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 5, y: 14.96, width: 2.92, height: 0.47 },
                cd_correo_andreani: { x: 2.98, y: 11.93, width: 2.96, height: 0.5 }
            },
            text: datos.localidad_rt_bis
        },
        provincia_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 8, y: 14.96, width: 2.57, height: 0.47 },
                cd_correo_andreani: { x: 6, y: 11.93, width: 4.67, height: 0.5 }
            },
            text: datos.provincia_rt_bis
        },
        nombre_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 10.9, y: 12.4, width: 8.12, height: 1.263 },
                cd_correo_andreani: { x: 11.58, y: 10.19, width: 9.3, height: 0.5 }
            },
            text: datos.nombre_dt_bis
        },
        domicilio_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 10.9, y: 14.15, width: 8.19, height: 0.486 },
                cd_correo_andreani: { x: 11.58, y: 11.06, width: 9.3, height: 0.5 }
            },
            text: datos.domicilio_dt_bis
        },
        cp_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 10.9, y: 14.96, width: 2.3, height: 0.47 },
                cd_correo_andreani: { x: 11.58, y: 11.93, width: 1.5, height: 0.5 }
            },
            text: datos.cp_dt_bis
        },
        localidad_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 13.4, y: 14.96, width: 2.92, height: 0.47 },
                cd_correo_andreani: { x: 13.19, y: 11.93, width: 2.96, height: 0.5 }
            },
            text: datos.localidad_dt_bis
        },
        provincia_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: { x: 16.4, y: 14.96, width: 2.57, height: 0.47 },
                cd_correo_andreani: { x: 16.21, y: 11.93, width: 4.67, height: 0.5 }
            },
            text: datos.provincia_dt_bis
        },
        cuerpo_cd: {
            sizesAndPos: {
                cd_correo_arg: { x: 1.7, y: 15.8, width: 18, height: 13.5 },
                cd_correo_andreani: { x: 0.8, y: 12.95, width: 19, height: 17.7 }
            },
            text: datos.cuerpo_cd
        }
    };

    // 1. Crear un contenedor temporal absoluto en el DOM con fondo blanco opaco absoluto (#ffffff)
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '21.5cm';
    container.style.height = '35.5cm';
    container.style.backgroundColor = '#ffffff'; // Forzar fondo totalmente opaco sin transparencias
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'Helvetica, Arial, sans-serif';
    container.style.zIndex = '99999';
    document.body.appendChild(container);

    // 2. Inyectar cada elemento en su posición exacta usando CSS absoluto dentro del contenedor blanco
    for (const fieldName in config) {
        const field = config[fieldName];
        const pos = field.sizesAndPos[correo];
        
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${pos.x}cm`;
        div.style.top = `${pos.y}cm`;
        div.style.width = `${pos.width}cm`;
        div.style.height = `${pos.height}cm`;
        div.style.fontSize = '9pt';
        div.style.lineHeight = '1.2';
        div.style.overflow = 'hidden';
        div.style.backgroundColor = '#ffffff'; // Asegurar opacidad interna en cada bloque
        div.style.color = '#000000';

        if (fieldName === 'cuerpo_cd') {
            div.style.fontSize = '12pt';
            div.innerHTML = field.text; // Mantiene etiquetas HTML del editor Quill (negritas, cursivas, alineaciones)
        } else {
            div.textContent = field.text;
        }

        container.appendChild(div);
    }

    try {
        // 3. Rasterizar el contenedor completo usando html2canvas con escala alta para nitidez y fondo blanco forzado
        const canvas = await html2canvas(container, {
            scale: 3, // Mayor escala para asegurar que el texto rasterizado salga súper nítido
            useCORS: true,
            backgroundColor: '#ffffff' // Garantiza que no se genere ningún canal alfa transparente
        });

        // 4. Inicializar jsPDF e incrustar la imagen rasterizada limpia
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: [21.5, 35.5]
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.99); // Usar JPEG con alta calidad para evitar artefactos de compresión PNG alfa
        pdf.addImage(imgData, 'JPEG', 0, 0, 21.5, 35.5);

        if(output == 'pdf'){
        // 5. Guardar el PDF resultante
        pdf.save('generated-document.pdf') } else {
            return canvas;
        }
            
        ;
    } catch (error) {
        console.error("Error al rasterizar el documento PDF:", error);
    } finally {
        // Limpiar el contenedor temporal del DOM
        document.body.removeChild(container);
    }
}