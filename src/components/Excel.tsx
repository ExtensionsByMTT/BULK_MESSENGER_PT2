import React from "react";
import * as XLSX from "xlsx";

export const handleFileUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (data: string[]) => void
) => {
  const reader = new FileReader();
  const file = e.target.files ? e.target.files[0] : null;

  if (file) {
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (binaryStr) {
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });
        const headers = parsedData[0];
        const userIdsIndex = headers?.indexOf("sent_to");

        if (userIdsIndex !== undefined) {
          const userIdsData = parsedData
            .slice(1)
            .filter((row) => row[userIdsIndex])
            .map((row) => ({
              userIds: row[userIdsIndex].trim(),
            }));

          const ids = userIdsData.map((id) => id.userIds);
          callback(ids);
        }
      }
    };
  }
};

export const handleFileDownload = (data, agentName) => {
  const worksheet = XLSX?.utils?.json_to_sheet(data);
  const workbook = XLSX?.utils?.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${agentName}.xlsx`);
};
