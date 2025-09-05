import React, { useState } from "react";
import { importAssets } from "../services/assetService";

const assetOptions = [
  { id: "sfx", label: "Sound Effect" },
  { id: "vfx", label: "Video" },
  { id: "music", label: "Music" },
];

function AddAsset({ onUploadSuccess }) {
  const [assetType, setAssetType] = useState("sfx");
  const [message, setMessage] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Import Assets</h2>
      <p className="text-gray-700 text-sm mb-4">
        Import assets from your computer to the library. You can import multiple
        files at once.
      </p>

      {/* Asset type selector */}
      <div className="mb-4 flex items-center space-x-2">
        <label className="text-gray-700 text-sm font-medium">Asset Type:</label>
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {assetOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={async () => {
          const res = await importAssets({ assetType });
          if (res.success) {
            setMessage({
              type: "success",
              text: "Files imported successfully!",
            });
            if (onUploadSuccess) onUploadSuccess();
          } else if (!res.canceled) {
            setMessage({ type: "error", text: res.error || "Import failed" });
          }
        }}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
      >
        Browse Files
      </button>

      {/* Notification */}
      {message && (
        <div
          className={`mt-4 px-4 py-2 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

export default AddAsset;
