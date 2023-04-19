import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import { DemoUseRecorder } from "./use-your-voice/DemoUseRecorder";
import { DemoRecorded } from "./examples-of-recorded/DemoRecorded";
import { DemoFriends } from "./examples-of-friends/DemoFriends";

function App() {
  const [index, setIndex] = useState(1);

  return (
    <Container maxWidth={"md"}>
      <Typography variant={"h1"} sx={{ my: 5 }}>
        Emotion Recognition
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          centered
          value={index}
          onChange={(e, v) => setIndex(v)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Use your voice" />
          <Tab label="Audio from Friends" />
          <Tab label="Recorded Audio" />
        </Tabs>
      </Box>
      {index === 0 && <DemoUseRecorder />}
      {index === 1 && <DemoFriends />}
      {index === 2 && <DemoRecorded />}
    </Container>
  );
}

export default App;
