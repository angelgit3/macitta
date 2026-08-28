from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf


ROOT = Path(__file__).resolve().parents[2]
AUDIO_DIR = ROOT / "apps/web/public/audio/toefl-listening"
BANK_PATH = ROOT / "scripts/listening-audio/listening-bank.json"
CATALOG_PATH = ROOT / "packages/shared/src/listeningBank.ts"


def main() -> None:
    parser = argparse.ArgumentParser(description="Audita los MP3 publicados de Listening.")
    parser.add_argument("--sync-durations", action="store_true", help="Actualiza duration_seconds con la duración real redondeada.")
    args = parser.parse_args()

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    expected_ids = [unit["id"] for unit in bank["units"]]
    actual_ids = sorted(path.stem for path in AUDIO_DIR.glob("*.mp3"))
    if sorted(expected_ids) != actual_ids:
        raise SystemExit("Los IDs del banco canónico y los MP3 publicados no coinciden.")

    durations: dict[str, int] = {}
    failures: list[str] = []
    for unit_id in expected_ids:
        path = AUDIO_DIR / f"{unit_id}.mp3"
        audio, sample_rate = sf.read(path, always_2d=True)
        duration = len(audio) / sample_rate
        peak = float(np.max(np.abs(audio)))
        rms = float(np.sqrt(np.mean(audio * audio)))
        durations[unit_id] = round(duration)
        if sample_rate != 24_000:
            failures.append(f"{unit_id}: sample rate {sample_rate}")
        if audio.shape[1] != 1:
            failures.append(f"{unit_id}: {audio.shape[1]} canales")
        if duration < 5:
            failures.append(f"{unit_id}: duración {duration:.2f}s")
        if peak >= 0.99:
            failures.append(f"{unit_id}: posible clipping ({peak:.3f})")
        if rms < 0.03 or rms > 0.25:
            failures.append(f"{unit_id}: RMS fuera de rango ({rms:.3f})")

    if failures:
        raise SystemExit("\n".join(failures))

    if args.sync_durations:
        source = CATALOG_PATH.read_text(encoding="utf-8")
        changed = 0
        for unit_id, duration in durations.items():
            pattern = re.compile(
                rf'(\b(?:quick|long)\(\s*"{re.escape(unit_id)}"[\s\S]*?,\s*)(\d+)(\s*,?\s*\))'
            )
            source, count = pattern.subn(rf"\g<1>{duration}\g<3>", source, count=1)
            changed += count
        if changed != len(expected_ids):
            raise SystemExit(f"Solo se sincronizaron {changed}/{len(expected_ids)} duraciones.")
        CATALOG_PATH.write_text(source, encoding="utf-8")

    print(
        f"OK: {len(expected_ids)} MP3 decodificables, mono/24 kHz, "
        "sin clipping ni niveles RMS anómalos."
    )


if __name__ == "__main__":
    main()
