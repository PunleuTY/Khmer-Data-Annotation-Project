import { useState, useEffect, useRef } from "react";
import { CiEdit } from "react-icons/ci";
import { IoClose } from "react-icons/io5";

export default function ProfileHeader({ userData, isEditing, onUpdate }) {
  const [editedData, setEditedData] = useState(userData);
  const profileImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const [viewImage, setViewImage] = useState(null); // null, 'profile', or 'cover'

  // Sync editedData with userData when userData changes
  useEffect(() => {
    setEditedData(userData);
  }, [userData]);

  const handleSave = () => {
    onUpdate(editedData);
  };

  const handleProfileImageClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleCoverImageClick = () => {
    coverImageInputRef.current?.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData({ ...editedData, profileImage: reader.result });
        onUpdate({ ...editedData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData({ ...editedData, coverImage: reader.result });
        onUpdate({ ...editedData, coverImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (imageType) => {
    setViewImage(imageType);
  };

  const closeImageView = () => {
    setViewImage(null);
  };

  return (
    <>
      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeImageView}
        >
          <button
            onClick={closeImageView}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <IoClose className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={
                viewImage === "profile"
                  ? editedData.profileImage || userData.profileImage
                  : editedData.coverImage || userData.coverImage
              }
              alt={viewImage === "profile" ? "Profile" : "Cover"}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-40 bg-gray-200 flex items-center justify-center overflow-hidden group">
          {editedData.coverImage || userData.coverImage ? (
            <img
              src={editedData.coverImage || userData.coverImage}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleImageClick("cover")}
            />
          ) : (
            <span className="text-white text-xl font-medium">Cover Image</span>
          )}
          <input
            ref={coverImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCoverImageClick();
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full border border-gray-300 flex items-center justify-center transition-all shadow-lg z-10"
            title="Change cover image"
          >
            <CiEdit className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Picture */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col items-center -mt-16">
            <div className="relative group">
              <div
                className="w-32 h-32 rounded-full bg-blue-300 border-4 border-white flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleImageClick("profile")}
              >
                <img
                  src={
                    editedData.profileImage ||
                    userData.profileImage ||
                    "/placeholder.svg"
                  }
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfileImageClick();
                }}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md z-10"
                title="Change profile image"
              >
                <CiEdit className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Name and Username */}
            <div className="mt-4 flex flex-col items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                  className="text-2xl font-bold text-gray-900 text-center border-b-2 border-orange-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name}
                </h1>
              )}

              {isEditing ? (
                <input
                  type="text"
                  value={editedData.username}
                  onChange={(e) =>
                    setEditedData({ ...editedData, username: e.target.value })
                  }
                  className="text-gray-500 mt-1 text-center border-b border-gray-300 focus:outline-none"
                />
              ) : (
                <p className="text-gray-500 mt-1">@{userData.username}</p>
              )}
            </div>

            {/* Bio */}
            <div className="mt-4 w-2xl">
              {isEditing ? (
                <textarea
                  value={editedData.bio}
                  onChange={(e) =>
                    setEditedData({ ...editedData, bio: e.target.value })
                  }
                  className="w-full text-sm text-gray-600 text-center leading-relaxed border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-orange-500"
                  rows="3"
                />
              ) : (
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {userData.bio}
                </p>
              )}
            </div>

            {/* Save Button - Only show when editing */}
            {isEditing && (
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
