# mdoc

Simple documentation format that can run without a server

## Features

- Simple document with an index of contents
- Edit only markdown files locally, no generator or compiler
- Cross-browser: works on IE11, Firefox, Safari, Chrome, Opera

## Demo

- [Sample](https://www.ionstage.org/mdoc/index.html)

## Quickstart guide

#### 1. Create markdown files under _doc_ folder

  - Use '.md' extension to recognize it as a document file
  - Set link to the other document with starting '#!'
    - e.g.) #!sample/sample2 (link to _doc/sample/sample2.md_)

#### 2. Edit _index.md_ and _top.md_

  - **index.md**: index of contents (left pane)
  - **top.md**: start page

#### 3. Open _index.html_ in a browser

That's it!

\* You need to configure settings to allow the browser to load local files

## License
&copy; 2015 iOnStage
Licensed under the MIT License.
