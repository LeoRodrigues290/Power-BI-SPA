import * as XLSX from 'xlsx';

export interface DefectData {
    name: string;
    value: number;
}

export interface SheetData {
    sheetName: string;
    data: DefectData[];
    sheetTotal: number;
}

export interface ProcessedProjectData {
    totalFailures: number;
    sheets: SheetData[];
}

export const processExcelFile = async (file: File): Promise<ProcessedProjectData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                const processedSheets: SheetData[] = [];
                let grandTotal = 0;

                // Iterate through each sheet
                workbook.SheetNames.forEach((sheetName) => {
                    // Skip internal or hidden sheets if necessary (add logic here if needed)
                    const worksheet = workbook.Sheets[sheetName];

                    // Convert sheet to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const cleanData: DefectData[] = jsonData.map((row: any) => {
                        // Flexible column matching
                        const qtd = row['QTD falhas'] || row['Qtd'] || row['QTD'] || row['Total'] || 0;
                        const defectName = row['Defeitos'] || row['Defeito'] || row['Nome'] || 'Não especificado';

                        return {
                            name: String(defectName).trim(),
                            value: Number(qtd) || 0
                        };
                    }).filter(item => item.value > 0); // Remove items with 0 failures

                    const sheetTotal = cleanData.reduce((acc, curr) => acc + curr.value, 0);
                    grandTotal += sheetTotal;

                    if (cleanData.length > 0) {
                        processedSheets.push({
                            sheetName,
                            data: cleanData,
                            sheetTotal
                        });
                    }
                });

                resolve({ sheets: processedSheets, totalFailures: grandTotal });

            } catch (error) {
                console.error("Error processing Excel:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};
