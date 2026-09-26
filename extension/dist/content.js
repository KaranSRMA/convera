console.log("Convera content script loaded");

let selectionBox = null;
let selectedArea = null;

let isDragging = false;
let isResizing = false;

let dragStartX = 0;
let dragStartY = 0;

let boxStartLeft = 0;
let boxStartTop = 0;

let resizeStartX = 0;
let resizeStartY = 0;

let boxStartWidth = 0;
let boxStartHeight = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_SELECTION") {
    startSelection();

    sendResponse({
      success: true,
    });
  }

  if (message.type === "GET_SELECTED_AREA") {
    sendResponse({
      success: true,
      area: selectedArea,
    });
  }

  if (message.type === "SET_EVENTS") {
    if (!selectionBox){
      sendResponse({
        success:false,
        message:"No message selected"
      })
      return;
    }
    selectionBox.style.pointerEvents = message.enabled ? "none" : "auto";

    sendResponse({
      success: true,
    });
  }

  if (message.type === "GET_VIEWPORT_SIZE") {
    sendResponse({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  if (message.type === "CLEAR_SELECTED_AREA") {
    if (selectionBox) {
      selectionBox.remove();
    }

    selectionBox = null;
    selectedArea = null;
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    boxStartLeft = 0;
    boxStartTop = 0;

    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);

    document.body.style.cursor = "default";

    sendResponse({
      success: true,
    });
  }
});

function startSelection() {
  console.log("Selection started");
  if (selectionBox) {
    selectionBox.remove();
  }

  selectionBox = document.createElement("div");

  selectionBox.style.position = "fixed";
  selectionBox.style.left = `100px`;
  selectionBox.style.top = `100px`;
  selectionBox.style.width = "300px";
  selectionBox.style.height = "300px";
  selectionBox.style.border = "2px solid red";
  selectionBox.style.zIndex = "999999";
  selectionBox.style.cursor = "move";

  const resizeHandle = document.createElement("div");

  resizeHandle.style.position = "absolute";
  resizeHandle.style.width = "12px";
  resizeHandle.style.height = "12px";
  resizeHandle.style.right = "0px";
  resizeHandle.style.bottom = "0px";
  resizeHandle.style.cursor = "nwse-resize";
  resizeHandle.style.display = "flex";
  resizeHandle.style.alignItems = "center";
  resizeHandle.style.justifyContent = "center";
  resizeHandle.style.color = "white";

  const icon = document.createElement("i");

  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-dimensions-icon lucide-square-dimensions"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 7H7v5"/><path d="M12 17h5v-5"/></svg>`;

  document.body.appendChild(selectionBox);
  selectionBox.appendChild(resizeHandle);
  resizeHandle.appendChild(icon);

  getArea();

  selectionBox.addEventListener("mousedown", startDrag);
  resizeHandle.addEventListener("mousedown", startResize);
}

function startDrag(event) {

  if (event.target !== selectionBox) {
    return;
  }

  isDragging = true;

  dragStartX = event.clientX;
  dragStartY = event.clientY;

  const rect = selectionBox.getBoundingClientRect();

  boxStartLeft = rect.left;
  boxStartTop = rect.top;

  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", stopDrag);
}

function handleDrag(event) {
  if (!isDragging) {
    return;
  }

  const moveX = event.clientX - dragStartX;
  const moveY = event.clientY - dragStartY;

  const newLeft = boxStartLeft + moveX;
  const newTop = boxStartTop + moveY;

  selectionBox.style.left = `${newLeft}px`;
  selectionBox.style.top = `${newTop}px`;
}

function stopDrag() {
  isDragging = false;

  getArea();

  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
}

function startResize(event) {
  event.stopPropagation();

  isResizing = true;

  resizeStartX = event.clientX;
  resizeStartY = event.clientY;

  const rect = selectionBox.getBoundingClientRect();

  boxStartWidth = rect.width;
  boxStartHeight = rect.height;

  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
}

function handleResize(event) {
  if (!isResizing) {
    return;
  }

  const moveX = event.clientX - resizeStartX;
  const moveY = event.clientY - resizeStartY;

  const newWidth = boxStartWidth + moveX;
  const newHeight = boxStartHeight + moveY;

  if (newWidth >= 100) {
    selectionBox.style.width = `${newWidth}px`;
  }

  if (newHeight >= 100) {
    selectionBox.style.height = `${newHeight}px`;
  }
}

function stopResize() {
  isResizing = false;

  getArea();

  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
}

function getArea() {
  const rect = selectionBox.getBoundingClientRect();
  selectedArea = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}
