# Enjoying the Film

A static site for movie reviews, music, shows, and other film-related content.

## View the Site Locally

Python 3 is required. From the project directory, run:

```bash
./serve.sh
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

The local server is needed because the site loads HTML partials and review data with `fetch()`.

## Use Another Port

Set the `PORT` environment variable before starting the server:

```bash
PORT=8080 ./serve.sh
```

Then open [http://localhost:8080](http://localhost:8080).

Press `Ctrl+C` in the terminal to stop the server.
