export const captureSelectedArea = async (area, toast, setImage) => {
  if (!area) {
    toast.error("No selected area");
    return null;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const viewport = await new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "GET_VIEWPORT_SIZE"
      },
      (response) => {
        resolve(response);
      }
    );
  });

  const image = await chrome.tabs.captureVisibleTab(
    tab.windowId,
    {
      format: "png"
    }
  );

  const croppedImage = await new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const screenshotWidth = img.naturalWidth;
      const screenshotHeight = img.naturalHeight;

      const scaleX = screenshotWidth / viewport.width;
      const scaleY = screenshotHeight / viewport.height;

      const cropX = Math.round(area.x * scaleX);
      const cropY = Math.round(area.y * scaleY);
      const cropWidth = Math.round(area.width * scaleX);
      const cropHeight = Math.round(area.height * scaleY);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const result = canvas.toDataURL("image/png");

      setImage(result);

      resolve(result);
    };

    img.src = image;
  });

  return croppedImage;
};