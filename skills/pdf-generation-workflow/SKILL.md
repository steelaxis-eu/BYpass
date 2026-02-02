---
name: pdf-generation-workflow
description: Workflow for generating compliant PDFs with embedded signatures and uploading them to Supabase Storage.
---

# PDF Generation & Compliance Workflow

This skill outlines how to generate a legal waiver PDF on the client side using `jspdf`, embed a signature, and upload it to Supabase.

## 1. Dependencies
```bash
npm install jspdf react-signature-canvas
```

## 2. Signature Capture
Use `react-signature-canvas` to capture the signature.
```typescript
// valid ref required
const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
```

## 3. PDF Generation Logic (`utils/pdfGenerator.ts`)

```typescript
import jsPDF from 'jspdf';

export const generateWaiverPDF = (
  clientName: string, 
  procedureType: string, 
  signatureDataUrl: string
): Blob => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.text('Liability Waiver & Consent', 20, 20);
  
  // Body Text
  doc.setFontSize(12);
  doc.text(`I, ${clientName}, hereby consent to the ${procedureType} procedure...`, 20, 40);
  
  // Disclaimer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('...legal text...', 20, 60);
  
  // Embed Signature
  // Ensure signatureDataUrl is a valid base64 PNG
  doc.addImage(signatureDataUrl, 'PNG', 20, 200, 50, 25); 
  
  doc.text(`Signed: ${clientName}`, 20, 230);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 235);

  return doc.output('blob');
}
```

## 4. Upload to Supabase Storage

```typescript
import { createClient } from '@/utils/supabase/client';

export const uploadWaiver = async (pdfBlob: Blob, userId: string, procedureId: string) => {
  const supabase = createClient();
  const filePath = `waivers/${userId}/${procedureId}_${Date.now()}.pdf`;

  const { data, error } = await supabase
    .storage
    .from('legal-docs')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) throw error;
  return data.path;
}
```

## 5. Storage Policies (RLS)
Bucket: `legal-docs`
- **Insert**: Authenticated users can upload to their own folder `waivers/uid/*`.
- **Select**: Masters (checked by role) can read all. Clients can read their own.
