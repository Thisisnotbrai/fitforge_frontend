/**
 * Application Configuration
 * Contains environment-specific settings and API configurations
 * along with validation utilities
 */

const config = {
  openRouter: {
    apiKey:
      "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",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
  },
};

export const validateConfig = () => {
  const warnings = [];

  // Check if the API key is set
  if (!config.openRouter?.apiKey || config.openRouter.apiKey === 'YOUR_API_KEY_HERE') {
    warnings.push('OpenRouter API key is not configured');
  }

  // Log any warnings
  if (warnings.length > 0) {
    console.warn('Configuration Warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
  }

  // Return true to allow the application to continue
  return true;
};

export default config; 