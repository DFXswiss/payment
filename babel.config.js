module.exports = function(api) {
  api.cache(true);
  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@api': './app/api',
          '@contexts': './app/contexts',
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
