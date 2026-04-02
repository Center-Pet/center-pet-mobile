const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dx8zzla5s/image/upload";
const DEFAULT_PRESETS = ["centerpet_default", "upload"];

export async function uploadImage(uri) {
  let lastError = null;

  for (const preset of DEFAULT_PRESETS) {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: `upload-${Date.now()}.jpg`
    });
    formData.append("upload_preset", preset);
    formData.append("cloud_name", "dx8zzla5s");

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (response.ok && data?.secure_url) {
      return data.secure_url;
    }

    lastError = data?.error?.message || "Falha ao enviar imagem.";
  }

  throw new Error(lastError || "Falha ao enviar imagem.");
}
