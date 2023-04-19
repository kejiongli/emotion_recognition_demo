import {IconButton, Stack, Tooltip, Typography} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import {blue, red} from "@mui/material/colors";
import React, {useCallback, useEffect, useState,} from "react";
import {ReactMic} from "react-mic";
import {useReactMediaRecorder} from "react-media-recorder";

/*
There was issue: the first 1.5 seconds of recorded audio is always lost. In that case, the DELAY is set to 1500 ms
 */
const DELAY = 0;

interface RecorderProps {
  setBlobUrl: (b: string | undefined) => void;
  setLoading: (l: boolean) => void;
}

export const Recorder = (props: RecorderProps) => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
    });

  useEffect(() => {
    props.setBlobUrl(mediaBlobUrl);
  }, [mediaBlobUrl]);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = useCallback(() => {
    props.setBlobUrl(undefined);
    setLoading(true);
    props.setLoading(true);
    startRecording();
    setTimeout(() => {
      props.setLoading(false);
      setLoading(false);
      setRecording(true);
    }, DELAY);
  }, [startRecording]);

  const stop = useCallback(() => {
    stopRecording();
    setRecording(false);
  }, [stopRecording]);

  return (
    <Stack alignItems={"center"}>
      <Stack direction={"row"} alignItems={"center"} spacing={2}>
        <Tooltip
          title={
            recording ? "Click to stop recording" : "Click to start recording"
          }
        >
          <IconButton
            onClick={() => {
              if (recording) {
                stop();
              } else {
                start();
              }
            }}
          >
            {recording ? (
              <MicIcon sx={{ fontSize: "10rem", color: red[500] }} />
            ) : (
              <MicIcon
                sx={{ fontSize: "10rem", color: blue[500], border: "1px" }}
              />
            )}
          </IconButton>
        </Tooltip>
        <Typography variant={"h2"}>
          {loading
            ? "Getting device ready..."
            : recording
            ? "Recording. Click to stop "
            : "Click to start recording"}
        </Typography>
      </Stack>

      {!recording && mediaBlobUrl && (
        <audio src={mediaBlobUrl} controls autoPlay />
      )}
    </Stack>
  );
};
export const RecorderVisualizer = (props: RecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  return (
    <Stack alignItems={"center"} gap={2}>
      <IconButton onClick={() => setRecording((curr) => !curr)}>
        <MicIcon
          sx={{ fontSize: "10rem", color: recording ? red[500] : blue[500] }}
        />
      </IconButton>

      <ReactMic
        record={recording}
        visualSetting={"sinewave"}
        onStop={(e) => {
          setBlobUrl(e.blobURL);
          props.setBlobUrl(e.blobURL);
        }}
        strokeColor="#000000"
        backgroundColor="#FF4081"
        noiseSuppression={true}
      />
      {blobUrl && <audio src={blobUrl} controls autoPlay></audio>}
    </Stack>
  );
};
