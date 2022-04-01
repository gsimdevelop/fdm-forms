import { firaMono } from '../fira-mono'
const { jsPDF } = window.jspdf

const printExpositorPDF = ({ nameCompany, selectedCountry, nif, passport, email, province, city, cp, phone, address, web, contactPerson, contactPersonPhone, contactPersonEmail, options }) => {
  let doc = new jsPDF()
  const margenX = 15, margenXR = 210 - margenX


  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: 0.2 }))
  doc.addImage(" /gestioninterna/imagenes/logo_red.png", "PNG", 75, 200, 240, 75, 'FDMLOGO', 'NONE', 60)
  doc.restoreGraphicsState()

  doc.saveGraphicsState()
  doc.setFontSize(22)
  doc.setFont('Helvetica', 'bold', null)
  doc.text("SOLICITUD DE INSCRIPCIÓN", 85, 27)
  doc.addImage(" /gestioninterna/imagenes/logo_red.png", "PNG", margenX, 10, 69, 25)
  doc.restoreGraphicsState()

  doc.setFontSize(11)

  const empY = 55, marY = 5, marYP = 95

  doc.saveGraphicsState()
  doc.setFontSize(16)
  doc.setFont('Helvetica', 'bold', null)
  doc.text('DATOS PARA INSCRIPCIÓN', 105, empY - 7, { align: 'center' })
  doc.restoreGraphicsState()

  const posicionesX = [[margenX], [margenX, margenX + marYP], [margenX, margenX + marYP * 2 / 3, margenX + marYP * 4 / 3]]

  const labelsEmpresa = [
    "Nombre de la empresa:",
    "Email empresa:",
    "País fiscal:&NIF/CIF:",
    "Código postal:&Ciudad:&Provincia:",
    "Dirección:&Teléfono:",
    "Página web:&Nombre de contacto",
    "Móvil de contacto:&Email de contacto:"
  ]

  doc.addFileToVFS('firaMono.ttf', firaMono);
  doc.addFont('firaMono.ttf', 'firaMono', 'normal')
  // Labels
  doc.saveGraphicsState()

  doc.setFont('firaMono', 'normal', null)
  labelsEmpresa.forEach((label, index) =>
    label.split('&').forEach((l, i, array) =>
      doc.text(l, posicionesX[array.length - 1][i], empY + marY * index)
    )
  )
  doc.restoreGraphicsState()

  // Rectangulos
  const anchoRectangulo = 4
  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: 0.1 }))
  doc.setFillColor('#20A')
  const limit = [[margenXR], [108, margenXR], [77, 140, margenXR]]
  labelsEmpresa.forEach((label, index) =>
    label.split('&').forEach((l, i, array) =>
      doc.rect(posicionesX[array.length - 1][i] + l.length * 2.4 - 1, empY + marY * index - anchoRectangulo + 1,
        limit[array.length - 1][i] - (posicionesX[array.length - 1][i] + l.length * 2.4), anchoRectangulo, 'F')
    )
  )

  doc.restoreGraphicsState()

  const datos = [
    [nameCompany],
    [email],
    [selectedCountry, nif],
    [cp, city, province],
    [address, phone],
    [web, contactPerson],
    [contactPersonPhone, contactPersonEmail],
  ]

  //datos
  doc.saveGraphicsState()
  doc.setFontSize(10)
  doc.setFont("helvetica", 'normal')
  labelsEmpresa.forEach((label, index) =>
    label.split('&').forEach((l, i, array) =>
      doc.text(datos[index][i],
        posicionesX[array.length - 1][i] + l.length * 2.4 + 1,
        empY + marY * index)
    )
  )
  doc.restoreGraphicsState()

  const opcY = 105
  doc.saveGraphicsState()
  doc.setFontSize(16)
  doc.setFont('Helvetica', 'bold', null)
  doc.text('RESERVA DE ESPACIO', 105, opcY - 7, { align: 'center' })
  doc.restoreGraphicsState()

  const opciones = [
    {msg: "Seguro obligatorio de daños materiales", check: true},
    {msg: "Estand Contract", check: options.contract},
    {msg: "Estand premontado 48m²", check: options.stand48 },
    {msg: "Estand premontado 64m²", check: options.stand64 },
    {msg: "Suelo libre (obligatorio instalación de tarima con zócalo de entre 8 y 10 cm de altura)", check: options.freeFloor },
    {msg: "Pintura de estand", check: options.painting },
    {msg: "Limpieza diaria de estand", check: options.cleaning },
    {msg: "Moqueta (petición antes del 29-04-2022)", check: options.carpet },
  ]

  const prices = [
    '30 €',
    '1000 €',
    '45* €/m² € (2.160 €)',
    '45* €/m² € (2.880 €)',
    '30* €/m² €',
    '7,50 €/m² €',
    '35 €/día',
    '6 €/m² €',
  ]

  let jumps = 0
  const rectS = 4
  opciones.forEach((o, i) => {
    doc.text(o.msg, margenX + 5, opcY + 6 * (i + jumps), { maxWidth: 120 })
    if (o.msg.length > 60)
      jumps++
    doc.rect(margenX, opcY + 6 * (i + jumps) - 3.5 + (o.msg.length > 60 ? -3 : 0), rectS, rectS, (o.check ? 'F' : 'D'))
    doc.text(prices[i], margenX + 150, opcY + 6 * (i + (jumps)) - (o.msg.length > 60 ? 3 : 0), { align: 'center' })
  })

  doc.text('* Descuento de 5 €/m² por el pago completo anterior al 15 de marzo de 2022', margenX, opcY + 5 * 11 + 2)

  doc.circle(margenX + 2, opcY + 5 * 13 - 1, 0.7, 'F')
  doc.text(`Para que esta solicitud sea tenida en cuenta, deberá adjuntar el comprobante del ingreso mínimo
del 50% del importe correspondiente a la reserva de su estand más el seguro obligatorio y el IVA
del 10% junto con este documento firmado a 'info@feriayecla.com'.`, margenX + 5, opcY + 5 * 13)

  doc.circle(margenX + 2, opcY + 5 * 16 - 1, 0.7, 'F')
  doc.text(`La firma del presente documento supone el compromiso formal de la plena aceptación legal de
las condiciones de participación, que usted declara conocer.`, margenX + 5, opcY + 5 * 16)

  doc.text("Lugar ________________ fecha __/__/____", margenX + 5, opcY + 5 * 19)
  doc.text("Firma y sello de la empresa:", margenX + 5, opcY + 5 * 20 + 3)

  doc.setFontSize(8)
  doc.text(`Le informamos que los datos personales que Usted nos proporciona son tratados por FERIA DEL MUEBLE DE YECLA con NIF V30099063 y con domicilio en AVDA DE LA FERIA 7, 30510 de YECLA, MURCIA (ESPAÑA). Puede contactar con el Responsable, bien por teléfono en el número 968790775 o bien mediante correo electrónico en el buzón info@feriayecla.com No hay Delegado de Protección de Datos designado. Finalidad. Gestión de la relación mercantil, tanto desde un punto de vista administrativo y de cumplimiento de obligaciones fiscales, como desde un punto de vista comercial y de marketing de las empresas expositoras en feria. Plazo de Conservación. Los datos serán conservados durante el tiempo imprescindible para dar cumplimiento a la finalidad para la que fueron recabados y, posteriormente, permanecerán bloqueados mientras puedan derivarse responsabilidades del tratamiento y/o finalidad. No se toman decisiones automatizadas ni se elaboran perfiles. Base Jurídica del Tratamiento. El tratamiento de datos de contacto y en su caso los relativos a la función o puesto desempeñado de las personas físicas que presten servicios en una persona jurídica estarán legitimados bajo la base jurídica del artículo 6.1.f.) del RGPD, es decir, el interés legítimo del Responsable del tratamiento. Únicamente serán tratados los datos personales necesarios para la localización profesional. Destinatarios de cesiones. No se prevén realizar cesiones a terceros, salvo aquellas que están autorizadas por ley. Transferencias Internacionales. No se realizan transferencias internacionales. Derechos. De acuerdo con la legislación vigente tiene los siguientes derechos: a solicitar el acceso a sus datos personales, su rectificación o supresión, la limitación, oponerse al tratamiento y  a la portabilidad de los datos. Para ejercer sus derechos, debe dirigirse al responsable, solicitando el correspondiente formulario para el ejercicio del derecho elegido. Opcionalmente, puede redirigir al interesado a la Autoridad de Control competente para obtener información adicional acerca de sus derechos.`,
    margenX - 4, opcY + 5 * 25 + 3, { maxWidth: 188, align: 'justify' })

  doc.autoPrint()
  doc.save('newExpositor.pdf')
  return doc.output()
}


const printVisitorPDF = ({ nameCompany, visitorName, idVisitor, randomNumber }) => {
  var doc = new jsPDF();

  doc.addImage('/gestioninterna/imagenes/FMY_22_invitacion_Invitación_GS_min.jpg'
  , "JPEG", 0, 0, 210, 297);

  doc.text(visitorName ?? '', 36, 179.5)
  doc.text(nameCompany ?? '', 38, 187)

  doc.setTextColor('D83B33')
  doc.setFontSize('30')
  doc.text(String(idVisitor) ?? '', 46, 170)


  doc.addImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${idVisitor}-${randomNumber}`
  , "JPEG", 175, 10, 25, 25);

  // doc.autoPrint()
  // doc.save(`${visitorName}-${idVisitor}.pdf`)
  return doc.output()
}


export { printExpositorPDF, printVisitorPDF }