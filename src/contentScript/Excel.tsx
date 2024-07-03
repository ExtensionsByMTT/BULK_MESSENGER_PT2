import React, { useState } from "react";
import ReactDOM from "react-dom";
import * as XLSX from "xlsx";

const App: React.FC<{}> = () => {
  const [data, setData] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const parsedData: any[] = XLSX?.utils?.sheet_to_json(sheet, {
            header: 1,
          });
          const headers = parsedData[0];
          const countryIndex = headers?.indexOf("Country");
          const countryData = parsedData
            .slice(1)
            .filter((row) => row[countryIndex])
            .map((row) => ({
              Country: row[countryIndex],
            }));

          setData(countryData);
        }
      };
    }
  };

  const handleFileDownload = () => {
    const worksheet = XLSX?.utils?.json_to_sheet(data);
    const workbook = XLSX?.utils?.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Countries.xlsx");
  };

  return (
    <div className="App">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {data.length > 0 && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.Country}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleFileDownload}>Download Excel</button>
        </>
      )}
    </div>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
