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

interface RecordedAudio {
  id: string;
  speaker: string;
  emotion: string;
}

const AudioPlayControl = (props: { id: string }) => {
  const { id } = props;
  return (
    <audio
      controls
      crossOrigin="anonymous"
      src={`http://localhost:8000/audio_data/recorded/${id}`}
    />
  );
};

export const DemoRecorded = () => {
  const [loading, setLoading] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [sentences, setSentences] = useState<RecordedAudio[]>([]);

  useEffect(() => {
    async function fetchData() {
      const allIds = await axios
        .get<string[]>(`/audio_data_ids/recorded`, {
          baseURL: "http://localhost:8000",
        })
        .then((r) => r.data);

      setIds(allIds);

      setSentences(
        await Promise.all(
          allIds.map((id) =>
            axios
              .get<RecordedAudio>(`/audio_data/recorded/${id}/result`, {
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
            <TableCell align="left">Speaker</TableCell>
            <TableCell align="right">Emotion</TableCell>
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
              <TableCell align="left">{s.speaker}</TableCell>
              <TableCell align="right">{s.emotion}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
