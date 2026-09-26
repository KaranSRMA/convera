import { useState } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { SquareDashedMousePointer, Eraser, Sparkles, MouseOff, Mouse, Copy, Check } from 'lucide-react';

import { Button } from './components/Button'
import { captureSelectedArea } from './lib/captureSelectedArea'
import { getSuggestion } from './lib/aiSuggestion'


function App() {
  const [area, setArea] = useState(null);
  const [image, setImage] = useState(null);
  const [suggestion, setSuggestion] = useState([]);
  const [isEventsDisabled, setisEventsDisabled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Get selected messge box area
  const getArea = async () => {

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        type: "GET_SELECTED_AREA"
      }
    );

    if (response.success) {
      setArea(response.area);
      const croppedImage = await captureSelectedArea(
        response.area,
        toast,
        setImage
      );
      return {
        area: response.area,
        croppedImage
      };
    }
  }

  // start selection box 
  const startSelection = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "START_SELECTION"
      }
    );


  };

  // clear selection box 
  const clearSelection = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "CLEAR_SELECTED_AREA"
      },
      (response) => {
        if (chrome.runtime.lastError) {
          toast.error("Could not communicate with the page");
          return;
        }

        if (!response?.success) {
          toast.error(response?.message || "Operation failed");
          return;
        }

        setArea(null);
        setImage(null);

      }
    );
    toast.success("Cleared")
  }


  // toggle enable/disable events : none/auto
  const toggleEvents = async () => {
    const newValue = !isEventsDisabled

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, {
      type: "SET_EVENTS",
      enabled: newValue
    },
      (response) => {
        if (chrome.runtime.lastError) {
          toast.error("Could not communicate with the page");
          return;
        }

        if (!response?.success) {
          toast.error(response?.message || "Operation failed");
          return;
        }

        setisEventsDisabled(newValue)
        if (newValue) {
          toast.success("Events set to none")
        } else {
          toast.success("Events set to default")
        }
      });
  }

  // Sending req to ai for generating suggestions
  const aiSuggestionReq = async () => {
    const { area: selectedArea, croppedImage: selectedImage } = await getArea();

    if (!selectedArea || !selectedImage) {
      toast.error("No message area selected!");
      return;
    }

    await getSuggestion(
      selectedImage,
      toast,
      setSuggestion,
      "gemini",
      "gemini-3.5-flash-lite"
    );

  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy.")
      console.error("Failed to copy:", error);
    }
  };


  return (
    <div>
      <div className="flex flex-col gap-3 p-2">
        <Toaster position="top-right" reverseOrder={false} />
        <h1>Convera</h1>

        <div className="flex item-center justify-center gap-5">
          <Button
            func={startSelection}
            text='Select Msgs'
            icon={<SquareDashedMousePointer className="size-4" />}
          />

          <Button
            func={clearSelection}
            text='Clear'
            icon={<Eraser className="size-4" />}
          />

          <Button
            func={toggleEvents}
            text="Toggle Events"
            icon={isEventsDisabled ? <MouseOff className="size-4" /> : <Mouse className="size-4" />}
          />

          <Button
            func={aiSuggestionReq}
            text='Get Suggestion'
            icon={<Sparkles className="size-4" />}
          />
        </div>
      </div>

      <div className=" flex flex-col gap-5 p-2">
        {/* image */}
        {image && suggestion <=0 && (
          <div className="flex flex-col gap-2 items-center">
            <h2>Captured Image</h2>

            <img
              src={image}
              alt="Selected area"
            />
          </div>
        )}

        {/* suggestion  */}
        {suggestion.length > 0 && (
          <div className="border border-gray-400 p-4">
            <h2>Suggestions</h2>
            {suggestion.map((s, index) => (
              <div key={s.title} className="flex gap-2 items-center">
                <div className="border-white flex flex-1 flex-col gap-2 my-2 rounded-lg border-2 p-2">
                  <span className="text-lg">{s.title}</span>
                  <p className="bg-zinc-700 px-3 text-white rounded-md">{s.text}</p>
                </div>

                <button onClick={() => handleCopy(s.text, index)} className="cursor-pointer rounded-full bg-zinc-800 p-2">
                  {copiedIndex === index ? (
                    <Check className="size-5" />
                  ) : (
                    <Copy className="size-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;