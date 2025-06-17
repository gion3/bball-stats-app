import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename) => {
    // Convert data to CSV string
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Handle special cases (numbers, strings with commas, etc.)
                if (typeof value === 'number') return value;
                if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToExcel = (data, filename) => {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Player Stats');

    // Generate and download file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}; 