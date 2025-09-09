# MARC XML to Line MARC Converter

Hastily put together vanilla JS + HTML UI for converting MARC XML records to line MARC format using the [@biblioteksentralen/marc](https://www.npmjs.com/package/@biblioteksentralen/marc) package together with [@biblioteksentralen/xml-utils](https://www.npmjs.com/package/@biblioteksentralen/xml-utils).

URL: <https://biblioteksentralen.github.io/marc-converter/>

## Usage

1. Paste your MARC XML record into the input textarea
2. The line MARC output will appear automatically below if luck is on your side
3. Toggle between plain text and highlighted subfield display using the radio buttons

### Supported Input Formats

- **Single MARC record**: Direct `<record>` element
- **OAI-PMH or SRU envelope**: One or more records wrapped in `<records>`, `<ListRecords>` or
  `<GetRecord>`.

## Development

No build process is required. Simply open `index.html` in a web browser to run the application locally.

## Deployment

The application is deployed to GitHub Pages using GitHub Actions (see `.github/workflows/deploy.yml`).
