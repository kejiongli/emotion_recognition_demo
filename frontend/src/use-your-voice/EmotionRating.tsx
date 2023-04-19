import * as React from "react";
import { styled } from "@mui/material/styles";
import Rating, { IconContainerProps } from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { Stack, Tooltip, Typography } from "@mui/material";

export enum EmotionType {
  ang = 1,
  sad,
  neu,
  hap,
}

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
    color: theme.palette.action.disabled,
  },
}));

const fontSize = "10rem";

export const emotionIcons = {
  [EmotionType.ang]: {
    icon: <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize }} />,
    label: "Angry",
  },
  [EmotionType.sad]: {
    icon: <SentimentDissatisfiedIcon color="error" sx={{ fontSize }} />,
    label: "Sad",
  },
  [EmotionType.neu]: {
    icon: <SentimentSatisfiedIcon color="warning" sx={{ fontSize }} />,
    label: "Neutral",
  },
  [EmotionType.hap]: {
    icon: <SentimentVerySatisfiedIcon color="success" sx={{ fontSize }} />,
    label: "Happy",
  },
};

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{emotionIcons[value as EmotionType].icon}</span>;
}

export const EmotionRating = (props: { value: EmotionType | null }) => {
  return (
    <StyledRating
      size={"large"}
      readOnly={true}
      defaultValue={2}
      value={props.value}
      max={4}
      IconContainerComponent={IconContainer}
      getLabelText={(value: number) =>
        value != null ? emotionIcons[value as EmotionType].label : ""
      }
      highlightSelectedOnly
    />
  );
};

export const EmotionIcon = (props: { value: EmotionType | null }) => {
  const { value } = props;
  if (!value) {
    return <></>;
  }

  return (
    <Stack direction={"row"} alignItems={"center"}>
      <Tooltip title={emotionIcons[value].label}>
        {emotionIcons[value].icon}
      </Tooltip>
      <Typography variant={"h2"}>{emotionIcons[value].label}</Typography>
    </Stack>
  );
};
