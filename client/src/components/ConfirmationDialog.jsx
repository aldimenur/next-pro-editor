import { Dialog, DialogTitle, DialogPanel } from "@headlessui/react";
import { LuX, LuCheck } from "react-icons/lu";

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  fileName,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <DialogTitle className="text-lg font-bold text-gray-900 mb-4">
            Confirm File Deletion
          </DialogTitle>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete the file:{" "}
            <span className="font-semibold">{fileName}</span>?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center"
            >
              <LuX className="mr-2" /> Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 flex items-center"
            >
              <LuCheck className="mr-2" /> Delete
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
