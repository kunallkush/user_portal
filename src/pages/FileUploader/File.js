import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
  Spinner,
} from "reactstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Dropzone from "react-dropzone";
import "./file.css";
const File = () => {
  const [selectedFiles, setselectedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [chunk, setChunk] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [check, setCheck] = useState(false);
  const [loading, setLoading] = useState(true);
  const folder_name = Date.now();
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  function handleAcceptedFiles(files) {
    if (files && files.length > 0 && files[0]["type"] == "text/csv") {
      files.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: formatBytes(file.size),
        })
      );
      setselectedFiles(files);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Only CSV format type supported.",
      });
    }
  }
  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      const fileSize = selectedFiles[0].size;
      const chunkSize = 50 * 1024 * 1024; // 50MB
      const totalChunks = Math.ceil(fileSize / chunkSize);
      const filenames = [];
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, fileSize);
        const chunk = selectedFiles[0].slice(start, end);
        const uniqueFilename = generateUniqueFilename(
          selectedFiles[0].name,
          chunkIndex
        );
        filenames.push({ filename: uniqueFilename, size: chunk.size });
      }
      setChunk(filenames);
    }
  }, [selectedFiles]);

  const generateUniqueFilename = (originalFilename, chunkIndex) => {
    const fileExtension = originalFilename.split(".").pop(); // Get the file extension
    return `${originalFilename}_${chunkIndex}.${fileExtension}`;
  };
  const uploadChunk = (chunk, chunkIndex, totalChunks, uniqueFilename) => {
    // const formData = new FormData();
    // formData.append("file", chunk);
    // formData.append("chunkIndex", chunkIndex);
    // formData.append("totalChunks", totalChunks);
    // formData.append("uniqueFilename", uniqueFilename);
    // formData.append("folderName", folder_name);

    // // Create the fetch options
    // const fetchOptions = {
    //   method: "POST",
    //   body: formData,
    //   // credentials: "include", // Equivalent to withCredentials: true
    // };

    // // Replace this with your server endpoint for handling file chunks
    // fetch("https://demo.crmexperts.in/file_upload/index.php", fetchOptions)
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }
    //     const contentLength = response.headers.get("content-length");
    //     if (!contentLength) {
    //       throw new Error("Content-Length header is missing in the response");
    //     }

    //     // Create a ReadableStream from the response body
    //     const reader = response.body.getReader();
    //     let loaded = 0;
    //     const total = parseInt(contentLength, 10);

    //     // Process the response data and calculate progress
    //     function processResponse({ done, value }) {
    //       if (done) {
    //         // Finished processing
    //         return;
    //       }

    //       loaded += value.length;
    //       const progressPercentage = Math.round((loaded * 100) / total);

    //       // Update progress using the progressPercentage
    //       setProgress(progressPercentage);
    //       setChunks((prevChunks) =>
    //         prevChunks.map((chunk, index) =>
    //           index === chunkIndex
    //             ? { ...chunk, progress: progressPercentage }
    //             : chunk
    //         )
    //       );

    //       // Continue processing the response data
    //       return reader.read().then(`processResponse`);
    //     }

    //     // Start processing the response data
    //     reader.read().then(processResponse);
    //   })
    //   .catch((error) => {
    //     // Handle errors
    //   });
    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("chunkIndex", chunkIndex);
    formData.append("totalChunks", totalChunks);
    formData.append("uniqueFilename", uniqueFilename);
    formData.append("folderName", folder_name);
    formData.append("fileSize", selectedFiles && selectedFiles[0]["size"]);
    // You can replace this with your server endpoint for handling file chunks
    axios
      .post("https://demo.crmexperts.in/fileupload/index.php", formData, {
        onUploadProgress: (progressEvent) => {
          const progressPercentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(progressPercentage);
          setChunks((prevChunks) =>
            prevChunks.map((chunk, index) =>
              index === chunkIndex
                ? { ...chunk, progress: progressPercentage }
                : chunk
            )
          );
        },
      })
      .then((response) => {
        if (response.lastupload == true) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: "Successfully Uploaded",
          });
        }
        // console.log(response);
        // setUploading(true)
      })
      .catch((error) => {
        // console.log(error);
      });
  };
  // const startUpload = () => {
  //   setUploading(true);
  //   if (selectedFiles && selectedFiles.length > 0) {
  //     const fileSize = selectedFiles[0].size;
  //     const chunkSize = 50 * 1024 * 1024; // 50MB
  //     const totalChunks = Math.ceil(fileSize / chunkSize);
  //     setTotalChunks(totalChunks);
  //     // setChunks(
  //     //   Array.from({ length: totalChunks }, (_, index) => ({
  //     //     filename: generateUniqueFilename(selectedFiles[0].name, index),
  //     //     progress: 0,
  //     //   }))
  //     // );
  //     setChunks(
  //       Array.from({ length: totalChunks }, (_, index) => {
  //         const chunk = selectedFiles[0].slice(
  //           index * chunkSize,
  //           Math.min((index + 1) * chunkSize, fileSize)
  //         );
  //         return {
  //           filename: generateUniqueFilename(selectedFiles[0].name, index),
  //           progress: 0,
  //           size: chunk.size,
  //         };
  //       })
  //     );

  //     for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
  //       const start = chunkIndex * chunkSize;
  //       const end = Math.min(start + chunkSize, fileSize);
  //       const chunk = selectedFiles[0].slice(start, end);

  //       const uniqueFilename = generateUniqueFilename(
  //         selectedFiles[0].name,
  //         chunkIndex
  //       );
  //       uploadChunk(chunk, chunkIndex, totalChunks, uniqueFilename);
  //       // saveChunkLocally(chunk,chunkIndex,uniqueFilename)
  //     }
  //   }
  // };
  // const startUpload = () => {
  //   setUploading(true);
  //   if (selectedFiles && selectedFiles.length > 0) {
  //     const fileSize = selectedFiles[0].size;
  //     const chunkSize = 50 * 1024 * 1024; // 50MB
  //     const totalChunks = Math.ceil(fileSize / chunkSize);
  //     setTotalChunks(totalChunks);

  //     // Read the selected file as a Blob
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       const fileContent = event.target.result; // The content of the entire file
  //       const textDecoder = new TextDecoder('utf-8');
  //       const fileContentString = textDecoder.decode(fileContent);
  //       const lines = fileContentString.split('\n');
  //       const header = lines[0]; // Assuming the first line is the header

  //       setChunks(
  //         Array.from({ length: totalChunks }, (_, index) => {
  //           const start = index * chunkSize;
  //           const end = Math.min((index + 1) * chunkSize, fileSize);
  //           const chunk = selectedFiles[0].slice(start, end);
  //           const uniqueFilename = generateUniqueFilename(selectedFiles[0].name, index);

  //           // Prepend the header to the chunk
  //           const chunkWithHeader = new Blob([header, '\n', chunk], { type: selectedFiles[0].type });

  //           return {
  //             filename: uniqueFilename,
  //             progress: 0,
  //             size: chunkWithHeader.size,
  //           };
  //         })
  //       );

  //       for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
  //         const start = chunkIndex * chunkSize;
  //         const end = Math.min(start + chunkSize, fileSize);
  //         const chunk = selectedFiles[0].slice(start, end);

  //         const uniqueFilename = generateUniqueFilename(selectedFiles[0].name, chunkIndex);

  //         // Upload the chunk with the header
  //         uploadChunk(chunk, chunkIndex, totalChunks, uniqueFilename);
  //       }
  //     };

  //     reader.readAsArrayBuffer(selectedFiles[0]);
  //   }
  // };
  const startUpload = () => {
    setLoading(true);
    setUploading(true);
    if (selectedFiles && selectedFiles.length > 0) {
      const fileSize = selectedFiles[0].size;
      const chunkSize = 50 * 1024 * 1024; // 50MB
      const totalChunks = Math.ceil(fileSize / chunkSize);
      setTotalChunks(totalChunks);

      // Read the selected file as a Blob
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result; // The content of the entire file
        const textDecoder = new TextDecoder("utf-8");
        const fileContentString = textDecoder.decode(fileContent);
        const lines = fileContentString.split("\n");
        const header = lines[0]; // Assuming the first line is the header
        const linesPerChunk = Math.ceil(lines.length / totalChunks);

        setChunks(
          Array.from({ length: totalChunks }, (_, index) => {
            const start = index * chunkSize;
            const end = Math.min((index + 1) * chunkSize, fileSize);
            const chunk = selectedFiles[0].slice(start, end);
            const uniqueFilename = generateUniqueFilename(
              selectedFiles[0].name,
              index
            );
            return {
              filename: uniqueFilename,
              progress: 0,
              size: chunk.size,
            };
          })
        );
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const startLine = chunkIndex * linesPerChunk;
          // const end = Math.min(start + chunkSize, fileSize);
          const endLine = startLine + linesPerChunk;
          // const chunk = selectedFiles[0].slice(start, end);
          const chunkLines = lines.slice(startLine, endLine);
          const chunkContent =
            chunkIndex === 0
              ? chunkLines.join("\n")
              : [header, ...chunkLines].join("\n");
          const chunkBlob = new Blob([chunkContent], {
            type: selectedFiles[0].type,
          });
          const uniqueFilename = generateUniqueFilename(
            selectedFiles[0].name,
            chunkIndex
          );

          // let chunkToUpload;
          // if (chunkIndex === 0) {
          //   // Use the original chunk for the first chunk
          //   chunkToUpload = chunk;
          // } else {
          //   // Prepend the header to the chunk
          //   chunkToUpload = new Blob([header, "\n", chunk], {
          //     type: selectedFiles[0].type,
          //   });
          // }

          // Upload the chunk
          uploadChunk(chunkBlob, chunkIndex, totalChunks, uniqueFilename);
        }
      };

      reader.readAsArrayBuffer(selectedFiles[0]);
    }
  };

  const saveChunkLocally = (chunk, chunkIndex, customFileName) => {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const chunkData = event.target.result;
      const blob = new Blob([chunkData]);
      const chunkFileName = `${customFileName}.dat`;

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = chunkFileName;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    fileReader.readAsArrayBuffer(chunk);
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="card-header">
                  <h4 className="card-title mb-0">Upload Documents</h4>
                </CardHeader>
                <CardBody>
                  {/* <p className="text-muted">
                    DropzoneJS is an open source library that provides
                    drag’n’drop file uploads with image previews.
                  </p> */}
                  <Dropzone
                    onDrop={(acceptedFiles) => {
                      handleAcceptedFiles(acceptedFiles);
                    }}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div className="dropzone dz-clickable">
                        <div
                          className="dz-message needsclick"
                          {...getRootProps()}
                        >
                          <div className="mb-3">
                            <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                          </div>
                          <h4>Drop files here or click to upload.</h4>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                  <div className="list-unstyled mb-0" id="file-previews">
                    {selectedFiles.map((f, i) => {
                      return (
                        <Card
                          className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                          key={i + "-file"}
                        >
                          <div className="p-2">
                            <Row className="align-items-center">
                              <Col className="col-auto">
                                <img
                                  data-dz-thumbnail=""
                                  height="80"
                                  className="avatar-sm rounded bg-light"
                                  alt={f.name}
                                  src={f.preview}
                                />
                              </Col>
                              <Col>
                                <Link
                                  to="#"
                                  className="text-muted font-weight-bold"
                                >
                                  {f.name}
                                </Link>
                                <p className="mb-0">
                                  <strong>{f.formattedSize}</strong>
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="d-flex justify-content-center">
                    {/* <Button
                      onClick={startUpload}
                      disabled={!selectedFiles[0]}
                      color="success"
                      className=" btn-label right mt-4"
                    >
                      <i className=" ri-upload-line label-icon align-middle  fs-16 ms-2"></i>
                      Upload
                    </Button> */}

                    <Button
                      color="success"
                      className="btn-label right mt-4 me-2"
                      onClick={() => {
                        startUpload();
                        setCheck(true);
                        // setLoading(false);
                      }}
                      disabled={!selectedFiles[0] ? true : check && loading}
                    >
                      {check ? (
                        <span className="d-flex align-items-center">
                          <Spinner
                            size="sm"
                            className="flex-shrink-0"
                            style={{
                              display: !loading ? "none" : "block",
                            }}
                          >
                            Uploading
                          </Spinner>
                          <span className="flex-grow-1 ms-2">
                            {" "}
                            <i className=" ri-upload-line label-icon align-middle  fs-16 ms-2"></i>
                            Upload
                          </span>
                        </span>
                      ) : (
                        <span className="flex-grow-1 ms-2">
                          <i className="ri-upload-line label-icon align-middle fs-16 ms-2"></i>
                          Upload
                        </span>
                      )}
                    </Button>
                    <Button className=" btn-label right mt-4 ">
                      <i className=" ri-download-line label-icon align-middle  fs-16 ms-2"></i>
                      <Link
                        to="https://demo.crmexperts.in/fileupload/getSampleData.php"
                        target="_blank"
                        className="text-white"
                      >
                        Sample Download
                      </Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="vstack gap-2">
                    <div className="border rounded border-dashed p-2">
                      {uploading &&
                        chunks &&
                        chunks.map((file, index) => (
                          <Row>
                            <Col lg={12}>
                              <div
                                className="d-flex align-items-center mb-3"
                                id={index}
                                key={index}
                              >
                                <div className="flex-shrink-0 me-3">
                                  <div className="avatar-sm">
                                    <div className="avatar-title bg-light text-secondary rounded fs-24">
                                      <i className="ri-folder-zip-line"></i>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                  <div className="d-flex  justify-content-between">
                                    <h5 className="fs-13 mb-1 me-4">
                                      <p className="text-body text-truncate d-block">
                                        {file.filename}
                                      </p>
                                    </h5>
                                    <div className="d-flex align-items-center mb-2">
                                      <div className="progress-container">
                                        <progress
                                          max="100"
                                          value={file.progress}
                                          className="progress-bar"
                                        />
                                        <p className="progress-label">
                                          {file.progress}%
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="file-size">
                                    {/* {file.size < 10000
                                      ? "0.01"
                                      : (file.size / (1024 * 1024)).toFixed(
                                          2
                                        )}{" "}
                                    MB */}
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default File;
