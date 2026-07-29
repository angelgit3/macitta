# Local listening audio generator

This tool generates TOEFL listening audio locally with Kokoro-82M. It does not
use a paid API or require an API key.

## First-time setup

From the repository root:

```powershell
npm run audio:setup
```

The command creates an isolated Python 3.12 environment inside this directory.
The first setup downloads roughly 500 MB of local runtime and model data.

## Generate the included example

```powershell
npm run audio:demo
```

The MP3 is written to `scripts/listening-audio/output/kokoro-demo.mp3`.

## Generate a single voice

```powershell
npm.cmd run audio:generate -- --text "What does the woman imply?" --voice af_heart --output scripts/listening-audio/output/question.mp3
```

Use `npm.cmd` when passing custom arguments from PowerShell; its `npm.ps1`
launcher can consume arguments after `--` on some Windows installations.

## Generate a multi-speaker script

Create a JSON file with one entry per turn:

```json
{
  "gap_ms": 280,
  "segments": [
    {
      "speaker": "student",
      "voice": "af_heart",
      "text": "Did Professor Lee postpone the assignment?"
    },
    {
      "speaker": "classmate",
      "voice": "am_michael",
      "text": "Only for the students attending the field trip."
    }
  ]
}
```

Then pass it with `--script`. Each segment may define `voice`, `text`, and an
optional `speed`.

## Generate a complete local bank

```powershell
npm.cmd run audio:generate -- --bank scripts/listening-audio/listening-bank.json --output-dir apps/web/public/audio/toefl-listening
```

The batch reuses the local model, assigns the voices declared for each turn and
creates one versioned MP3 per listening unit.

## Recommended English voices

```powershell
npm run audio:voices
```

Generated working files and the local Python environment are ignored by Git.
