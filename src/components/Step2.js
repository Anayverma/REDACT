"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ValidateMaskedElement = () => {
  const [elementType, setElementType] = useState("");
  const [element, setElement] = useState(null);
  const [certificateType, setCertificateType] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [preview, setPreview] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [cerfileUrl, setCerFileUrl] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [loading,setLoading] = useState(false);
  const handleElementTypeChange = (e) => {
    setElementType(e.target.value);
    setElement(null);
    setPreview("");
    setFileUrl("");
    setValidationResult("");
  };

  const handleCertificateTypeChange = (e) => {
    setCertificateType(e.target.value);
    setCertificate(null);
    setCertificatePreview("");
    setCerFileUrl("");
  };

  const handleElementChange = (e) => {
    const selectedElement = e.target.files[0];
    if (selectedElement) {
      setElement(selectedElement);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };

      if (
        elementType.startsWith("image") ||
        elementType === "application/pdf" ||
        elementType === "video/mp4" ||
        elementType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedElement);
      } else {
        setPreview("");
      }
    }
  };

  const handleCertificateChange = (e) => {
    const selectedCertificate = e.target.files[0];
    if (selectedCertificate) {
      setCertificate(selectedCertificate);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result);
      };

      if (
        certificateType.startsWith("image") ||
        certificateType === "application/pdf" ||
        certificateType === "video/mp4" ||
        certificateType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedCertificate);
      } else {
        setCertificatePreview("");
      }
    }
  };

  const uploadToIPFS = async () => {
    if (!element || !certificate) {
      toast.error("Please select both element and certificate.");
      return;
    }

    try {
      // Upload element separately
      const elementIpfsLink = await uploadFileToIPFS(element);
      setFileUrl(elementIpfsLink);
      validateMaskedElement(elementIpfsLink, "element");

      // Upload certificate separately
      const certificateIpfsLink = await uploadFileToIPFS(certificate);
      setCerFileUrl(certificateIpfsLink);
      validateMaskedElement(certificateIpfsLink, "certificate");

    } catch (error) {
      console.error("Error uploading files to IPFS:", error);
      toast.error("Error uploading files to IPFS.");
    }
  };

  const uploadFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true)
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        body: formData,
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_API_Key,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_API_Secret,
        },
      }
    );
    setLoading(false)

    if (!response.ok) {
      throw new Error("Error uploading file to IPFS.");
    }

    const data = await response.json();
    const ipfsLink = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    return ipfsLink;
  };

  const validateMaskedElement = async (ipfsLink, type) => {
    try {
    setLoading(true)

      const response = await fetch("/api/validategetlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: ipfsLink }),
      });
      setLoading(false)

      if (!response.ok) {
        throw new Error(`Error validating ${type}.`);
      }

      const { link, username } = await response.json();
      setValidationResult(
        `Validation successful for ${type}! Link: ${link}, Username: ${username}`
      );
      toast.success(`${type} validated successfully!`);
    } catch (error) {
      console.error(`Error validating ${type}:`, error);
      setValidationResult(`Error validating ${type}.`);
      toast.error(`Error validating ${type}.`);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Validate Masked Element
      </h2>

      {/* Element Selection */}
      <div className="w-full mb-6">
        <label
          htmlFor="element-type"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Select Element Type
        </label>
        <select
          id="element-type"
          value={elementType}
          onChange={handleElementTypeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select element type</option>
          <option value="image/*">Image (JPEG, PNG, etc.)</option>
          <option value="application/pdf">PDF</option>
          <option value="application/msword">DOC</option>
          <option value="video/mp4">MP4 Video</option>
          <option value="audio/mp3">MP3 Audio</option>
        </select>
      </div>

      <div className="w-full mb-6">
        <label
          htmlFor="certificate-type"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Select Certificate Type
        </label>
        <select
          id="certificate-type"
          value={certificateType}
          onChange={handleCertificateTypeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select certificate type</option>
          <option value="image/*">Image (JPEG, PNG, etc.)</option>
          <option value="application/pdf">PDF</option>
          <option value="application/msword">DOC</option>
          <option value="video/mp4">MP4 Video</option>
          <option value="audio/mp3">MP3 Audio</option>
        </select>
      </div>

      {elementType && (
        <>
          <div className="w-full mb-6">
            <input
              type="file"
              accept={elementType}
              onChange={handleElementChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          {preview && (
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Preview:
              </h3>
              {elementType.startsWith("image") && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-80 rounded-lg border border-gray-300"
                />
              )}
              {elementType === "application/pdf" && (
                <iframe
                  src={preview}
                  title="PDF Preview"
                  className="w-full h-80 border border-gray-300"
                />
              )}
              {elementType === "video/mp4" && (
                <video
                  src={preview}
                  controls
                  className="w-full h-80 border border-gray-300 rounded-lg"
                />
              )}
              {elementType === "audio/mp3" && (
                <audio
                  src={preview}
                  controls
                  className="w-full border border-gray-300 rounded-lg"
                />
              )}
            </div>
          )}
        </>
      )}

      {certificateType && (
        <>
          <div className="w-full mb-6">
            <input
              type="file"
              accept={certificateType}
              onChange={handleCertificateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          {certificatePreview && (
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Certificate Preview:
              </h3>
              {certificateType.startsWith("image") && (
                <img
                  src={certificatePreview}
                  alt="Preview"
                  className="max-w-full max-h-80 rounded-lg border border-gray-300"
                />
              )}
              {certificateType === "application/pdf" && (
                <iframe
                  src={certificatePreview}
                  title="PDF Preview"
                  className="w-full h-80 border border-gray-300"
                />
              )}
              {certificateType === "video/mp4" && (
                <video
                  src={certificatePreview}
                  controls
                  className="w-full h-80 border border-gray-300 rounded-lg"
                />
              )}
              {certificateType === "audio/mp3" && (
                <audio
                  src={certificatePreview}
                  controls
                  className="w-full border border-gray-300 rounded-lg"
                />
              )}
            </div>
          )}
        </>
      )}

      <button
        onClick={uploadToIPFS}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Upload & Validate
      </button>

      {validationResult && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {validationResult}
        </div>
      )}
    </div>
  );
};

export default ValidateMaskedElement;
