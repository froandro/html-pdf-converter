# HTML to PDF Converter

A client-side HTML to PDF conversion tool using jsPDF and html2canvas, with Microlink.io integration for high-quality conversions.

## Features

- Convert URLs to PDF using Microlink.io API
- Convert local HTML files to PDF
- Convert raw HTML code to PDF
- Multiple page sizes and orientation options
- Customizable margins and viewport settings
- CORS-friendly alternative conversion method

## Technologies

- jsPDF
- html2canvas
- DOMPurify
- Microlink.io API

## Usage

Open `1.html` in a modern browser and follow the interface.

## Note

Due to browser CORS restrictions, external URL conversion works best via Microlink.io API. The tool includes fallback methods using CORS proxies.
