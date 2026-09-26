function dataURLToBlob(dataURL) {
  const [header, base64] = dataURL.split(",", 2);

  if (!header || !base64) {
    throw new Error("Invalid image data URL");
  }

  const match = header.match(/:(.*?);/);

  if (!match) {
    throw new Error("Could not determine image MIME type");
  }

  const mimeType = match[1];

  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], {
    type: mimeType,
  });
}

export const getSuggestion = async (
  image,
  toast,
  setSuggestion,
  provider,
  model,
) => {
  if (!image) {
    toast.error("No screenshot");
    return null;
  }

  try {
    const blob = dataURLToBlob(image);

    const formData = new FormData();

    formData.append("provider", provider);
    formData.append("model", model);
    formData.append("image", blob, "conversation.png");

    toast("Creating suggestions...")
    const response = await fetch("http://127.0.0.1:8000/ai/suggest", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Suggestion server error:", errorText);

      toast.error("Server error check logs");

      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    setSuggestion(data.suggestions);

    return data;
  } catch (error) {
    console.error("getSuggestion error:", error);

    toast.error("Failed to get suggestion, check logs");

    return null;
  }
};
