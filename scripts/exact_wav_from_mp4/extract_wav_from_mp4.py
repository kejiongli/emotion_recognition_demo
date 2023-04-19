import subprocess
from pathlib import Path

if __name__ == "__main__":
    input_dir = Path(__file__).parent.parent.parent / "backend" / "RecordedAudio" / "audio_files_raw"

    output_dir = Path(__file__).parent.parent.parent / "backend" / "RecordedAudio" / "audio_files"
    output_dir.mkdir(exist_ok=True, parents=True)

    for f in Path(input_dir).glob(
            "*.wav"
    ):
        of = output_dir / f"{f.stem}.wav"
        command = f"ffmpeg -i {f} -ab 160k -ac 2 -ar 44100 -vn {of}"
        # command = ["ffmpeg", "-i", str(f), "-c:a", "pcm_f32le", str(of)]

        subprocess.run(command, shell=True)
