interface SentenceRow {
  recordingName: string;
  english: string;
  spanish: string;
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function generateCSV(rows: SentenceRow[]): string {
  const header = 'Recording Name,English,Spanish';
  const dataRows = rows.map(
    (row) =>
      `${escapeCSVField(row.recordingName)},${escapeCSVField(row.english)},${escapeCSVField(row.spanish)}`
  );
  return [header, ...dataRows].join('\n');
}

export function downloadCSV(rows: SentenceRow[], filename: string = 'spanish-sentences.csv') {
  const csvContent = generateCSV(rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
