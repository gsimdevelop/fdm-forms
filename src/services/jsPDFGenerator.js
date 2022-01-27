import { jsPDF } from 'jspdf'

const printExpositorPDF = ({ nameCompany, selectedCountry, nif, passport, email, province, city, cp, phone, address, web, contactPerson, contactPersonPhone, contactPersonEmail, options }) => {
  let doc = new jsPDF();
  console.log(doc.getFontList())

  if(nif === '')
    nif = passport

  const makeRectangleCheck = (x, y, wh, check)=> {
    doc.saveGraphicsState();
    doc.setLineWidth(.6)
    doc.rect(x, y, wh, wh)
    if(check){
      doc.line(x, y, x+wh, y+wh)
      doc.line(x+wh, y, x, y+wh)    
    }
    doc.restoreGraphicsState()
  }
  
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({opacity: 0.2}));
  doc.addImage("/gestioninterna/imagenes/logo_red.png", "PNG", 75, 200, 240, 75,'FDMLOGO','NONE', 60);
  doc.restoreGraphicsState();
  
  doc.setFontSize(22)
  doc.text("SOLICITUD DE INSCRIPCIÓN", 85, 27);
  doc.addImage("/gestioninterna/imagenes/logo_red.png", "PNG", 15, 10, 69, 25);
  
  doc.setFontSize(14)
  
  // Labels
  doc.text("Nombre de la empresa:", 15, 50)
  doc.text("País fiscal:", 15, 60)
  doc.text("NIF/CIF:", 100, 60)
  doc.text("Correo electrónico:", 15, 70)
  doc.text("Provincia:", 15, 80)
  doc.text("Ciudad:", 100, 80)
  doc.text("Código postal:", 15, 90)
  doc.text("Teléfono:", 100, 90)
  doc.text("Dirección:", 15, 100)
  doc.text("Página web:", 15, 110)
  doc.text("Nombre y móvil de contacto:", 15, 120)
  doc.text("Email de contacto:", 15, 130)
  
  // Rectangulos
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({opacity: 0.6}));
  doc.setFillColor('#CCC')
  doc.setDrawColor('#000')
  doc.rect(68, 44, 122, 8, 'FD') // Nombre empresa
  doc.rect(41, 54, 55, 8, 'FD') // País fiscal
  doc.rect(58, 64, 132, 8, 'FD') // Correo electrónico
  doc.rect(120, 54, 70, 8, 'FD') // NIF
  doc.rect(38, 74, 58, 8, 'FD') // Povincia
  doc.rect(120, 74, 70, 8, 'FD') // Ciudad
  doc.rect(48, 84, 48, 8, 'FD') // Codigo postal
  doc.rect(122, 84, 68, 8, 'FD') // Telefono
  doc.rect(38, 94, 152, 8, 'FD') // Dirección
  doc.rect(44, 104, 146, 8, 'FD') // Pagina web
  doc.rect(79, 114, 111, 8, 'FD') // Nombre y tlf. contacto
  doc.rect(57, 124, 133, 8, 'FD') // Email contacto
  
  doc.rect(15, 164, 175, 9, 'F') // 
  doc.rect(15, 184, 175, 14, 'F') // 
  doc.rect(15, 209, 175, 9, 'F') // 
  doc.restoreGraphicsState();
  
  
  // Datos
  doc.text(nameCompany, 70, 50) // DATO NOMBRE EMPRESA
  doc.text(selectedCountry.slice(0, 16), 43, 60) // DATO PAÍS
  doc.text(nif, 122, 60) // DATO NIF
  doc.text(email, 60, 70) // DATO CORREO
  doc.text(province, 40, 80) // DATO PROVINCIA
  doc.text(city, 122, 80) // DATO CIUDAD
  doc.text(cp, 50, 90) // DATO CP
  doc.text(phone, 124, 90) // DATO TELEFONO
  doc.text(address, 40, 100) // DATO DIRECCION
  doc.text(web, 46, 110) // DATO PAGINA WEB
  doc.text(contactPerson+' - '+contactPersonPhone, 80, 120) // NOMBRE - TLF DE CONTACTO
  doc.text(contactPersonEmail, 58, 130) // DATO EMAIL CONTACTO
  
  doc.setDrawColor('#000')
  
  
  // Options
  doc.text("Concepto", 45, 150)
  doc.text("Seguro obligatorio de daños materiales", 15, 160)
  doc.text("Estand premontado 48m²", 15, 170)
  doc.text(`Estand premontado 64m²`, 15, 180)
  doc.text(`Suelo libre (obligatorio instalación de tarima
  con zócalo de entre 8 y 10 cm de altura)`, 15, 190)
  doc.text("Pintura de estand", 15, 205)
  doc.text("Limpieza diaria de estand", 15, 215)
  doc.text("Moqueta (petición antes del 29-04-2022)", 15, 225)
  
  
  
  doc.text(`* Para que esta solicitud sea tenida en cuenta, deberá adjuntar el comprobante
  del ingreso mínimo del 50% del importe correspondiente a la reserva de su
  stand más el seguro obligatorio y el IVA del 10%.`, 15, 235)
  doc.text(`* La firma del presente documento supone el compromiso formal de la plena
  aceptación legal de las condiciones de participación, que usted declara conocer.`, 15, 255)
  doc.text("Lugar ________________ fecha __/__/____", 15, 275)
  doc.text("Firma y sello de la empresa:", 51, 285)
  
  // Table lines
  doc.line(15, 142, 190, 142)
  doc.line(15, 154, 190, 154)
  doc.line(141, 142, 141, 227)
  
  
  makeRectangleCheck(183, 156, 5, true)// Daños materiales
  makeRectangleCheck(183, 166, 5, options.stand48)// Estand 48
  makeRectangleCheck(183, 176, 5, options.stand64)// Estand 64
  makeRectangleCheck(183, 189, 5, options.freeFloor)// Suelo libre
  makeRectangleCheck(183, 201, 5, options.painting)// Pintura de estand
  makeRectangleCheck(183, 211, 5, options.cleaning)// Limpieza diaria
  makeRectangleCheck(183, 221, 5, options.carpet)// Moqueta
  
  
  
  
  // Prices
  doc.saveGraphicsState();
  doc.text("Pago completo\nanterior a 01/03", 143, 147)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text("30 €", 118, 160)
  doc.text("45 €/m² (2.160 €)", 105, 170)
  doc.text("40 €/m² (1.920 €)", 144, 170)
  doc.text("45 €/m² (2.880 €)", 105, 180)
  doc.text("40 €/m² (2.560 €)", 144, 180)
  doc.text("25 €/m²", 116, 193)
  doc.text("20 €/m²", 155, 193)
  doc.text("7,50 €/m²", 114, 205)
  doc.text("35 €/día", 115, 215)
  doc.text("6 €/m²", 117, 225)
  doc.restoreGraphicsState();
  
  doc.save('newExpositor.pdf')
  return doc.output()
}

export { printExpositorPDF }