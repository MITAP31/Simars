import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import fs from "fs";
import path from "path";

export interface DetailArsipItem {
  no: number;
  kodeKlasifikasi: string;
  namaArsip: string;
  jumlah: number;
  satuan: string;
  penulis: string;
  kurunWaktu: string;
  tanggalArsip: string;
  tingkatKeaslian: string;
  lokasiPenyimpanan: string;
}

export interface BeritaAcaraData {
  nomorBeritaAcara: string;
  tanggalPenyerahan: Date;
  pihakPertama: {
    nama: string;
    jabatan?: string | null;
    unit: string;
  };
  pihakKedua: {
    nama?: string | null;
    jabatan?: string | null;
    unit?: string | null;
  };
  details: DetailArsipItem[];
}

const HARI_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/[\r\n\t]/g, " ").replace(/[^\x20-\x7E\xA0-\xFF]/g, " ").trim();
}

function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
): string[] {
  const words = sanitizeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = "";
        for (const char of word) {
          if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) {
            chunk += char;
          } else {
            lines.push(chunk);
            chunk = char;
          }
        }
        currentLine = chunk;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : ["-"];
}

/**
 * Menggambar paragraf rata kiri dengan pembungkusan berdasarkan lebar font.
 * Baris tidak direntangkan agar jarak antar-kata tetap konsisten.
 */
function drawParagraph(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
  lineHeight: number,
  color = rgb(0, 0, 0),
): number {
  const lines = wrapText(text, maxWidth, font, fontSize);
  let curY = y;

  for (const line of lines) {
    page.drawText(line, {
      x,
      y: curY,
      size: fontSize,
      font,
      color,
    });
    curY -= lineHeight;
  }

  return curY;
}

async function tryEmbedLogo(pdfDoc: PDFDocument) {
  const publicDir = path.join(process.cwd(), "public");
  const candidates = ["pln-batam-logo.jpg", "pln-batam-logo.png"];

  for (const filename of candidates) {
    try {
      const filePath = path.join(publicDir, filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        if (fileBuffer.length > 4) {
          if (fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8) {
            return await pdfDoc.embedJpg(fileBuffer);
          }
          if (
            fileBuffer[0] === 0x89 &&
            fileBuffer[1] === 0x50 &&
            fileBuffer[2] === 0x4e &&
            fileBuffer[3] === 0x47
          ) {
            return await pdfDoc.embedPng(fileBuffer);
          }
          try {
            return await pdfDoc.embedJpg(fileBuffer);
          } catch {
            return await pdfDoc.embedPng(fileBuffer);
          }
        }
      }
    } catch {
      // Continue to next candidate
    }
  }
  return null;
}

/**
 * Format nomor Berita Acara: ......./BA/DD-MM-YYYY
 */
function resolveNomorBA(nomor: string | undefined | null, tanggal: Date): string {
  const dd = String(tanggal.getDate()).padStart(2, "0");
  const mm = String(tanggal.getMonth() + 1).padStart(2, "0");
  const yyyy = String(tanggal.getFullYear());
  const tglStr = `${dd}-${mm}-${yyyy}`;

  if (!nomor || nomor.startsWith("BA/") || nomor.includes("undefined")) {
    return `......./BA/${tglStr}`;
  }
  return nomor;
}

/**
 * Membuat dokumen PDF Berita Acara Penyerahan Arsip (A4)
 * Halaman 1: Berita Acara resmi (Times-Roman, rata kiri, kolom identitas sejajar)
 * Halaman 2 dst: Daftar Arsip Terlampir
 */
export async function generateBeritaAcaraPdf(
  data: BeritaAcaraData,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Dimensi kertas A4 (595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Margin Halaman 1: kiri 85 pt (~3.0 cm), kanan 85 pt (~3.0 cm)
  // Membuat area isi lebih sempit, proporsional, dan terpusat di tengah halaman A4
  const marginLeft = 85;
  const marginRight = 85;
  const contentWidth = pageWidth - marginLeft - marginRight; // 425.28 pt

  // Gunakan Font Times New Roman (StandardFonts.TimesRoman) untuk seluruh dokumen resmi
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const black = rgb(0, 0, 0);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const midGray = rgb(0.45, 0.45, 0.45);
  const lineGray = rgb(0.6, 0.6, 0.6);
  const tableHeaderBg = rgb(0.9, 0.92, 0.95);

  const nomorBA = resolveNomorBA(data.nomorBeritaAcara, data.tanggalPenyerahan);

  // =========================================================================
  // HALAMAN 1: BERITA ACARA
  // =========================================================================
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - 44;

  // -------------------------------------------------------------------------
  // 1. LOGO PLN BATAM (Center Horizontal)
  // -------------------------------------------------------------------------
  const embeddedLogo = await tryEmbedLogo(pdfDoc);
  if (embeddedLogo) {
    const logoHeight = 44;
    const logoWidth = (embeddedLogo.width / embeddedLogo.height) * logoHeight;
    const logoX = (pageWidth - logoWidth) / 2;

    page1.drawImage(embeddedLogo, {
      x: logoX,
      y: cursorY - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    cursorY -= logoHeight + 18;
  } else {
    const logoText = "PLN Batam";
    const lw = fontBold.widthOfTextAtSize(logoText, 14);
    page1.drawText(logoText, {
      x: (pageWidth - lw) / 2,
      y: cursorY - 14,
      size: 14,
      font: fontBold,
      color: black,
    });
    cursorY -= 24;
  }

  // -------------------------------------------------------------------------
  // 2. JUDUL: "BERITA ACARA" (Center, Bold, Underlined, Times New Roman)
  // -------------------------------------------------------------------------
  const titleText = "BERITA ACARA";
  const titleSize = 12;
  const titleWidth = fontBold.widthOfTextAtSize(titleText, titleSize);
  const titleX = (pageWidth - titleWidth) / 2;
  page1.drawText(titleText, {
    x: titleX,
    y: cursorY,
    size: titleSize,
    font: fontBold,
    color: black,
  });
  page1.drawLine({
    start: { x: titleX, y: cursorY - 2 },
    end: { x: titleX + titleWidth, y: cursorY - 2 },
    thickness: 0.8,
    color: black,
  });
  cursorY -= 22;

  // -------------------------------------------------------------------------
  // 4. NOMOR: "Nomor : ......./BA/DD-MM-YYYY" (Center, Regular)
  // -------------------------------------------------------------------------
  const nomorText = `Nomor : ${nomorBA}`;
  const nomorSize = 10;
  const nomorWidth = fontRegular.widthOfTextAtSize(nomorText, nomorSize);
  page1.drawText(nomorText, {
    x: (pageWidth - nomorWidth) / 2,
    y: cursorY,
    size: nomorSize,
    font: fontRegular,
    color: black,
  });
  cursorY -= 42;

  // -------------------------------------------------------------------------
  // TIPOGRAFI & SPACING BODY
  // -------------------------------------------------------------------------
  const bodySize = 10;
  const bodyLineH = 14;
  const sectionGap = 8;

  // -------------------------------------------------------------------------
  // 5. PARAGRAF PEMBUKA
  // -------------------------------------------------------------------------
  const tgl = data.tanggalPenyerahan;
  const hariStr = HARI_NAMES[tgl.getDay()] || "—";
  const tglStr = String(tgl.getDate()).padStart(2, "0");
  const blnStr = BULAN_NAMES[tgl.getMonth()] || "—";
  const thnStr = String(tgl.getFullYear());

  const pembukaText = `Pada hari ini, ${hariStr} Tanggal ${tglStr} Bulan ${blnStr} tahun ${thnStr} yang bertanda tangan dibawah ini:`;
  cursorY = drawParagraph(
    page1,
    pembukaText,
    marginLeft,
    cursorY,
    contentWidth,
    fontRegular,
    bodySize,
    bodyLineH,
  );
  cursorY -= 20;

  // -------------------------------------------------------------------------
  // 6. HELPER IDENTITAS PIHAK (Indent, Rata Kiri, Posisi Titik Dua Sejajar)
  // -------------------------------------------------------------------------
  const identIndent = 35;
  const labelWidth = 60;
  const colonX = marginLeft + identIndent + labelWidth;
  const valueX = colonX + 12;
  const valueMaxW = contentWidth - identIndent - labelWidth - 12;

  const drawIdentRow = (label: string, value: string, marker = "") => {
    const fullVal = value ? `${value}${marker}` : `............${marker}`;
    const lines = wrapText(fullVal, valueMaxW, fontRegular, bodySize);

    page1.drawText(label, {
      x: marginLeft + identIndent,
      y: cursorY,
      size: bodySize,
      font: fontRegular,
      color: black,
    });
    page1.drawText(":", {
      x: colonX,
      y: cursorY,
      size: bodySize,
      font: fontRegular,
      color: black,
    });

    for (let i = 0; i < lines.length; i++) {
      page1.drawText(lines[i], {
        x: valueX,
        y: cursorY - i * bodyLineH,
        size: bodySize,
        font: fontRegular,
        color: black,
      });
    }
    cursorY -= lines.length * bodyLineH + 3;
  };

  // -------------------------------------------------------------------------
  // 7. IDENTITAS PIHAK PERTAMA (Nama User dan Divisi asal dari database)
  // -------------------------------------------------------------------------
  const namaP1 = sanitizeText(data.pihakPertama.nama);
  const rawUnitP1 = sanitizeText(data.pihakPertama.unit);
  drawIdentRow("Nama", namaP1, " ****)");
  drawIdentRow("Divisi", rawUnitP1, " ***)");
  // Beri jeda visual antara identitas penyerah dan uraian perannya.
  cursorY -= sectionGap + bodyLineH + 2;

  // -------------------------------------------------------------------------
  // 8. PARAGRAF PIHAK PERTAMA (menggunakan nama pengguna penyerah)
  // -------------------------------------------------------------------------
  const p1Text = `Dalam hal ini bertindak untuk dan atas nama ${namaP1 || "[Nama user belum tersedia]"} sebagai pihak yang menyerahkan arsip, yang selanjutnya disebut PIHAK PERTAMA.`;
  cursorY = drawParagraph(
    page1,
    p1Text,
    marginLeft,
    cursorY,
    contentWidth,
    fontRegular,
    bodySize,
    bodyLineH,
  );
  cursorY -= 20;

  // -------------------------------------------------------------------------
  // 9. IDENTITAS PIHAK KEDUA (Kosong pada tahap User, siap diisi Admin)
  // -------------------------------------------------------------------------
  const namaP2 = sanitizeText(data.pihakKedua?.nama);
  const unitP2 = sanitizeText(data.pihakKedua?.unit);

  drawIdentRow("Nama", namaP2, " **)");
  drawIdentRow("Divisi", unitP2, " *)");
  // Mengurangi sedikit ruang sebelum uraian, tetap menyisakan kompensasi baris identitas.
  cursorY -= sectionGap - 5 + bodyLineH + 3;

  // -------------------------------------------------------------------------
  // 10. PARAGRAF PIHAK KEDUA
  // -------------------------------------------------------------------------
  const p2Text = "Dalam hal ini bertindak sebagai pihak yang menerima arsip, yang selanjutnya disebut PIHAK KEDUA.";
  cursorY = drawParagraph(
    page1,
    p2Text,
    marginLeft,
    cursorY,
    contentWidth,
    fontRegular,
    bodySize,
    bodyLineH,
  );
  // Sisakan ruang yang cukup sebelum paragraf serah terima.
  cursorY -= sectionGap + bodyLineH - 4;

  // -------------------------------------------------------------------------
  // 11. PARAGRAF PENYERAHAN (lokasi dari detail arsip)
  // -------------------------------------------------------------------------
  const serahText = "PIHAK PERTAMA menyerahkan arsip-arsip sebagaimana tercantum dalam Daftar Arsip Terlampir kepada PIHAK KEDUA, dan PIHAK KEDUA menerima arsip-arsip tersebut untuk dikelola dan disimpan sesuai lokasi penyimpanan yang tercantum dalam Daftar Arsip Terlampir.";
  cursorY = drawParagraph(
    page1,
    serahText,
    marginLeft,
    cursorY,
    contentWidth,
    fontRegular,
    bodySize,
    bodyLineH,
  );
  cursorY -= sectionGap;

  // -------------------------------------------------------------------------
  // 12. PENUTUP
  // -------------------------------------------------------------------------
  const tutupText = "Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya.";
  cursorY = drawParagraph(
    page1,
    tutupText,
    marginLeft,
    cursorY,
    contentWidth,
    fontRegular,
    bodySize,
    bodyLineH,
  );
  // Jarak menuju tanda tangan dirapatkan sedikit setelah isi berita acara dipadatkan.
  cursorY -= 32;

  // -------------------------------------------------------------------------
  // 13. TANDA TANGAN (Dua Kolom Simetris Seimbang)
  // -------------------------------------------------------------------------
  const fnSize = 8.5;
  const fnLineH = 11.5;
  const footnotes = [
    { marker: "*)", desc: "Diisi Satuan Kerja yang mengelola fungsi Kearsipan" },
    { marker: "**)", desc: "Nama dan Jabatan Satuan yang mengelola fungsi Kearsipan" },
    { marker: "***)", desc: "Diisi Satuan Kerja yang menciptakan Arsip" },
    { marker: "****)", desc: "Nama dan Jabatan Satuan Kerja yang menciptakan Arsip" },
  ];
  const ttdColWidth = contentWidth / 2;
  const ttdLeftX = marginLeft;
  const ttdRightX = marginLeft + ttdColWidth;
  const leftCenterX = ttdLeftX + ttdColWidth / 2;
  const rightCenterX = ttdRightX + ttdColWidth / 2;
  const drawCentered = (page: PDFPage, text: string, centerX: number, y: number) => {
    const textWidth = fontRegular.widthOfTextAtSize(text, bodySize);
    page.drawText(text, {
      x: centerX - textWidth / 2,
      y,
      size: bodySize,
      font: fontRegular,
      color: black,
    });
  };

  // Garis tanda tangan / Nama
  const namaP2Sign = namaP2 ? `( ${namaP2} )` : "( ........................ )";
  const namaP1Sign = `( ${namaP1} )`;

  const signColMaxW = ttdColWidth - 10;
  const p2SignLines = wrapText(namaP2Sign, signColMaxW, fontRegular, bodySize);
  const p1SignLines = wrapText(namaP1Sign, signColMaxW, fontRegular, bodySize);
  const maxSignLines = Math.max(p2SignLines.length, p1SignLines.length);
  const markerWidth = 24;
  const footnoteHeight = footnotes.reduce((height, fn) => {
    const lineCount = wrapText(fn.desc, contentWidth - markerWidth, fontRegular, fnSize).length;
    return height + lineCount * fnLineH + 1;
  }, fnLineH + 2);
  const signatureAndNotesHeight = 68 + maxSignLines * bodyLineH + 26 + footnoteHeight;
  let signingPage = page1;
  if (cursorY - signatureAndNotesHeight < 48) {
    signingPage = pdfDoc.addPage([pageWidth, pageHeight]);
    const continuationTitle = "BERITA ACARA (LANJUTAN)";
    const titleWidth = fontBold.widthOfTextAtSize(continuationTitle, 10);
    signingPage.drawText(continuationTitle, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 52,
      size: 10,
      font: fontBold,
      color: black,
    });
    cursorY = pageHeight - 86;
  }

  drawCentered(signingPage, "PIHAK KEDUA,", leftCenterX, cursorY);
  drawCentered(signingPage, "PIHAK PERTAMA,", rightCenterX, cursorY);
  cursorY -= 68; // Ruang tanda tangan manual

  const drawSignatureName = (lines: string[], centerX: number) => {
    for (let i = 0; i < lines.length; i++) {
      const lineWidth = fontRegular.widthOfTextAtSize(lines[i], bodySize);
      signingPage.drawText(lines[i], {
        x: centerX - lineWidth / 2,
        y: cursorY - i * bodyLineH,
        size: bodySize,
        font: fontRegular,
        color: black,
      });
    }
  };
  drawSignatureName(p2SignLines, leftCenterX);
  drawSignatureName(p1SignLines, rightCenterX);

  cursorY -= maxSignLines * bodyLineH + 26;

  // -------------------------------------------------------------------------
  // 14. FOOTNOTE / KETERANGAN
  // -------------------------------------------------------------------------
  signingPage.drawText("Keterangan:", {
    x: marginLeft,
    y: cursorY,
    size: fnSize,
    font: fontRegular,
    color: black,
  });
  cursorY -= fnLineH + 2;

  for (const fn of footnotes) {
    signingPage.drawText(fn.marker, {
      x: marginLeft + 2,
      y: cursorY,
      size: fnSize,
      font: fontRegular,
      color: black,
    });
    const descLines = wrapText(
      fn.desc,
      contentWidth - markerWidth,
      fontRegular,
      fnSize,
    );
    for (let i = 0; i < descLines.length; i++) {
      signingPage.drawText(descLines[i], {
        x: marginLeft + markerWidth,
        y: cursorY - i * fnLineH,
        size: fnSize,
        font: fontRegular,
        color: black,
      });
    }
    cursorY -= descLines.length * fnLineH + 1;
  }

  // =========================================================================
  // HALAMAN 2 DST: DAFTAR ARSIP TERLAMPIR
  // =========================================================================
  const tableMarginLeft = 30;
  const tableMarginRight = 30;
  const tableContentW = pageWidth - tableMarginLeft - tableMarginRight; // 535.28 pt
  const tableBottomMargin = 40;

  // Definisi Kolom Tabel (total disesuaikan dengan lebar area tabel)
  const columns = [
    { title: "No.",                width: 24,  align: "center" as const },
    { title: "Kode Klas.",         width: 54,  align: "left" as const   },
    { title: "Nama / Judul Arsip", width: 120, align: "left" as const   },
    { title: "Jml",                width: 24,  align: "center" as const },
    { title: "Satuan",             width: 36,  align: "left" as const   },
    { title: "Penulis / Pengirim", width: 75,  align: "left" as const   },
    { title: "Kurun Waktu",        width: 48,  align: "left" as const   },
    { title: "Tgl Arsip",          width: 52,  align: "left" as const   },
    { title: "Keaslian",           width: 48,  align: "left" as const   },
    { title: "Lokasi",             width: 58,  align: "left" as const   },
  ];

  const sumCols = columns.reduce((acc, col) => acc + col.width, 0);
  columns[columns.length - 1].width += tableContentW - sumCols;

  const tblTitleSize = 11;
  const tblSubSize = 8.5;
  const tblHdrSize = 7.5;
  const tblRowSize = 7.5;
  const tblLineH = 9.5;
  const tblPadV = 4;

  const drawTablePageHeader = (page: PDFPage, startY: number): number => {
    // Judul lampiran
    const lampTitle = "DAFTAR ARSIP TERLAMPIR";
    const ltw = fontBold.widthOfTextAtSize(lampTitle, tblTitleSize);
    page.drawText(lampTitle, {
      x: (pageWidth - ltw) / 2,
      y: startY,
      size: tblTitleSize,
      font: fontBold,
      color: black,
    });

    // Sub-judul: Lampiran Berita Acara Nomor: ......./BA/DD-MM-YYYY
    const lampSub = `Lampiran Berita Acara Nomor: ${nomorBA}`;
    const lsw = fontRegular.widthOfTextAtSize(lampSub, tblSubSize);
    page.drawText(lampSub, {
      x: (pageWidth - lsw) / 2,
      y: startY - 14,
      size: tblSubSize,
      font: fontRegular,
      color: darkGray,
    });

    // Header tabel
    const hdrH = 26;
    const hdrTopY = startY - 36;
    const hdrBotY = hdrTopY - hdrH;

    page.drawRectangle({
      x: tableMarginLeft,
      y: hdrBotY,
      width: tableContentW,
      height: hdrH,
      color: tableHeaderBg,
      borderColor: lineGray,
      borderWidth: 0.75,
    });

    let curX = tableMarginLeft;
    for (const col of columns) {
      const headerLines = wrapText(col.title, col.width - 6, fontBold, tblHdrSize);
      const headerLineHeight = 8.5;
      const headerStartY = hdrBotY + (hdrH + (headerLines.length - 1) * headerLineHeight) / 2 - tblHdrSize;
      headerLines.forEach((line, lineIndex) => {
        const lineWidth = fontBold.widthOfTextAtSize(line, tblHdrSize);
        const tx = col.align === "center" ? curX + (col.width - lineWidth) / 2 : curX + 3;
        page.drawText(line, {
          x: tx,
          y: headerStartY - lineIndex * headerLineHeight,
          size: tblHdrSize,
          font: fontBold,
          color: black,
        });
      });

      page.drawLine({
        start: { x: curX, y: hdrBotY },
        end: { x: curX, y: hdrTopY },
        thickness: 0.75,
        color: lineGray,
      });

      curX += col.width;
    }

    page.drawLine({
      start: { x: curX, y: hdrBotY },
      end: { x: curX, y: hdrTopY },
      thickness: 0.75,
      color: lineGray,
    });

    return hdrBotY;
  };

  let tablePage: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let tableCursorY = pageHeight - 44;
  tableCursorY = drawTablePageHeader(tablePage, tableCursorY);

  for (const item of data.details) {
    const colTexts = [
      String(item.no),
      item.kodeKlasifikasi || "-",
      item.namaArsip || "-",
      String(item.jumlah || 1),
      item.satuan || "Berkas",
      item.penulis || "-",
      item.kurunWaktu || "-",
      item.tanggalArsip || "-",
      item.tingkatKeaslian || "Asli",
      item.lokasiPenyimpanan || "-",
    ];

    const innerPad = 5;
    const wrappedCols = colTexts.map((text, idx) =>
      wrapText(text, columns[idx].width - innerPad, fontRegular, tblRowSize),
    );

    const maxLines = Math.max(...wrappedCols.map((w) => w.length), 1);
    const rowH = Math.max(maxLines * tblLineH + tblPadV * 2, 17);

    if (tableCursorY - rowH < tableBottomMargin) {
      tablePage = pdfDoc.addPage([pageWidth, pageHeight]);
      tableCursorY = pageHeight - 44;
      tableCursorY = drawTablePageHeader(tablePage, tableCursorY);
    }

    const rowTopY = tableCursorY;
    const rowBotY = rowTopY - rowH;

    tablePage.drawRectangle({
      x: tableMarginLeft,
      y: rowBotY,
      width: tableContentW,
      height: rowH,
      color: item.no % 2 === 0 ? rgb(0.965, 0.965, 0.975) : rgb(1, 1, 1),
      borderColor: lineGray,
      borderWidth: 0.5,
    });

    let curX = tableMarginLeft;
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const lines = wrappedCols[c];
      const firstY = rowTopY - tblPadV - tblRowSize;

      for (let l = 0; l < lines.length; l++) {
        const lw = fontRegular.widthOfTextAtSize(lines[l], tblRowSize);
        const dx =
          col.align === "center"
            ? curX + (col.width - lw) / 2
            : curX + 3;

        tablePage.drawText(lines[l], {
          x: dx,
          y: firstY - l * tblLineH,
          size: tblRowSize,
          font: fontRegular,
          color: black,
        });
      }

      tablePage.drawLine({
        start: { x: curX, y: rowBotY },
        end: { x: curX, y: rowTopY },
        thickness: 0.5,
        color: lineGray,
      });

      curX += col.width;
    }

    tablePage.drawLine({
      start: { x: curX, y: rowBotY },
      end: { x: curX, y: rowTopY },
      thickness: 0.5,
      color: lineGray,
    });

    tableCursorY = rowBotY;
  }

  tablePage.drawLine({
    start: { x: tableMarginLeft, y: tableCursorY },
    end: { x: tableMarginLeft + tableContentW, y: tableCursorY },
    thickness: 0.75,
    color: lineGray,
  });

  tablePage.drawText(`Total: ${data.details.length} berkas arsip terlampir.`, {
    x: tableMarginLeft,
    y: Math.max(tableCursorY - 14, tableBottomMargin),
    size: 8,
    font: fontItalic,
    color: midGray,
  });

  return await pdfDoc.save();
}
