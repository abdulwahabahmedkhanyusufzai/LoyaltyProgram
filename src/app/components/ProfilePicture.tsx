
export const ProfilePicUploader = ({
  profilePic,
  setFormData,
  formManager
}: {
  profilePic: string;
}) => {

 const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      formManager.handleImageUpload(file);

      setFormData((prev) => ({
        ...prev,
        profilePicPreview: URL.createObjectURL(file),
      }));
    }
  };
  return (
  <div className="flex flex-col items-center">
    <div className="h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] rounded-full overflow-hidden border-2 border-gray-300">
      {profilePic ? (
        <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="bg-[#D9D9D9] text-[#734A00] h-full w-full flex items-center justify-center text-xs sm:text-sm">
          Profile Picture
        </div>
      )}
    </div>
    <label className="mt-3 text-sm text-white rounded-full px-5 py-2 bg-[#734A00] cursor-pointer">
      Upload
      <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
    </label>
  </div>
)
};