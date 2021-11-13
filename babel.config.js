module.exports = function(api) {
  api.cache(true);
  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@api': './app/api',
          '@assets': './shared/assets',
          '@constants': './app/constants',
          '@contexts': './app/contexts',
          '@components': './app/components',
          '@environment': './shared/environment',
          '@hooks': './app/hooks',
          '@shared-api': './shared/api',
          '@shared-types': './shared/types',
          '@screens': './app/screens',
          '@store': './shared/store',
          '@translations': './shared/translations',
          '@tailwind': './app/tailwind'
        }
      }
    ],
    'react-native-reanimated/plugin',
    'react-native-paper/babel'
  ]

  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: plugins,
      },
    },
    plugins: plugins
  };
};
