import Masonry from "react-masonry-css";
import { IoClose } from "react-icons/io5";
import { FaYoutube } from "react-icons/fa";

const MultipleImageCardPreview = ({
  files,
  savedFiles,
  setSelectedLocation,
  setSelectedLocationImage,
  setSelectedNPC,
  setSelectedNPCImage,
  setSelectedElement,
  setSelectedSavedImage,
  onRemove,
  onRemoveURL,
  element,
  elementIndex,
  setIsAdding,
  setSavedImage,
  setIsOpen,
}) => {
  const isYoutubeUrl = (url) => {
    if (!url) return false;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/|youtube\.com\/shorts\/)([^#&?]*).*/;
    return youtubeRegex.test(url);
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYoutubeThumbnail = (url) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  return (
    <div>
      <div className="overflow-y-auto p-2 pl-0 bg-slate-100 w-full">
        <Masonry
          breakpointCols={5}
          className="my-masonry-grid max-h-[42rem] pt-4 pr-4"
          columnClassName="my-masonry-grid_column"
        >
          {savedFiles &&
            savedFiles.map((file, index) => (
              <div
                className="relative rounded-lg relative !bg-transparent border border-jacarta-100 dark:border-jacarta-600"
                key={index}
              >
                <a
                  data-bs-toggle="modal"
                  data-bs-target="#imageModal"
                  onClick={() => {
                    if (element === "location") {
                      setSelectedLocationImage(index);
                      setSelectedLocation(elementIndex);
                    } else {
                      setSelectedNPCImage(index);
                      setSelectedNPC(elementIndex);
                    }
                    setSelectedSavedImage(index);
                    setSelectedElement(element);
                    setSavedImage(true);
                    setIsAdding(false);
                    setTimeout(() => setIsOpen && setIsOpen(true), 0); 
                  }}
                >
                  <div className="p-4" key={index}>
                    {file.url ? (
                      isYoutubeUrl(file.url) ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                          <img
                            src={getYoutubeThumbnail(file.url)}
                            className="rounded-lg w-full h-full object-cover"
                            alt={`YouTube Video ${index + 1}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-jacarta-700"
                            style={{ display: 'none' }}
                          >
                            <FaYoutube className="text-5xl text-red-600" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-2">
                              <FaYoutube className="text-2xl text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={file.url}
                          className="rounded-lg w-full h-full"
                          alt={`Preview ${index + 1}`}
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                      </div>
                    )}

                    <p className="text-md text-jacarta-400 dark:text-white my-2">
                      {file.name}
                    </p>
                    <p className="text-sm text-jacarta-400 dark:text-white">
                      {file.description}
                    </p>
                  </div>
                </a>
                {onRemoveURL && (
                  <button
                    type="button"
                    onClick={(e) => {
                      onRemoveURL(index);
                    }}
                    className="absolute -top-4 -right-4 p-1"
                  >
                    <IoClose className="text-red text-2xl bg-jacarta-800 rounded-full p-1 border border-jacarta-600" />
                  </button>
                )}
              </div>
            ))}

          {files &&
            files.map((file, index) => (
              <div
                className="relative rounded-lg relative !bg-transparent border border-jacarta-100 dark:border-jacarta-600"
                key={index}
              >
                <a
                  data-bs-toggle="modal"
                  data-bs-target="#imageModal"
                  onClick={() => {
                    console.log('Clicked image index:', index, 'file:', files[index]);
                    if (element === "location") {
                      setSelectedLocationImage(index);
                      setSelectedLocation(elementIndex);
                    } else {
                      setSelectedNPCImage(index);
                      setSelectedNPC(elementIndex);
                    }
                    setSelectedSavedImage(undefined); 
                    setSelectedElement(element);
                    setSavedImage(false);
                    setIsAdding(false);
                    // setTimeout(() => setIsOpen && setIsOpen(true), 0); // REMOVE this line
                  }}
                >
                  <div className="p-4" key={index}>
                    {file.file ? (
                      <img
                        src={window.URL.createObjectURL(file.file)}
                        className="rounded-lg w-full h-full"
                        alt={`Preview ${index + 1}`}
                      />
                    ) : file.youtubeUrl ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <img
                          src={getYoutubeThumbnail(file.youtubeUrl)}
                          className="rounded-lg w-full h-full object-cover"
                          alt={`YouTube Video ${index + 1}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-jacarta-700"
                          style={{ display: 'none' }}
                        >
                          <FaYoutube className="text-5xl text-red-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-2">
                            <FaYoutube className="text-2xl text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                      </div>
                    )}

                    <p className="text-md text-jacarta-400 dark:text-white my-2">
                      {file.title}
                    </p>
                    <p className="text-sm text-jacarta-400 dark:text-white">
                      {file.description}
                    </p>
                  </div>
                </a>
                {onRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      onRemove(index);
                    }}
                    className="absolute -top-4 -right-4 p-1"
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

export default MultipleImageCardPreview;
