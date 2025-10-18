// DOM and Browser utilities
export { default as CopyToClipboard } from './AddClipboard';
export { handleDarkMode } from './handleDarkMode';
export { addMobileMenuToggle, removeMenuActive } from './mobileMenuToggle';

// Authentication and User
export { logout } from './logoutUser';

// Math and Numbers
export { randomNumber } from './randomNumber';

// YouTube utilities
export {
  extractYouTubeVideoId,
  isYouTubeUrl,
  createYouTubeEmbedUrl,
  isYouTubeShorts,
  getYouTubeDimensions
} from './youtubeUtils';

// 3D and Graphics
export { default as load3DModel } from './3dLoader';
export { computeCameraPosition } from './cameraPosition';
export { computeCenter } from './computeCenter';
export { getSceneGraph } from './getSceneGraph';

// React Hooks
export { default as useDeviceDetect } from './useDeviceDetect';
export { default as useResponsiveImage } from './useResponsiveness';

// Components
export { default as ExtractImage } from './extractImage';

// Firebase
export { auth, db, storage } from './FirebaseConfig';

