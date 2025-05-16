/**
 * Config Validator
 * This utility validates configuration settings and provides warnings for missing values
 */

import config from './config';

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

export default validateConfig;