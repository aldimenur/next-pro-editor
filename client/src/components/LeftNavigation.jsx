import React from "react";
import {
  FaMusic,
  FaVideo,
  FaVolumeUp,
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaUpload,
} from "react-icons/fa";

const LeftNavigation = ({
  isNavCollapsed,
  setIsNavCollapsed,
  activeSection,
  setActiveSection,
  increaseGridColumns,
  decreaseGridColumns,
}) => {
  // Navigation sections with icons
  const sections = [
    { id: "sfx", label: "Sound Effects", icon: FaVolumeUp },
    { id: "vfx", label: "Video Effects", icon: FaVideo },
    { id: "music", label: "Music", icon: FaMusic },
    { id: "upload", label: "Add Assets", icon: FaUpload },
  ];

  return (
    <div
      className={`
        ${isNavCollapsed ? "w-20" : "w-64"} 
        bg-white 
        shadow-xl 
        border-r 
        border-gray-200 
        flex 
        flex-col 
        justify-between 
        transition-all 
        duration-300 
        ease-in-out 
        relative
      `}
    >
      <div className="p-4">
        {!isNavCollapsed && (
          <h1 className="text-xl font-bold mb-6 text-gray-900 text-center">
            Firasat Library
          </h1>
        )}

        <nav className="space-y-2">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                }}
                className={`
                  w-full 
                  flex 
                  items-center 
                  p-3 
                  rounded-lg 
                  transition 
                  duration-300 
                  group 
                  ${
                    activeSection === section.id
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                  ${isNavCollapsed ? "justify-center" : ""}
                `}
                title={section.label}
              >
                <SectionIcon
                  className={`
                    ${isNavCollapsed ? "mr-0" : "mr-3"} 
                    ${
                      activeSection === section.id
                        ? "text-white"
                        : "text-gray-500"
                    }
                    group-hover:text-blue-600
                  `}
                />
                {!isNavCollapsed && section.label}
              </button>
            );
          })}
        </nav>

        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          className={`
            w-full 
            p-3 
            mt-4 
            rounded-lg 
            transition 
            duration-300 
            flex 
            items-center 
            justify-center 
            group 
            hover:bg-gray-200
            ${isNavCollapsed ? "bg-gray-100" : "bg-gray-50"}
          `}
        >
          {isNavCollapsed ? (
            <FaChevronRight className="text-gray-600 group-hover:text-gray-800 transition" />
          ) : (
            <FaChevronLeft className="text-gray-600 group-hover:text-gray-800 transition" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4 justify-center items-center">
        {/* <span className="text-gray-600 text-sm">{gridColumns}</span> */}
        <button
          onClick={increaseGridColumns}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-300 w-full flex justify-center items-center"
        >
          <FaPlus className="text-gray-700" />
        </button>
        <button
          onClick={decreaseGridColumns}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-300 w-full flex justify-center items-center"
        >
          <FaMinus className="text-gray-700" />
        </button>
        {!isNavCollapsed && (
          <div className="text-center text-gray-500 text-sm p-4 border-t border-gray-200">
            &copy; {new Date().getFullYear()} Aldimenur
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftNavigation;
