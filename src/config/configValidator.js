/**
 
Config Validator*,
This utility validates that the config.js file exists and has been properly set up,
by displaying helpful error messages if it's missing or using default values.*/

import config from "./config.js";

export const validateConfig = () => {
  // Check if the API key is still the default from config.example.js
  if (config.openRouter.apiKey === "YOUR_API_KEY_HERE") {
    console.error(
      "%c[Config Error] You are using the default API key from config.example.js",
      "color: red; font-weight: bold; font-size: 14px;"
    );
    console.error(
      "%cPlease follow the instructions in src/config/config.example.js to set up your config.js file correctly",
      "color: red; font-size: 12px;"
    );

    return false;
  }

  // Everything looks good
  return true;
};

export default validateConfig;