import Masonry from "react-masonry-css";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useGameContext } from "@contexts/GameContext";

const MultipleImagePreview = ({ files, onRemove: onRemoveProp }) => {
  const { setGameData, gameData } = useGameContext();
  const onRemove = onRemoveProp || ((index) => {
    // context-based removal logic here
    // This part needs to be implemented based on how gameData is structured
    // For now, we'll just remove from the local previews state
    setPreviews(previews.filter((_, i) => i !== index));
  });

  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (files?.length) {
      const previewUrls = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previewUrls.push(reader.result);
          if (previewUrls.length === files.length) {
            setPreviews(previewUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    return () => setPreviews([]);
  }, [files]);

  if (!files?.length) return null;

  return (
    <div className=" ">
      <div className=" overflow-y-auto p-2 pl-0 bg-slate-100 w-full">
        <Masonry
          breakpointCols={6}
          className="my-masonry-grid max-h-[35rem] pt-4 pr-4"
          columnClassName="my-masonry-grid_column"
        >
          {previews.map((preview, index) => (
            <div className="rounded-lg relative bg-red " key={index}>
              <img
                key={index}
                src={preview}
                className="rounded-lg w-full h-full"
                alt={`Preview ${index + 1}`}
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute -top-4 -right-4 p-1 "
                >
                  <IoClose className="text-red text-2xl bg-jacarta-800 rounded-full p-1 border border-jacarta-600" />
                </button>
              )}
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
};

export default MultipleImagePreview;
