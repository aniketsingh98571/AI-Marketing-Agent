# Marketing Agent

A Node.js API service that scrapes web content and generates LinkedIn marketing posts using Google's Gemini AI. The service analyzes website content and creates engaging social media posts based on specified topics and target audiences.

## Features

- 🌐 **Web Scraping**: Extract content from any website URL
- 🤖 **AI-Powered Content Generation**: Uses Google Gemini AI to create LinkedIn posts
- 📝 **Topic-Based Marketing**: Generate content focused on specific topics and audiences
- 🔍 **Web Search Integration**: Leverages Google Search for trending topics and insights
- ⚡ **Fast Processing**: Optimized for quick content generation

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Google Gemini API key

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd procedure-marketing-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up your Google Gemini API key**

   Get your API key from [Google AI Studio](https://aistudio.google.com/welcome?utm_source=google&utm_medium=cpc&utm_campaign=FY25-global-DR-gsem-BKWS-1710442&utm_content=text-ad-none-any-DEV_c-CRE_726176676881-ADGP_Hybrid%20%7C%20BKWS%20-%20EXA%20%7C%20Txt-AI%20Studio-AI%20Studio-KWID_1276544732073-kwd-1276544732073&utm_term=KW_google%20ai%20studio-ST_google%20ai%20studio&gclsrc=aw.ds&gad_source=1&gad_campaignid=21030195286&gbraid=0AAAAACn9t67loO61JuIv1wRw6q_lK_OJs&gclid=EAIaIQobChMIqO3ah7r-jwMVQn8PAh125heMEAAYASAAEgKm_PD_BwE)

   Then update the `gemini_key` variable in `server.js`:

   ```javascript
   const gemini_key = "YOUR_GEMINI_API_KEY_HERE";
   ```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

### API Endpoints

#### POST `/scrape`

Scrapes a website and generates a LinkedIn marketing post based on the provided topic information.

**Request Body:**

```json
{
  "url": "https://example.com",
  "rendered": false,
  "post_topic": {
    "topic": "AI Engineering",
    "focus": "AI Agents, MCP, langchain",
    "audience_regions": ["US", "India"]
  }
}
```

**Parameters:**

- `url` (required): The website URL to scrape
- `rendered` (optional): Whether to render JavaScript (default: false)
- `post_topic` (required): Object containing:
  - `topic`: Main topic for the marketing post
  - `focus`: Specific focus areas or technologies
  - `audience_regions`: Array of target audience regions

**Response:**

```json
{
  "ok": true,
  "url": "https://example.com",
  "html": "<html>...</html>",
  "text": "Extracted text content...",
  "modelResponse": "AI-generated search queries and insights...",
  "post": "Generated LinkedIn post in Markdown format"
}
```

### Example Usage

```bash
curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://procedure.tech/services/ai-engineering",
    "rendered": false,
    "post_topic": {
      "topic": "AI Engineering",
      "focus": "AI Agents, MCP, langchain",
      "audience_regions": ["US", "India"]
    }
  }'
```

## Project Structure

```
procedure-marketing-bot/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── .gitignore            # Git ignore rules
└── node_modules/         # Dependencies
```

## How It Works

1. **Web Scraping**: The service fetches the HTML content from the provided URL
2. **Content Extraction**: Removes scripts, styles, and HTML tags to get clean text
3. **AI Analysis**: Uses Google Gemini AI to generate relevant search queries and insights based on the topic
4. **Post Generation**: Creates a LinkedIn marketing post that combines the scraped content with AI-generated insights
5. **Response**: Returns the generated post along with the original scraped data

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)

### Google Gemini Configuration

The service uses Google's Gemini 2.5 Flash model with the following features:

- Web search grounding tool
- Thinking budget configuration
- System instructions for marketing content generation

## Error Handling

The API returns appropriate HTTP status codes and error messages for:

- Invalid URLs (400)
- Missing required fields (400)
- Server errors (500)
- Upstream API errors (500)

## Development

### Adding New Features

1. The current implementation supports basic web scraping
2. Puppeteer integration is commented out but can be enabled for JavaScript-heavy sites
3. Additional AI models or content formats can be added by extending the configuration

### Testing

Currently, no automated tests are configured. Manual testing can be done using:

- curl commands
- Postman or similar API testing tools
- Direct HTTP requests from your application

## Dependencies

- **express**: Web framework for Node.js
- **axios**: HTTP client for making requests
- **@google/genai**: Google Gemini AI SDK

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please create an issue in the repository or contact the development team.
