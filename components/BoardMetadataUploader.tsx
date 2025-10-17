"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button_copy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";

interface BoardMetadata {
  gridSize?: number;
  navigationMatrix?: number[][];
  imageUrl?: string;
}

interface BoardMetadataUploaderProps {
  onMetadataUpload: (metadata: BoardMetadata) => void;
}

function validateMatrix(matrix: any, gridSize: number): boolean {
  if (!Array.isArray(matrix)) return false;
  if (matrix.length !== gridSize) return false;
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    if (!Array.isArray(row) || row.length !== gridSize) return false;
    for (let j = 0; j < row.length; j++) {
      if (row[j] !== 0 && row[j] !== 1) return false;
    }
  }
  return true;
}

export const BoardMetadataUploader = ({ onMetadataUpload }: BoardMetadataUploaderProps) => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heightMapFile, setHeightMapFile] = useState<File | null>(null);
  const [normalMapFile, setNormalMapFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = useCallback(async () => {
    setIsLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (error) {
        throw new Error("Invalid JSON format");
      }

      if (!parsedData.gridSize || !parsedData.navigationMatrix) {
        throw new Error("JSON must contain gridSize and navigationMatrix");
      }

      if (!Number.isInteger(parsedData.gridSize) || parsedData.gridSize <= 0) {
        throw new Error("gridSize must be a positive integer");
      }

      if (!validateMatrix(parsedData.navigationMatrix, parsedData.gridSize)) {
        throw new Error(
          `navigationMatrix must be a ${parsedData.gridSize}x${parsedData.gridSize} array of 0s and 1s`
        );
      }

      let imageUrl = "";
      let heightMapUrl = "";
      let normalMapUrl = "";

      if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
      }

      if (heightMapFile) {
        heightMapUrl = URL.createObjectURL(heightMapFile);
      }

      if (normalMapFile) {
        normalMapUrl = URL.createObjectURL(normalMapFile);
      }

      const metadata = {
        gridSize: parsedData.gridSize,
        navigationMatrix: parsedData.navigationMatrix,
        imageUrl: imageUrl || undefined,
        heightMapUrl: heightMapUrl || undefined,
        normalMapUrl: normalMapUrl || undefined,
      };

      onMetadataUpload(metadata);

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [jsonInput, imageFile, heightMapFile, normalMapFile, onMetadataUpload]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div>
        <Label htmlFor="json-input">Board Metadata (JSON)</Label>
        <Textarea
          id="json-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`Example:
        {
        "gridSize": 10,
        "navigationMatrix": [
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 0, 0, 1, 1, 1, 0, 0, 1],
        [0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        [0, 1, 1, 0, 0, 1, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 0, 0, 1, 1, 1, 0, 0, 1],
        [0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        [0, 1, 1, 0, 0, 1, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
        }`}
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="image-upload">Base Texture (Board Image)</Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        {imageFile && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {imageFile.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="height-map-upload">Height Map (Optional)</Label>
        <Input
          id="height-map-upload"
          type="file"
          accept="image/*"
          onChange={(e) => setHeightMapFile(e.target.files?.[0] || null)}
        />
        {heightMapFile && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {heightMapFile.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="normal-map-upload">Normal Map (Optional)</Label>
        <Input
          id="normal-map-upload"
          type="file"
          accept="image/*"
          onChange={(e) => setNormalMapFile(e.target.files?.[0] || null)}
        />
        {normalMapFile && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {normalMapFile.name}
          </p>
        )}
      </div>

      <Button
        onClick={handleUpload}
        disabled={!jsonInput || isLoading}
        className="w-full"
      >
        {isLoading ? "Uploading..." : "Upload Board Data"}
      </Button>
    </div>
  );
};