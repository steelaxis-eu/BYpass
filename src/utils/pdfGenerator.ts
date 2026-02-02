import jsPDF from 'jspdf'

interface WaiverData {
    clientName: string
    procedureType: string
    pigment: string
    batchNumber: string
    signatureDataUrl: string
}

export const generateWaiverPDF = ({
    clientName,
    procedureType,
    pigment,
    batchNumber,
    signatureDataUrl
}: WaiverData): Blob => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(22)
    doc.text('BeautyPass - Liability Waiver & Consent', 20, 20)

    // Procedure Details
    doc.setFontSize(14)
    doc.text('Procedure Details', 20, 40)

    doc.setFontSize(11)
    doc.text(`Start Date: ${new Date().toLocaleString()}`, 20, 50)
    doc.text(`Procedure: ${procedureType}`, 20, 58)
    doc.text(`Pigment: ${pigment}`, 20, 66)
    doc.text(`Batch Number: ${batchNumber}`, 20, 74)

    // Legal Text (Lorem Ipsum placeholder for MVP)
    doc.setFontSize(10)
    doc.text('I hereby acknowledge that I have been fully informed of the risks...', 20, 90)
    doc.text('I consent to the procedure and release the Master from liability...', 20, 100)

    // Signature Area
    doc.text('Signed By:', 20, 180)
    doc.setFontSize(14)
    doc.text(clientName, 20, 190)

    // Embed Signature
    if (signatureDataUrl) {
        doc.addImage(signatureDataUrl, 'PNG', 20, 200, 60, 30)
    }

    // Audit Trail
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Digital ID: ${crypto.randomUUID()}`, 20, 280)
    doc.text(`Generated via BeautyPass`, 150, 280)

    return doc.output('blob')
}
