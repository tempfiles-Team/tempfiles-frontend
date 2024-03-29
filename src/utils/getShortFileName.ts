const getFileFullName = (fileName: string) => {
  let lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    lastDot = fileName.length;
  }
  const fileFullName = fileName.substring(0, lastDot);
  return fileFullName;
};

const getFileExtension = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.');
  const fileLength = fileName.length;
  const fileExtension = fileName.substring(lastDot + 1, fileLength);
  if (lastDot === -1) {
    return '';
  }
  return '.' + fileExtension;
};

export const getShortFileName = (fileName: string) => {
  const fileFullName = getFileFullName(fileName);
  if (fileFullName.length >= 9) {
    return (
      fileFullName.substring(0, 4) +
      '(...)' +
      fileFullName.substring(fileFullName.length - 5, fileFullName.length) +
      getFileExtension(fileName)
    );
  }
  return fileName;
};
