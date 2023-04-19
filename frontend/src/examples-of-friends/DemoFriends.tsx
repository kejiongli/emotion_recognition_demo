import {
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface FriendsSentence {
  id: string;
  speaker: string;
  utterance: string;
  emotion: string;
  speechBrain: string;
}

const AudioPlayControl = (props: { id: string }) => {
  const { id } = props;
  return (
    <audio
      controls
      crossOrigin="anonymous"
      src={`http://localhost:8000/audio_data/meld/${id}`}
    />
  );
};

// manually picked audio files
const ids = [
  "dia37_utt4",
  "dia17_utt26",
  "dia36_utt1",
  "dia111_utt3",
  "dia167_utt0",
  "dia199_utt12",
  "dia49_utt14",
  "dia8_utt1",
  "dia270_utt10",
  "dia25_utt1",
  "dia9_utt17",
];

export const DemoFriends = () => {
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState<FriendsSentence[]>([]);

  useEffect(() => {
    async function fetchData() {
      setSentences(
        await Promise.all(
          ids.map((id) =>
            axios
              .get<FriendsSentence>(`/audio_data/meld/${id}/result`, {
                baseURL: "http://localhost:8000",
              })
              .then((r) => r.data)
          )
        )
      );
      setLoading(false);
    }

    setLoading(true);
    fetchData();
  }, []);

  if (loading) {
    return (
      <Stack sx={{ padding: 5 }} alignItems={"center"}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Audio</TableCell>
            <TableCell>Speaker</TableCell>
            <TableCell>Utterance</TableCell>
            <TableCell align="right">Emotion</TableCell>
            <TableCell align="right">Result</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sentences.map((s) => (
            <TableRow
              key={s.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <AudioPlayControl id={s.id} />
              </TableCell>
              <TableCell align="right">{s.speaker}</TableCell>
              <TableCell component="th" scope="row">
                {s.utterance}
              </TableCell>
              <TableCell align="right">{s.emotion}</TableCell>
              <TableCell align="right">{s.speechBrain}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
