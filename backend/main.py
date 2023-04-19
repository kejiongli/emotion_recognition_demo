import json
import os
import subprocess
import tempfile
from contextlib import contextmanager
from functools import lru_cache
from os import PathLike
from pathlib import Path
from typing import Union, Dict

import pandas as pd
import uvicorn
from fastapi import FastAPI, UploadFile, File
from speechbrain.pretrained.interfaces import foreign_class
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from typing_extensions import Annotated

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@contextmanager
def chdir_ctx(target_dir: PathLike):
    cwd = os.getcwd()
    try:
        os.chdir(target_dir)
        yield
    finally:
        os.chdir(cwd)


@app.get("/")
async def root():
    return {"message": "Hello World"}


classifier = foreign_class(
    source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP",
    pymodule_file="custom_interface.py",
    classname="CustomEncoderWav2vec2Classifier",
)


def classify_file(audio_file) -> str:
    out_prob, score, index, text_lab = classifier.classify_file(str(audio_file))
    return text_lab[0]


@app.post("/analyse")
async def analyse(file: Annotated[UploadFile, File()]):
    with tempfile.TemporaryDirectory() as temp_dir_name:
        temp_dir = Path(temp_dir_name)

        # save as file so that ffmpeg can process
        webm_file = temp_dir / "audio.webm"
        webm_file.write_bytes(await file.read())

        # convert to .wav
        wav_file = temp_dir / "audio.wav"
        cmd = ["ffmpeg", "-i", str(webm_file), "-c:a", "pcm_f32le", str(wav_file)]
        subprocess.run(cmd)

        emo = classify_file(wav_file)
        return {"label": emo}


@app.get("/audio_data_ids/{typ}")
def get_audio_ids(typ: str):
    if typ == "recorded":
        audio_dir = Path(__file__).parent / 'RecordedAudio' / 'audio_files'
        return [f.stem for f in audio_dir.glob('*.wav')]
    else:
        raise FileNotFoundError(f"Unsupported audio type {typ}")


@app.get("/audio_data/{typ}/{id}")
def get_audio_data(typ: str, id: str):
    if typ == "meld":
        audio_dir = Path(__file__).parent / "MELD" / "audio_files"
    elif typ == "recorded":
        audio_dir = Path(__file__).parent / "RecordedAudio" / "audio_files"
    else:
        raise FileNotFoundError(f"Unknown audio type {typ}")
    return FileResponse(audio_dir / f"{id}.wav")


@lru_cache()
def data_result(typ: str) -> Union[pd.DataFrame, Dict]:
    if typ == "meld":
        return pd.read_csv(
            Path(__file__).parent / "MELD" / "all.csv", encoding="ISO-8859-1"
        )
    elif typ == "recorded":
        with open(
                Path(__file__).parent / "RecordedAudio" / "all.json"
        ) as fp:
            return json.load(fp)
    else:
        raise FileNotFoundError(f"Unknown audio type {typ}")


@app.get("/audio_data/meld/{id}/result")
def get_meld_data_result(id: str):
    dia, utt = id.split("_")
    dia = int(dia[3:])
    utt = int(utt[3:])
    df = data_result("meld")
    cond = (df["Utterance_ID"] == utt) & (df["Dialogue_ID"] == dia)
    row = df[cond].iloc[0]
    return {
        "id": id,
        "speaker": row["Speaker"],
        "utterance": row["Utterance"],
        "emotion": row["Emotion"],
        "speechBrain": row["SpeechBrain"],
    }


@app.get("/audio_data/recorded/{id}/result")
def get_recorded_data_result(id: str):
    f = Path(__file__).parent / 'RecordedAudio' / f"{id}.json"
    if not f.exists():
        audio_file = Path(__file__).parent / 'RecordedAudio' / 'audio_files' / f"{id}.wav"
        try:
            emo = classify_file(audio_file)
        except RuntimeError:
            prev_audio = audio_file.rename(audio_file.with_name('prev' + audio_file.name))
            command = f"ffmpeg -i {prev_audio} -ab 160k -ac 2 -ar 44100 -vn -y {audio_file}"
            subprocess.run(command, shell=True)
            prev_audio.unlink()
            emo = classify_file(audio_file)
        with f.open('w') as fp:
            json.dump({'speaker': id.split('_')[0], 'emotion': emo}, fp)

    with f.open() as fp:
        result = json.load(fp)
        return {"id": id, "speaker": result['speaker'], "emotion": result["emotion"]}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
