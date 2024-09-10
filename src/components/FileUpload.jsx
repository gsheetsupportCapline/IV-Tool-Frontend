import React, { useState } from 'react';

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    // Handle file selection
    const onFileChange = event => {
        setSelectedFile(event.target.files[0]);
    };

    // Handle file upload
    const onFileUpload = () => {
        const formData = new FormData();
        formData.append(
            "myFile",
            selectedFile,
            selectedFile.name
        );

        // Send the form data to the backend
        fetch('http://yourbackendendpoint.com/upload', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                console.log('File uploaded successfully!');
            } else {
                console.error('File upload failed.');
            }
        }).catch(error => {
            console.error('Error uploading file:', error);
        });
    };

    return (
        <div>
            <h2>File Upload</h2>
            <input type="file" onChange={onFileChange} />
            <button onClick={onFileUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
