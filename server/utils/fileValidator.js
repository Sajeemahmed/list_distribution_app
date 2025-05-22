const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Validate CSV file
const validateCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const requiredFields = ['firstName', 'phone', 'notes'];
    let hasErrors = false;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        // Convert headers to lowercase for case-insensitive comparison
        const lowercaseHeaders = headers.map(h => h.toLowerCase());
        
        // Check if all required fields exist (case-insensitive)
        for (const field of requiredFields) {
          if (!lowercaseHeaders.includes(field.toLowerCase())) {
            hasErrors = true;
            reject(`Missing required field: ${field}`);
          }
        }
      })
      .on('data', (data) => {
        // Normalize field names to match our schema
        const item = {
          firstName: data.FirstName || data.firstname || data.FIRSTNAME,
          phone: data.Phone || data.phone || data.PHONE,
          notes: data.Notes || data.notes || data.NOTES || ''
        };
        
        // Basic validation
        if (!item.firstName || !item.phone) {
          hasErrors = true;
          reject('Each row must contain firstName and phone');
        }
        
        results.push(item);
      })
      .on('end', () => {
        if (!hasErrors) {
          resolve(results);
        }
      })
      .on('error', (error) => {
        reject(`Error processing CSV: ${error.message}`);
      });
  });
};

// Validate Excel file (xlsx, xls)
const validateExcelFile = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Read the Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      let data = xlsx.utils.sheet_to_json(sheet);
      
      // Check if file is empty
      if (data.length === 0) {
        reject('Excel file is empty');
        return;
      }
      
      // Check headers (first row)
      const firstRow = data[0];
      const headers = Object.keys(firstRow);
      const lowercaseHeaders = headers.map(h => h.toLowerCase());
      
      // Check for required fields
      const requiredFields = ['firstname', 'phone', 'notes'];
      for (const field of requiredFields) {
        if (!lowercaseHeaders.some(h => h.toLowerCase() === field)) {
          reject(`Missing required field: ${field}`);
          return;
        }
      }
      
      // Normalize field names to match our schema
      const normalizedData = data.map(row => {
        // Find the actual header names in the original case
        const firstNameKey = headers.find(h => h.toLowerCase() === 'firstname');
        const phoneKey = headers.find(h => h.toLowerCase() === 'phone');
        const notesKey = headers.find(h => h.toLowerCase() === 'notes');
        
        return {
          firstName: row[firstNameKey],
          phone: row[phoneKey],
          notes: row[notesKey] || ''
        };
      });
      
      // Validate each row
      for (let i = 0; i < normalizedData.length; i++) {
        if (!normalizedData[i].firstName || !normalizedData[i].phone) {
          reject(`Row ${i + 2} is missing firstName or phone`);
          return;
        }
      }
      
      resolve(normalizedData);
    } catch (error) {
      reject(`Error processing Excel file: ${error.message}`);
    }
  });
};

// Process file based on extension
const processFile = async (filePath) => {
  const fileExt = path.extname(filePath).toLowerCase();
  
  try {
    if (fileExt === '.csv') {
      return await validateCsvFile(filePath);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      return await validateExcelFile(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  processFile
};