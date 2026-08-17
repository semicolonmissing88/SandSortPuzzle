const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * Expo Metro config is required for `export:embed` release builds
 * (serializer JSON format). Keep virtual-entry remap to our index.
 */
const config = getDefaultConfig(__dirname);

const previousResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === '.expo/.virtual-metro-entry' ||
    moduleName === './.expo/.virtual-metro-entry' ||
    (typeof moduleName === 'string' && moduleName.includes('virtual-metro-entry'))
  ) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'index.ts'),
    };
  }
  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
