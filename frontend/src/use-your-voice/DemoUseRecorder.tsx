import React, { useCallback, useEffect, useState } from "react";
import { EmotionIcon, EmotionType } from "./EmotionRating";
import axios from "axios";
import { Backdrop, Button, CircularProgress, Stack } from "@mui/material";
import { Recorder } from "./Recorder";

export const DemoUseRecorder = () => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>();

  const [value, setValue] = useState<EmotionType | null>(null);
  useEffect(() => {
    setValue(null);
  }, [blobUrl]);

  const getEmotion = useCallback(async () => {
    if (!blobUrl) {
      return;
    }

    setProcessing(true);
    setValue(null);

    const blob = await fetch(blobUrl).then((r) => r.blob());
    const file = new File([blob], "audio_file");

    const formData = new FormData();
    formData.append("file", file, file.name);

    const value = await axios
      .post<{ label: keyof typeof EmotionType }>("/analyse", formData, {
        baseURL: "http://localhost:8000",
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => {
        return EmotionType[r.data.label as keyof typeof EmotionType];
      });

    setValue(value);
    setProcessing(false);
  }, [blobUrl]);

  return (
    <Stack gap={4} alignItems={"center"} sx={{ mt: 2 }}>
      <Backdrop open={loading} sx={{ zIndex: 1 }} />
      <Recorder setBlobUrl={setBlobUrl} setLoading={setLoading} />
      {blobUrl && (
        <>
          <Button
            variant="outlined"
            onClick={() => getEmotion()}
            disabled={processing}
          >
            Use this audio
          </Button>
          {processing ? (
            <CircularProgress color="secondary" />
          ) : (
            <>
              <EmotionIcon value={value} />
            </>
          )}
        </>
      )}
    </Stack>
  );
};
