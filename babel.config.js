module.exports = function (api) {
  api.cache(true);
  const plugins = [
    [
      "module-resolver",
      {
        alias: {
          "@contexts": "./app/contexts",
          "@components": "./app/components",
          "@hooks": "./app/hooks",
          "@tailwind": "./app/tailwind",
        },
      },
    ],
  ];
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
    plugins: plugins,
  };
};
