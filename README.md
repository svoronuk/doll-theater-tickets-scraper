# Doll Theater Tickets Scraper

A Node.js application that monitors the Doll Theater website for ticket availability and sends notifications via Telegram when tickets are found.

## Features

-   Monitors Doll Theater website for ticket availability
-   Sends Telegram notifications when tickets are found
-   Runs on a schedule (every minute)
-   Built with TypeScript and functional programming principles

## Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   Telegram Bot Token
-   Telegram Chat ID

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/svoronuk/doll-theater-tickets-scraper.git
    cd doll-theater-tickets-scraper
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file with the following variables:

    ```
    TELEGRAM_BOT_TOKEN=your_bot_token_here
    TELEGRAM_CHAT_ID=your_chat_id_here
    TARGET_URL=your_target_website_url_here
    SCRAPING_INTERVAL=60000
    ```

4. Run the application:

    ```bash
    # Development
    npm run dev

    # Production
    npm run build
    npm start
    ```

## Deployment

This project is configured for deployment on Render.com:

1. Create a new Web Service
2. Connect your GitHub repository
3. Set the following:
    - Build Command: `npm install && npm run build`
    - Start Command: `npm start`
4. Add environment variables from `.env` file

## Development

-   `npm run dev` - Run in development mode
-   `npm run build` - Build the project
-   `npm start` - Run in production mode

## License

ISC # doll-theater-tickets-scraper git init git add README.md git commit -m first commit git branch -M main git remote add origin https://github.com/svoronuk/doll-theater-tickets-scraper.git git push -u origin main
