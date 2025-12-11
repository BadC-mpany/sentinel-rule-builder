import { LangChainTool, TaintClassDefinition } from "@/types";

export const taintClassDefinitions: TaintClassDefinition[] = [
  {
    className: "SAFE_READ",
    classificationRule:
      "Assign if the tool reads public, generic system info, or non-sensitive data. No private user data or secrets involved.",
    description: "Operations that retrieve data with zero confidentiality risk.",
    exampleFunctionName: "get_current_time",
    exampleFunctionDescription: "Returns the current system time in UTC.",
    necessity:
      "Prevents false positives by allowing the agent to gather harmless context without triggering security alerts.",
    color: "var(--taint-safe-read)",
  },
  {
    className: "SENSITIVE_READ",
    classificationRule:
      "Assign if the tool retrieves private user data, internal documents, secrets, or proprietary database records.",
    description:
      "Operations that access confidential information. Acts as a 'Taint Source'.",
    exampleFunctionName: "read_user_email",
    exampleFunctionDescription:
      "Fetches the body and metadata of a specific email message by ID.",
    necessity:
      "Identifies the entry point of sensitive data to immediately begin Taint tracking.",
    color: "var(--taint-sensitive-read)",
  },
  {
    className: "SAFE_WRITE",
    classificationRule:
      "Assign if the tool writes to ephemeral, local-only storage (scratchpads, temp files) that is not visible externally.",
    description:
      "Low-risk data storage used for intermediate reasoning or temporary caching.",
    exampleFunctionName: "write_to_scratchpad",
    exampleFunctionDescription:
      "Appends text to a temporary, session-scoped scratchpad file.",
    necessity:
      "Enables complex agent reasoning and state maintenance without risking external data leakage.",
    color: "var(--taint-safe-write)",
  },
  {
    className: "CONSEQUENTIAL_WRITE",
    classificationRule:
      "Assign if the tool sends data to external services, users, or modifies persistent system state (DB updates).",
    description:
      "External sinks or state-changing operations. Acts as a 'Taint Sink'.",
    exampleFunctionName: "send_slack_message",
    exampleFunctionDescription:
      "Posts a message to a public Slack channel visible to the team.",
    necessity:
      "The primary enforcement point to block exfiltration of Tainted data or unauthorized system modifications.",
    color: "var(--taint-consequential-write)",
  },
  {
    className: "UNSAFE_EXECUTE",
    classificationRule:
      "Assign if the tool runs arbitrary code, shell commands, or raw SQL queries.",
    description:
      "High-risk capabilities that allow broad, undefined system access.",
    exampleFunctionName: "python_repl",
    exampleFunctionDescription:
      "Executes arbitrary Python code in a sandboxed environment.",
    necessity:
      "Isolates 'God Mode' tools that require strict sandboxing and cannot be secured via simple input validation.",
    color: "var(--taint-unsafe-execute)",
  },
  {
    className: "HUMAN_VERIFY",
    classificationRule:
      "Assign if the tool performs irreversible, destructive, or high-value actions (financial, deletion).",
    description:
      "Critical actions where the cost of error is unacceptable.",
    exampleFunctionName: "delete_production_database",
    exampleFunctionDescription:
      "Permanently deletes the main production database cluster.",
    necessity:
      "Provides a mandatory 'human-in-the-loop' safety net for actions that automated rules cannot reliably judge.",
    color: "var(--taint-human-verify)",
  },
  {
    className: "SANITIZER",
    classificationRule:
      "Assign if the tool's explicit purpose is to remove sensitive data (PII, secrets) from an input.",
    description:
      "Transforms Tainted data into Clean data. Acts as a 'Taint Cleaner'.",
    exampleFunctionName: "redact_pii",
    exampleFunctionDescription:
      "Scans input text and replaces sensitive PII with generic placeholders.",
    necessity:
      "Allows the agent to safely export answers derived from sensitive sources by ensuring the output is de-identified.",
    color: "var(--taint-sanitizer)",
  },
];

export const langchainTools: LangChainTool[] = [
  // Search Tools
  {
    id: "tavily_search",
    name: "tavily_search",
    displayName: "Tavily Search",
    description: "AI-powered search engine that returns URL, content, title, images, and answers",
    category: "Search",
    taintClass: "SAFE_READ",
    isCommon: true,
    pricing: "Freemium",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query to look up" },
        max_results: { type: "string", description: "Maximum number of results to return" },
        include_images: { type: "string", description: "Whether to include images in results" },
      },
      required: ["query"],
    },
  },
  {
    id: "google_search",
    name: "google_search",
    displayName: "Google Search",
    description: "Search Google and get URL, snippet, and title results",
    category: "Search",
    taintClass: "SAFE_READ",
    isCommon: true,
    pricing: "Paid",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        num_results: { type: "string", description: "Number of results to return" },
      },
      required: ["query"],
    },
  },
  {
    id: "duckduckgo_search",
    name: "duckduckgo_search",
    displayName: "DuckDuckGo Search",
    description: "Free privacy-focused search returning URL, snippet, and title",
    category: "Search",
    taintClass: "SAFE_READ",
    isCommon: true,
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        max_results: { type: "string", description: "Maximum results to return" },
      },
      required: ["query"],
    },
  },
  {
    id: "brave_search",
    name: "brave_search",
    displayName: "Brave Search",
    description: "Free search engine returning URL, snippet, and title",
    category: "Search",
    taintClass: "SAFE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
  {
    id: "bing_search",
    name: "bing_search",
    displayName: "Bing Search",
    description: "Microsoft Bing search returning URL, snippet, and title",
    category: "Search",
    taintClass: "SAFE_READ",
    pricing: "Paid",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        count: { type: "string", description: "Number of results" },
      },
      required: ["query"],
    },
  },
  {
    id: "exa_search",
    name: "exa_search",
    displayName: "Exa Search",
    description: "Neural search returning URL, author, title, and published date",
    category: "Search",
    taintClass: "SAFE_READ",
    pricing: "Freemium",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        num_results: { type: "string", description: "Number of results" },
        use_autoprompt: { type: "string", description: "Use AI to improve query" },
      },
      required: ["query"],
    },
  },
  {
    id: "wikipedia",
    name: "wikipedia",
    displayName: "Wikipedia",
    description: "Search and retrieve Wikipedia articles",
    category: "Search",
    taintClass: "SAFE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        top_k_results: { type: "string", description: "Number of results to return" },
      },
      required: ["query"],
    },
  },
  {
    id: "arxiv",
    name: "arxiv",
    displayName: "ArXiv",
    description: "Search academic papers on arXiv",
    category: "Search",
    taintClass: "SAFE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query for papers" },
        max_results: { type: "string", description: "Maximum papers to return" },
      },
      required: ["query"],
    },
  },

  // File System Tools
  {
    id: "read_file",
    name: "read_file",
    displayName: "Read File",
    description: "Read the contents of a file from the file system",
    category: "File System",
    taintClass: "SENSITIVE_READ",
    isCommon: true,
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Path to the file to read" },
      },
      required: ["file_path"],
    },
  },
  {
    id: "write_file",
    name: "write_file",
    displayName: "Write File",
    description: "Write content to a file on the file system",
    category: "File System",
    taintClass: "SAFE_WRITE",
    isCommon: true,
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Path to the file to write" },
        content: { type: "string", description: "Content to write to the file" },
        append: { type: "string", description: "Whether to append instead of overwrite" },
      },
      required: ["file_path", "content"],
    },
  },
  {
    id: "list_directory",
    name: "list_directory",
    displayName: "List Directory",
    description: "List contents of a directory",
    category: "File System",
    taintClass: "SAFE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        directory_path: { type: "string", description: "Path to the directory" },
      },
      required: ["directory_path"],
    },
  },

  // Database Tools
  {
    id: "sql_database",
    name: "sql_database",
    displayName: "SQL Database",
    description: "Execute SQL queries on a database",
    category: "Database",
    taintClass: "SENSITIVE_READ",
    isCommon: true,
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "SQL query to execute" },
      },
      required: ["query"],
    },
  },
  {
    id: "sql_database_write",
    name: "sql_database_write",
    displayName: "SQL Database Write",
    description: "Execute write operations (INSERT, UPDATE, DELETE) on a database",
    category: "Database",
    taintClass: "CONSEQUENTIAL_WRITE",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "SQL write query to execute" },
      },
      required: ["query"],
    },
  },
  {
    id: "cassandra_database",
    name: "cassandra_database",
    displayName: "Cassandra Database",
    description: "Query Cassandra database with SELECT and schema introspection",
    category: "Database",
    taintClass: "SENSITIVE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "CQL query to execute" },
      },
      required: ["query"],
    },
  },

  // Communication Tools
  {
    id: "gmail_send",
    name: "gmail_send",
    displayName: "Gmail Send",
    description: "Send an email using Gmail",
    category: "Communication",
    taintClass: "CONSEQUENTIAL_WRITE",
    isCommon: true,
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject line" },
        body: { type: "string", description: "Email body content" },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    id: "gmail_read",
    name: "gmail_read",
    displayName: "Gmail Read",
    description: "Read emails from Gmail inbox",
    category: "Communication",
    taintClass: "SENSITIVE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Gmail search query" },
        max_results: { type: "string", description: "Maximum emails to return" },
      },
      required: ["query"],
    },
  },
  {
    id: "slack_send",
    name: "slack_send",
    displayName: "Slack Send Message",
    description: "Send a message to a Slack channel",
    category: "Communication",
    taintClass: "CONSEQUENTIAL_WRITE",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Slack channel name or ID" },
        message: { type: "string", description: "Message content to send" },
      },
      required: ["channel", "message"],
    },
  },
  {
    id: "twilio_sms",
    name: "twilio_sms",
    displayName: "Twilio SMS",
    description: "Send SMS messages via Twilio",
    category: "Communication",
    taintClass: "CONSEQUENTIAL_WRITE",
    pricing: "Paid",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient phone number" },
        body: { type: "string", description: "SMS message content" },
      },
      required: ["to", "body"],
    },
  },

  // Code Interpreter Tools
  {
    id: "python_repl",
    name: "python_repl",
    displayName: "Python REPL",
    description: "Execute Python code in a sandboxed environment",
    category: "Code Interpreter",
    taintClass: "UNSAFE_EXECUTE",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Python code to execute" },
      },
      required: ["code"],
    },
  },
  {
    id: "shell",
    name: "shell",
    displayName: "Shell (Bash)",
    description: "Execute shell commands",
    category: "Code Interpreter",
    taintClass: "UNSAFE_EXECUTE",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute" },
      },
      required: ["command"],
    },
  },
  {
    id: "riza_code_interpreter",
    name: "riza_code_interpreter",
    displayName: "Riza Code Interpreter",
    description: "Execute code in Python, JavaScript, PHP, or Ruby",
    category: "Code Interpreter",
    taintClass: "UNSAFE_EXECUTE",
    pricing: "Freemium",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Code to execute" },
        language: { type: "string", description: "Programming language" },
      },
      required: ["code", "language"],
    },
  },

  // Web Browsing Tools
  {
    id: "playwright",
    name: "playwright",
    displayName: "PlayWright Browser",
    description: "Automate browser interactions with Playwright",
    category: "Web Browsing",
    taintClass: "SAFE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to" },
        action: { type: "string", description: "Browser action to perform" },
      },
      required: ["url"],
    },
  },
  {
    id: "requests",
    name: "requests",
    displayName: "HTTP Requests",
    description: "Make HTTP requests to APIs",
    category: "Web Browsing",
    taintClass: "SAFE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to request" },
        method: { type: "string", description: "HTTP method (GET, POST, etc.)" },
        body: { type: "string", description: "Request body for POST/PUT" },
      },
      required: ["url"],
    },
  },

  // Productivity Tools
  {
    id: "github",
    name: "github",
    displayName: "GitHub Toolkit",
    description: "Interact with GitHub repositories, issues, and PRs",
    category: "Productivity",
    taintClass: "SENSITIVE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "GitHub action to perform" },
        repo: { type: "string", description: "Repository name" },
        query: { type: "string", description: "Search query or issue number" },
      },
      required: ["action", "repo"],
    },
  },
  {
    id: "github_write",
    name: "github_write",
    displayName: "GitHub Write",
    description: "Create issues, PRs, or push code to GitHub",
    category: "Productivity",
    taintClass: "CONSEQUENTIAL_WRITE",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "Write action (create_issue, create_pr, etc.)" },
        repo: { type: "string", description: "Repository name" },
        title: { type: "string", description: "Issue/PR title" },
        body: { type: "string", description: "Issue/PR body" },
      },
      required: ["action", "repo"],
    },
  },
  {
    id: "jira",
    name: "jira",
    displayName: "Jira Toolkit",
    description: "Interact with Jira issues and projects",
    category: "Productivity",
    taintClass: "SENSITIVE_READ",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "Jira action to perform" },
        project_key: { type: "string", description: "Jira project key" },
        query: { type: "string", description: "JQL query" },
      },
      required: ["action"],
    },
  },

  // Finance Tools
  {
    id: "alpha_vantage",
    name: "alpha_vantage",
    displayName: "Alpha Vantage",
    description: "Get stock market data and financial information",
    category: "Finance",
    taintClass: "SAFE_READ",
    pricing: "Freemium",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol" },
        function: { type: "string", description: "API function to call" },
      },
      required: ["symbol"],
    },
  },
  {
    id: "stripe",
    name: "stripe",
    displayName: "Stripe",
    description: "Process payments and manage Stripe transactions",
    category: "Finance",
    taintClass: "HUMAN_VERIFY",
    pricing: "Paid",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "Stripe action to perform" },
        amount: { type: "string", description: "Amount in cents" },
        currency: { type: "string", description: "Currency code" },
      },
      required: ["action"],
    },
  },

  // AI/ML Tools
  {
    id: "dalle",
    name: "dalle",
    displayName: "DALL-E Image Generator",
    description: "Generate images using DALL-E",
    category: "AI/ML",
    taintClass: "SAFE_WRITE",
    pricing: "Paid",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Image generation prompt" },
        size: { type: "string", description: "Image size (256x256, 512x512, 1024x1024)" },
      },
      required: ["prompt"],
    },
  },
  {
    id: "wolfram_alpha",
    name: "wolfram_alpha",
    displayName: "Wolfram Alpha",
    description: "Query Wolfram Alpha computational knowledge engine",
    category: "AI/ML",
    taintClass: "SAFE_READ",
    pricing: "Freemium",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Query for Wolfram Alpha" },
      },
      required: ["query"],
    },
  },

  // Utilities
  {
    id: "get_weather",
    name: "get_weather",
    displayName: "Get Weather",
    description: "Fetch current weather information for a location",
    category: "Utilities",
    taintClass: "SAFE_READ",
    pricing: "Freemium",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string", description: "City name or coordinates" },
        units: { type: "string", description: "Temperature units (celsius or fahrenheit)" },
      },
      required: ["location"],
    },
  },
  {
    id: "human_input",
    name: "human_input",
    displayName: "Human Input",
    description: "Request input from a human user",
    category: "Utilities",
    taintClass: "HUMAN_VERIFY",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Question to ask the human" },
      },
      required: ["prompt"],
    },
  },
  {
    id: "redact_pii",
    name: "redact_pii",
    displayName: "Redact PII",
    description: "Scan and redact personally identifiable information from text",
    category: "Utilities",
    taintClass: "SANITIZER",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to scan for PII" },
        replacement: { type: "string", description: "Replacement text for PII" },
      },
      required: ["text"],
    },
  },
  {
    id: "delete_database",
    name: "delete_database",
    displayName: "Delete Database",
    description: "Permanently delete a database or table",
    category: "Database",
    taintClass: "HUMAN_VERIFY",
    pricing: "Free",
    inputSchema: {
      type: "object",
      properties: {
        database_name: { type: "string", description: "Name of database to delete" },
        confirm: { type: "string", description: "Confirmation string" },
      },
      required: ["database_name", "confirm"],
    },
  },
];

// Common tools for quick access
export const commonTools = langchainTools.filter((tool) => tool.isCommon);

// Get tools by category
export const getToolsByCategory = (category: string) =>
  langchainTools.filter((tool) => tool.category === category);

// Get tool categories
export const toolCategories = [...new Set(langchainTools.map((tool) => tool.category))];

// Search tools
export const searchTools = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return langchainTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.displayName.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
  );
};


