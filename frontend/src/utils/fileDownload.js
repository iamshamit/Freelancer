/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for the download
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Download text content as a file
 * @param {string} content - The text content
 * @param {string} filename - The filename for the download
 * @param {string} mimeType - The MIME type
 */
export const downloadText = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
};

/**
 * Format date for filename
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateForFilename = (date = new Date()) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};