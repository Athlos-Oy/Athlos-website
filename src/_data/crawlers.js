// Explicit-allow list for AI / answer-engine crawlers in robots.txt.
// The wildcard User-agent: * already allows all; these are listed for
// clarity (some bots check for an explicit named entry before crawling).
//
// Add new ones at the bottom of the list to keep robots.txt diffs minimal.

export default [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "Meta-ExternalAgent",
];
