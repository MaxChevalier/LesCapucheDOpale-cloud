module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],

    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],

    client: {
      jasmine: { random: true },
      clearContext: false,
    },

    reporters: ["progress", "kjhtml", "coverage"],

    coverageReporter: {
      dir: require("path").join(__dirname, "./coverage"),
      subdir: ".",
      reporters: [
        { type: "html" },
        { type: "text-summary" },
        { type: "lcovonly" },
      ],
      check: {
        global: {
          statements: 75,
          lines: 75,
          branches: 75,
          functions: 75,
        },
      },
      fixWebpackSourcePaths: true,
      includeAllSources: true,
    },

    browsers: [],

    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--mute-audio'
        ],
      },
    },

    autoWatch: true,
    restartOnFileChange: true,
    singleRun: false,

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: Infinity,

    buildAngular: {
      options: {
        codeCoverage: true,
        codeCoverageExclude: [
          "**/environment*.ts",
          "**/main.ts",
          "**/polyfills.ts",
          "**/*.spec.ts",
        ],
      },
    },
  });
};
