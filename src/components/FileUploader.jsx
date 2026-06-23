import React, { useState } from 'react';
import './FileUploader.css';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection from input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  // Validate file
  const validateAndSetFile = (selectedFile) => {
    setError(null);
    
    if (!selectedFile) {
      return;
    }

    // Check if file is text file (CSV, TXT, JSON)
    const allowedTypes = ['text/plain', 'text/csv', 'application/json'];
    const allowedExtensions = ['.csv', '.txt', '.json'];
    
    const isValidType = allowedTypes.includes(selectedFile.type);
    const isValidExtension = allowedExtensions.some(ext => 
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!isValidType && !isValidExtension) {
      setError('Please upload a text file (CSV, TXT, or JSON)');
      return;
    }

    // Check file size (limit to 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
  };

  // Handle file upload
  const handleUpload = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const fileName = file.name;
        const fileType = file.type || 'text/plain';
        const fileSize = (file.size / 1024).toFixed(2);

        // Parse based on file type
        let parsedData = null;
        if (fileName.endsWith('.json')) {
          parsedData = JSON.parse(content);
        } else if (fileName.endsWith('.csv')) {
          parsedData = parseCSV(content);
        } else {
          parsedData = {
            type: 'text',
            content: content,
            lines: content.split('\n').length
          };
        }

        setUploadedData({
          fileName,
          fileType,
          fileSize,
          content: parsedData
        });
        setError(null);
      } catch (err) {
        setError('Error parsing file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  // Parse CSV content
  const parseCSV = (csv) => {
    const lines = csv.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(val => val.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return {
      type: 'csv',
      headers,
      data,
      rowCount: data.length
    };
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setUploadedData(null);
    setError(null);
  };

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <div className="upload-header">
          <h2>Upload Text File</h2>
          <p>Upload your CSV, TXT, or JSON file</p>
        </div>

        {!uploadedData ? (
          <div className="upload-section">
            {/* Drop Zone */}
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="drop-text">Drag and drop your file here</p>
                <p className="drop-subtext">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleFileChange}
                className="file-input"
                id="file-input"
              />
            </div>

            {/* File Info */}
            {file && (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">({(file.size / 1024).toFixed(2)} KB)</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="button-group">
              <button
                className="btn btn-upload"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
              {file && (
                <button
                  className="btn btn-clear"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {/* File Types Info */}
            <div className="file-types-info">
              <p><strong>Supported formats:</strong> CSV, TXT, JSON</p>
              <p><strong>Max file size:</strong> 50 MB</p>
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="success-message">
              <svg className="success-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              File uploaded successfully!
            </div>

            {/* File Details */}
            <div className="file-details-card">
              <h3>File Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>File Name:</label>
                  <p>{uploadedData.fileName}</p>
                </div>
                <div className="detail-item">
                  <label>File Size:</label>
                  <p>{uploadedData.fileSize} KB</p>
                </div>
                <div className="detail-item">
                  <label>File Type:</label>
                  <p>{uploadedData.fileType || 'Text File'}</p>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            {uploadedData.content.type === 'csv' && (
              <div className="preview-section">
                <h3>Data Preview</h3>
                <div className="csv-stats">
                  <p><strong>Rows:</strong> {uploadedData.content.rowCount}</p>
                  <p><strong>Columns:</strong> {uploadedData.content.headers.length}</p>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {uploadedData.content.headers.map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedData.content.data.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {uploadedData.content.headers.map((header, colIndex) => (
                            <td key={colIndex}>{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {uploadedData.content.rowCount > 5 && (
                  <p className="preview-note">
                    Showing first 5 of {uploadedData.content.rowCount} rows
                  </p>
                )}
              </div>
            )}

            {uploadedData.content.type === 'text' && (
              <div className="preview-section">
                <h3>Text Content Preview</h3>
                <div className="text-stats">
                  <p><strong>Total Lines:</strong> {uploadedData.content.lines}</p>
                </div>
                <pre className="text-preview">
                  {uploadedData.content.content.substring(0, 500)}
                  {uploadedData.content.content.length > 500 && '...'}
                </pre>
              </div>
            )}

            {uploadedData.content.type === 'object' && (
              <div className="preview-section">
                <h3>JSON Content Preview</h3>
                <pre className="json-preview">
                  {JSON.stringify(uploadedData.content, null, 2).substring(0, 500)}
                  ...
                </pre>
              </div>
            )}

            {/* Action Button */}
            <button
              className="btn btn-upload"
              onClick={handleReset}
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;