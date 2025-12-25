// utils/cloudinaryHelper.js
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  // URL mẫu: https://res.cloudinary.com/demo/image/upload/v158/user-avatars/sample.jpg
  // Chúng ta cần lấy: user-avatars/sample

  try {
    const splitUrl = url.split("/");
    const lastSegment = splitUrl.pop(); // sample.jpg
    const folderName = splitUrl.pop(); // user-avatars

    // Bỏ đuôi file (.jpg, .png)
    const publicId = lastSegment.split(".")[0];

    // Trả về format: folder/public_id
    return `${folderName}/${publicId}`;
  } catch (error) {
    console.error("Error extracting publicId:", error);
    return null;
  }
};
