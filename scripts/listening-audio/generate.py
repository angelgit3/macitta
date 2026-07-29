from __future__ import annotations

import argparse
import json
import os
import subprocess
import tempfile
import warnings
from pathlib import Path
from typing import Any

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

import imageio_ffmpeg
import numpy as np
import soundfile as sf
from kokoro import KPipeline

warnings.filterwarnings(
    "ignore",
    message="dropout option adds dropout after all but last recurrent layer",
)
warnings.filterwarnings(
    "ignore",
    message="`torch.nn.utils.weight_norm` is deprecated",
)

SAMPLE_RATE = 24_000
DEFAULT_VOICE = "af_heart"
DEFAULT_OUTPUT = Path(__file__).parent / "output" / "kokoro-demo.mp3"

RECOMMENDED_VOICES = {
    "US female": ["af_heart", "af_bella", "af_nicole"],
    "US male": ["am_michael", "am_fenrir", "am_puck"],
    "UK female": ["bf_emma", "bf_isabella"],
    "UK male": ["bm_george", "bm_fable"],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate TOEFL listening audio locally with Kokoro."
    )
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--text", help="Text for a single-speaker clip.")
    source.add_argument(
        "--script",
        type=Path,
        help="JSON file containing a segments array with text and voice fields.",
    )
    source.add_argument(
        "--bank",
        type=Path,
        help="JSON array of named scripts to generate in one local batch.",
    )
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--gap-ms", type=int, default=260)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory for --bank MP3 files. Each item must provide an id.",
    )
    parser.add_argument(
        "--list-voices",
        action="store_true",
        help="Print the recommended English voice set and exit.",
    )
    return parser.parse_args()


def read_segments(args: argparse.Namespace) -> tuple[list[dict[str, Any]], int]:
    if args.script:
        payload = json.loads(args.script.read_text(encoding="utf-8"))
        segments = payload.get("segments")
        if not isinstance(segments, list) or not segments:
            raise ValueError("The JSON script needs a non-empty 'segments' array.")
        gap_ms = int(payload.get("gap_ms", args.gap_ms))
        return segments, gap_ms

    text = args.text or (
        "The library will remain open until ten o'clock during final exams. "
        "What does the speaker imply?"
    )
    return [{"voice": args.voice, "text": text, "speed": args.speed}], args.gap_ms


def synthesize_segment(pipeline: KPipeline, text: str, voice: str, speed: float) -> np.ndarray:
    chunks: list[np.ndarray] = []
    for _, _, audio in pipeline(text, voice=voice, speed=speed, split_pattern=r"\n+"):
        chunks.append(np.asarray(audio, dtype=np.float32))

    if not chunks:
        raise RuntimeError(f"Kokoro returned no audio for voice '{voice}'.")

    return np.concatenate(chunks)


def render_audio(
    segments: list[dict[str, Any]], gap_ms: int, output: Path, pipelines: dict[str, KPipeline] | None = None
) -> Path:
    pipelines = pipelines if pipelines is not None else {}
    silence = np.zeros(int(SAMPLE_RATE * gap_ms / 1000), dtype=np.float32)
    rendered: list[np.ndarray] = []

    for index, segment in enumerate(segments):
        text = str(segment.get("text", "")).strip()
        if not text:
            raise ValueError(f"Segment {index + 1} has no text.")

        voice = str(segment.get("voice", DEFAULT_VOICE))
        speed = float(segment.get("speed", 1.0))
        lang_code = str(segment.get("lang_code", voice[0] if voice else "a"))
        if lang_code not in {"a", "b"}:
            raise ValueError(
                f"Segment {index + 1} uses unsupported English lang_code '{lang_code}'."
            )
        if lang_code not in pipelines:
            pipelines[lang_code] = KPipeline(
                lang_code=lang_code, repo_id="hexgrad/Kokoro-82M"
            )
        pipeline = pipelines[lang_code]
        rendered.append(synthesize_segment(pipeline, text, voice, speed))
        if index < len(segments) - 1:
            rendered.append(silence)

    audio = np.concatenate(rendered)
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    if output.suffix.lower() == ".wav":
        sf.write(output, audio, SAMPLE_RATE, subtype="PCM_16")
        return output

    if output.suffix.lower() != ".mp3":
        raise ValueError("Output must use a .wav or .mp3 extension.")

    with tempfile.TemporaryDirectory(prefix="macitta-audio-") as temp_dir:
        temp_wav = Path(temp_dir) / "source.wav"
        sf.write(temp_wav, audio, SAMPLE_RATE, subtype="PCM_16")
        command = [
            imageio_ffmpeg.get_ffmpeg_exe(),
            "-y",
            "-i",
            str(temp_wav),
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=11",
            "-ac",
            "1",
            "-ar",
            str(SAMPLE_RATE),
            "-b:a",
            "96k",
            str(output),
        ]
        subprocess.run(command, check=True, capture_output=True)

    return output


def render_bank(bank_path: Path, output_dir: Path, default_gap_ms: int) -> list[Path]:
    payload = json.loads(bank_path.read_text(encoding="utf-8"))
    entries = payload.get("units", payload) if isinstance(payload, dict) else payload
    if not isinstance(entries, list) or not entries:
        raise ValueError("The bank JSON needs a non-empty array or a 'units' array.")

    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    pipelines: dict[str, KPipeline] = {}
    outputs: list[Path] = []
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            raise ValueError(f"Bank item {index + 1} must be an object.")
        unit_id = str(entry.get("id", "")).strip()
        if not unit_id or Path(unit_id).name != unit_id or not unit_id.replace("-", "").replace("_", "").isalnum():
            raise ValueError(f"Bank item {index + 1} has an invalid id.")
        segments = entry.get("segments")
        if not isinstance(segments, list) or not segments:
            raise ValueError(f"Bank item '{unit_id}' needs segments.")
        output = output_dir / f"{unit_id}.mp3"
        outputs.append(render_audio(segments, int(entry.get("gap_ms", default_gap_ms)), output, pipelines))
    return outputs


def main() -> None:
    args = parse_args()
    if args.list_voices:
        for label, voices in RECOMMENDED_VOICES.items():
            print(f"{label}: {', '.join(voices)}")
        return

    if args.bank:
        if not args.output_dir:
            raise ValueError("--bank requires --output-dir.")
        outputs = render_bank(args.bank, args.output_dir, args.gap_ms)
        print(f"Generated {len(outputs)} listening files in {args.output_dir.resolve()}")
        return

    segments, gap_ms = read_segments(args)
    output = render_audio(segments, gap_ms, args.output)
    duration = sf.info(output).duration
    print(f"Generated {output} ({duration:.1f}s)")


if __name__ == "__main__":
    main()
