import { useEffect } from "react";

<<<<<<< HEAD
export function PetitionModal({ pet, onClose , creatorName }) {
=======
export function PetitionModal({ pet, onClose, creatorName }) {
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!pet) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999999] overflow-y-auto px-4">
<<<<<<< HEAD
      <div className="bg-[#f1e0d6] rounded-2xl shadow-xl p-6 w-full max-w-xs sm:max-w-md md:max-w-2xl relative my-10">

      
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black text-2xl sm:text-xl cursor-pointer"
=======
      <div className="bg-[#f3b87d] rounded-2xl shadow-xl p-6 w-full max-w-xs sm:max-w-md md:max-w-2xl relative my-10 border border-[var(--color-border)]">

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-[var(--color-accent)] text-2xl sm:text-xl cursor-pointer"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        >
          ✕
        </button>

<<<<<<< HEAD
      
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 mt-2 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4a2c2a] break-words">
            {pet.title}
          </h2>
          <p className="text-xs sm:text-sm text-blue-600">
=======
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 mt-2 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary)] break-words">
            {pet.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-primary)]">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            {pet.created_on.split("T")[0].split("-").reverse().join("-") +
              "  - " +
              pet.created_on.split("T")[1].split(".")[0] +
              " IST"}
          </p>
        </div>

<<<<<<< HEAD
        <div className="text-[#4a2c2a] text-sm sm:text-base mb-4 max-h-40 sm:max-h-60 overflow-y-auto pr-2">
          {pet.description}
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#fbeaea] p-3 rounded-lg border border-[#4a2c2a]/30">
            <p className="text-xs sm:text-sm text-gray-600">Signatures</p>
            <p className="font-semibold text-[#4a2c2a] text-sm sm:text-base">
              {pet.signedBy.length} / {pet.goal}
            </p>
          </div>
          <div className="bg-[#fbeaea] p-3 rounded-lg border border-[#4a2c2a]/30">
            <p className="text-xs sm:text-sm text-gray-600">Created By</p>
            <p className="font-semibold text-[#4a2c2a] text-sm sm:text-base break-words">
              {creatorName || "Loading..."}
            </p>
          </div>
          <div className="bg-[#fbeaea] p-3 rounded-lg border border-[#4a2c2a]/30">
            <p className="text-xs sm:text-sm text-gray-600">Status</p>
            <p
              className={`font-semibold text-sm sm:text-base ${pet.status === "Active"
                ? "text-green-600"
                : pet.status === "Under Review"
                  ? "text-orange-600"
                  : "text-red-600"
                }`}
=======
        <div className="text-[var(--color-secondary)] text-sm sm:text-base mb-4 max-h-40 sm:max-h-60 overflow-y-auto pr-2 break-all">
          {pet.description}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#fdfaf5] p-3 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs sm:text-sm text-gray-600">Signatures</p>
            <p className="font-semibold text-[var(--color-secondary)] text-sm sm:text-base">
              {pet.signedBy.length} / {pet.goal}
            </p>
          </div>

          <div className="bg-[#fdfaf5] p-3 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs sm:text-sm text-gray-600">Created By</p>
            <p className="font-semibold text-[var(--color-secondary)] text-sm sm:text-base break-words">
              {creatorName || "Loading..."}
            </p>
          </div>

          <div className="bg-[#fdfaf5] p-3 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs sm:text-sm text-gray-600">Status</p>
            <p
              className={`font-semibold text-sm sm:text-base ${
                pet.status === "Active"
                  ? "text-[var(--color-success)]"
                  : pet.status === "Under Review"
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-danger)]"
              }`}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            >
              {pet.status}
            </p>
          </div>
<<<<<<< HEAD
          <div className="bg-[#fbeaea] p-3 rounded-lg border border-[#4a2c2a]/30">
            <p className="text-xs sm:text-sm text-gray-600">Category</p>
            <p className="font-semibold text-[#4a2c2a] text-sm sm:text-base">
=======

          <div className="bg-[#fdfaf5] p-3 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs sm:text-sm text-gray-600">Category</p>
            <p className="font-semibold text-[var(--color-secondary)] text-sm sm:text-base">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              {pet.category}
            </p>
          </div>
        </div>
      </div>
    </div>
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  );
}
