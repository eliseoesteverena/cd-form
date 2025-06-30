const header = document.querySelector("header")

header.innerHTML = `
<a href="#" class="active">Inicio</a> <input type="checkbox" id="open-menu" class="open-menu"><label class="label-open-sub" for="open-menu">Menú</label>
	<nav class="topnav" id="myTopnav"> <a class="link-correo-arg" href="correo-argentino-cd.html">Nueva CD Correo Argentino</a><a href="instrucciones.html">Instrucciones</a> <a href="about.html">Acerca de</a></nav>

`;
// Initialize Quill editor with custom toolbar options
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline'],
            [{ 'align': ['', 'center', 'right', 'justify'] }]
        ]
    }
});

function generatePDF(correo) {
    const { jsPDF } = window.jspdf;
    
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [21.5, 35.5]
    });

    // Collect form data
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
        // Copy sender/recipient info for the _bis fields
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
        cuerpo_cd: quill.getText()
    };

    // Configuration object for field positioning
    const config = {
        nombre_rt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 2.54,
                    y: 3,
                    width: 8.13,
                    height: 1.26
                },
                cd_correo_andreani: {
                    x: 1.37,
                    y: 2.86,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.nombre_rt
        },
        domicilio_rt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 2.54,
                    y: 4.75,
                    width: 8.12,
                    height: 0.49
                },
                cd_correo_andreani: {
                    x: 1.37,
                    y: 3.73,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.domicilio_rt
        },
        cp_rt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 2.55,
                    y: 5.56,
                    width: 2.3,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 1.37,
                    y: 4.6,
                    width: 1.5,
                    height: 0.5
                }
            },
            text: datos.cp_rt
        },
        localidad_rt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 5,
                    y: 5.56,
                    width: 2.92,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 2.98,
                    y: 4.6,
                    width: 2.96,
                    height: 0.5
                }
            },
            text: datos.localidad_rt
        },
        provincia_rt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 8,
                    y: 5.56,
                    width: 2.57,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 6,
                    y: 4.6,
                    width: 4.67,
                    height: 0.5
                }
            },
            text: datos.provincia_rt
        },
        nombre_dt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 10.9,
                    y: 3,
                    width: 8.12,
                    height: 1.263
                },
                cd_correo_andreani: {
                    x: 11.58,
                    y: 2.86,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.nombre_dt
        },
        domicilio_dt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 10.9,
                    y: 4.75,
                    width: 8.19,
                    height: 0.486
                },
                cd_correo_andreani: {
                    x: 11.58,
                    y: 3.73,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.domicilio_dt
        },
        cp_dt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 10.9,
                    y: 5.56,
                    width: 2.3,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 11.58,
                    y: 4.6,
                    width: 1.5,
                    height: 0.5
                }
            },
            text: datos.cp_dt
        },
        localidad_dt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 13.4,
                    y: 5.56,
                    width: 2.92,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 13.19,
                    y: 4.6,
                    width: 2.96,
                    height: 0.5
                }
            },
            text: datos.localidad_dt
        },
        provincia_dt: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 16.4,
                    y: 5.56,
                    width: 2.57,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 16.21,
                    y: 4.6,
                    width: 4.67,
                    height: 0.5
                }
            },
            text: datos.provincia_dt
        },
        nombre_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 2.54,
                    y: 12.4,
                    width: 8.13,
                    height: 1.26
                },
                cd_correo_andreani: {
                    x: 1.37,
                    y: 10.19,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.nombre_rt_bis
        },
        domicilio_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 2.54,
                    y: 14.15,
                    width: 8.12,
                    height: 0.49
                },
                cd_correo_andreani: {
                    x: 1.37,
                    y: 11.06,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.domicilio_rt_bis
        },
        cp_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 2.55,
                    y: 14.96,
                    width: 2.3,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 1.37,
                    y: 11.93,
                    width: 1.5,
                    height: 0.5
                }
            },
            text: datos.cp_rt_bis
        },
        localidad_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 5,
                    y: 14.96,
                    width: 2.92,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 2.98,
                    y: 11.93,
                    width: 2.96,
                    height: 0.5
                }
            },
            text: datos.localidad_rt_bis
        },
        provincia_rt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 8,
                    y: 14.96,
                    width: 2.57,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 6,
                    y: 11.93,
                    width: 4.67,
                    height: 0.5
                }
            },
            text: datos.provincia_rt_bis
        },
        nombre_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 10.9,
                    y: 12.4,
                    width: 8.12,
                    height: 1.263
                },
                cd_correo_andreani: {
                    x: 11.58,
                    y: 10.19,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.nombre_dt_bis
        },
        domicilio_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 10.9,
                    y: 14.15,
                    width: 8.19,
                    height: 0.486
                },
                cd_correo_andreani: {
                    x: 11.58,
                    y: 11.06,
                    width: 9.3,
                    height: 0.5
                }
            },
            text: datos.domicilio_dt_bis
        },
        cp_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 10.9,
                    y: 14.96,
                    width: 2.3,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 11.58,
                    y: 11.93,
                    width: 1.5,
                    height: 0.5
                }
            },
            text: datos.cp_dt_bis
        },
        localidad_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 13.4,
                    y: 14.96,
                    width: 2.92,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 13.19,
                    y: 11.93,
                    width: 2.96,
                    height: 0.5
                }
            },
            text: datos.localidad_dt_bis
        },
        provincia_dt_bis: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 16.4,
                    y: 14.96,
                    width: 2.57,
                    height: 0.47
                },
                cd_correo_andreani: {
                    x: 16.21,
                    y: 11.93,
                    width: 4.67,
                    height: 0.5
                }
            },
            text: datos.provincia_dt_bis
        },
        cuerpo_cd: {
            sizesAndPos: {
                cd_correo_arg: {
                    x: 1.7,
                    y: 15.8,
                    width: 18,
                    height: 13.5
                },
                cd_correo_andreani: {
                    x: 0.8,
                    y: 12.95,
                    width: 19,
                    height: 17.7
                }
            },
            text: datos.cuerpo_cd,
            alignment: "left"
        }
    };

    // Add text fields to PDF based on selected format
    for (const fieldName in config) {
        const field = config[fieldName];
        const pos = field.sizesAndPos[correo];
        
        // Set default font for fields
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        
        // Add text to PDF
        if (fieldName === 'cuerpo_cd') {
            // Handle main content with rich text formatting
            renderRichTextContent(pdf, pos.x, pos.y, pos.width, pos.height);
        } else {
            // Add simple text fields
            pdf.text(field.text, pos.x, pos.y);
        }
    }

    // Save the PDF
    pdf.save('generated-document.pdf');
}

function renderRichTextContent(pdf, x, y, width, height) {
    // Get Quill content
    const delta = quill.getContents();
    let currentY = y;
    let currentParagraph = [];

    // Process Quill Delta format
    delta.ops.forEach(op => {
        if (typeof op.insert === 'string') {
            const text = op.insert;
            const format = op.attributes || {};

            if (text === '\n') {
                if (currentParagraph.length > 0) {
                    renderParagraph(currentParagraph, x, currentY, width, pdf);
                    currentY += 0.5; // Paragraph spacing
                    currentParagraph = [];
                }
            } else {
                const words = text.split(/\s+/);
                words.forEach(word => {
                    if (word) {
                        currentParagraph.push({
                            text: word,
                            format: {
                                bold: format.bold || false,
                                italic: format.italic || false,
                                underline: format.underline || false,
                                size: format.size || 'normal'
                            }
                        });
                    }
                });
            }
        }
    });

    // Render any remaining paragraph
    if (currentParagraph.length > 0) {
        renderParagraph(currentParagraph, x, currentY, width, pdf);
    }
}

function renderParagraph(paragraph, x, y, maxWidth, pdf) {
    let line = [];
    let currentLineWidth = 0;

    // First pass: group words into lines
    for (let i = 0; i < paragraph.length; i++) {
        const word = paragraph[i];
        applyFormatting(pdf, word.format);
        const wordWidth = pdf.getTextWidth(word.text + ' ');

        if (currentLineWidth + wordWidth > maxWidth && line.length > 0) {
            renderLine(line, x, y, maxWidth, false, pdf);
            y += 0.5;
            line = [];
            currentLineWidth = 0;
        }

        line.push(word);
        currentLineWidth += wordWidth;

        // Handle last line or single word line
        if (i === paragraph.length - 1) {
            renderLine(line, x, y, maxWidth, true, pdf);
        }
    }

    return y;
}

function renderLine(line, x, y, maxWidth, isLastLine, pdf) {
    if (line.length === 0) return;

    if (!isLastLine && line.length > 1) {
        // Calculate total width of words and available space
        let totalWordWidth = 0;
        line.forEach(word => {
            applyFormatting(pdf, word.format);
            totalWordWidth += pdf.getTextWidth(word.text);
        });

        const totalSpacing = maxWidth - totalWordWidth;
        const spaceWidth = totalSpacing / (line.length - 1);
        let currentX = x;

        // Render each word with proper spacing
        line.forEach((word, index) => {
            // Apply formatting before measuring or rendering text
            applyFormatting(pdf, word.format);
            
            // Render the word
            pdf.text(word.text, currentX, y);
            
            // Add underline if needed
            if (word.format.underline) {
                const wordWidth = pdf.getTextWidth(word.text);
                pdf.line(currentX, y + 0.1, currentX + wordWidth, y + 0.1);
            }

            // Move to next position
            currentX += pdf.getTextWidth(word.text) + (index < line.length - 1 ? spaceWidth : 0);
        });
    } else {
        // Left align last line
        let currentX = x;
        line.forEach(word => {
            // Apply formatting before measuring or rendering text
            applyFormatting(pdf, word.format);
            
            // Render the word
            pdf.text(word.text, currentX, y);
            
            // Add underline if needed
            if (word.format.underline) {
                const wordWidth = pdf.getTextWidth(word.text);
                pdf.line(currentX, y + 0.1, currentX + wordWidth, y + 0.1);
            }

            currentX += pdf.getTextWidth(word.text + ' ');
        });
    }
}

function applyFormatting(pdf, format) {
    // Combine font styles properly
    let fontStyle = '';
    if (format.bold && format.italic) {
        fontStyle = 'bolditalic';
    } else if (format.bold) {
        fontStyle = 'bold';
    } else if (format.italic) {
        fontStyle = 'italic';
    } else {
        fontStyle = 'normal';
    }
    
    // Set font with combined style
    pdf.setFont('helvetica', fontStyle);

    // Set font size
    let fontSize = 12;
    switch (format.size) {
        case 'small': fontSize = 9; break;
        case 'large': fontSize = 15; break;
        case 'huge': fontSize = 18; break;
        default: fontSize = 12;
    }
    pdf.setFontSize(fontSize);
}
