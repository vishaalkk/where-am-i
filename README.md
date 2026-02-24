# where-am-i

This project uses [uv](https://github.com/astral-sh/uv) for dependency management.

## Setup

1.  Install `uv`: `curl -LsSf https://astral.sh/uv/install.sh | sh` (or `pip install uv`)
2.  Install dependencies: `uv sync`

## Running Locally

To start the development server:

```bash
uv run mkdocs serve -a localhost:8001
```

Open [http://localhost:8001](http://localhost:8001) in your browser.