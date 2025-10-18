import { GameData, Location, LocationImage } from '@/types';

export function addLocation(gameData: GameData, setGameData: (cb: (prev: GameData) => GameData) => void): void {
  setGameData((prev) => ({
    ...prev,
    locations: [
      ...prev.locations,
      { name: '', description: '', images: [] },
    ],
  }));
}

export function handleLocationChange(
  index: number,
  field: keyof Location | 'images',
  value: any,
  gameData: GameData,
  setGameData: (cb: (prev: GameData) => GameData) => void
): void {
  setGameData((prev) => {
    const newLocations = [...prev.locations];
    if (field === 'images' && value.target.files && value.target.files.length > 0) {
      const newImages = Array.from(value.target.files as File[]).map((file: File) => ({
        file,
        type: file.type,
        title: '',
        description: '',
        youtubeUrl: ''
      }));
      newLocations[index].images = [
        ...prev.locations[index].images,
        ...newImages,
      ];
    } else {
      (newLocations[index] as any)[field] = value;
    }
    return { ...prev, locations: newLocations };
  });
}

export async function handleLocationDelete(
  gameId: string,
  locationId: string,
  deleteLocation: any,
  setGameData: any
) {
  await deleteLocation(gameId, locationId);
  setGameData((prev: GameData) => ({
    ...prev,
    locations: prev.locations.filter((loc) => String(loc.id) !== String(locationId)),
  }));
}

export async function handleLocationImageUpdate(
  gameId: string,
  locationId: string,
  imageId: string,
  imageData: any,
  updateLocationImage: any,
  setGameData: any
) {
  const formData = new FormData();
  if (imageData.file) formData.append('file', imageData.file);
  if (imageData.title) formData.append('name', imageData.title);
  if (imageData.description) formData.append('description', imageData.description);
  const updated = await updateLocationImage(gameId, locationId, imageId, formData);
  if (updated) {
    setGameData((prev: GameData) => {
      const newLocations = prev.locations.map((loc) => {
        if (String(loc.id) === String(locationId)) {
          const newImages = loc.images.map((img: any) =>
            String(img.id) === String(imageId) ? { ...img, ...updated } : img
          );
          return { ...loc, images: newImages };
        }
        return loc;
      });
      return { ...prev, locations: newLocations };
    });
  }
}

export async function handleLocationImageDelete(
  gameId: string,
  locationId: string,
  imageId: string,
  deleteLocationImage: any,
  setGameData: any
) {
  await deleteLocationImage(gameId, locationId);
  setGameData((prev: GameData) => {
    const newLocations = prev.locations.map((loc) => {
      if (String(loc.id) === String(locationId)) {
        return { ...loc, images: loc.images.filter((img: any) => String(img.id) !== String(imageId)) };
      }
      return loc;
    });
    return { ...prev, locations: newLocations };
  });
}

export async function handleLocationSave(
  gameId: string,
  location: any,
  createLocation: any,
  updateLocation: any,
  setGameData: any
) {
  const formData = new FormData();
  formData.append('location_name', location.name);
  formData.append('location_description', location.description);

  const uniqueImages = location.images.filter((img: any, index: number, self: any[]) => 
    index === self.findIndex((i: any) => (
      (i.file && img.file && i.file.name === img.file.name && i.file.size === img.file.size) ||
      (i.url && img.url && i.url === img.url) ||
      (i.id && img.id && i.id === img.id)
    ))
  );

  uniqueImages.forEach((img: any, i: number) => {
    if (img.file) formData.append(`location_images[${i}][file]`, img.file);
    if (img.title) formData.append(`location_images[${i}][name]`, img.title);
    if (img.description) formData.append(`location_images[${i}][description]`, img.description);
  });

  let updated;
  if (location.id) {
    updated = await updateLocation(gameId, location.id, formData);
  } else {
    updated = await createLocation(gameId, formData);
  }

  if (updated) {
    setGameData((prev: GameData) => {
      const newLocations = prev.locations.map((loc) => {
        if (loc.id === updated.id || (!loc.id && !updated.id && loc.name === updated.location_name)) {
          return {
            ...loc,
            ...updated,
            id: updated.id,
            name: updated.location_name,
            description: updated.location_description,
            images: updated.location_images || uniqueImages
          };
        }
        return loc;
      });
      return { ...prev, locations: newLocations };
    });
  }
}

export function removeLocationImage(
  locationIndex: number,
  imageIndex: number,
  gameData: any,
  setGameData: (cb: (prev: any) => any) => void
): void {
  setGameData((prev: any) => {
    const newLocations = [...prev.locations];
    newLocations[locationIndex].images = newLocations[locationIndex].images.filter(
      (_: any, idx: number) => idx !== imageIndex
    );
    return { ...prev, locations: newLocations };
  });
}

export function removeLocation(
  indexToRemove: number,
  gameData: GameData,
  setGameData: (cb: (prev: GameData) => GameData) => void
): void {
  if (gameData.locations.length > 1) {
    setGameData((prev) => ({
      ...prev,
      locations: Array.isArray(prev.locations)
        ? prev.locations.filter((_, index) => index !== indexToRemove)
        : [],
    }));
  }
}