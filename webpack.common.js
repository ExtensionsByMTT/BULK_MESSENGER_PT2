const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    popup: path.resolve("src/popup/popup.tsx"),
    popup: path.resolve("src/popup/popup.tsx"),
    options: path.resolve("src/options/options.tsx"),
    background: path.resolve("src/background/background.ts"),
    contentScript: path.resolve("src/contentScript/contentScript.tsx"),
    Login: path.resolve("src/pages/Login.tsx"),
    Excel: path.resolve("src/contentScript/Excel.tsx"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve("src/static"),
          to: path.resolve("dist"),
        },
      ],
    }),
    ...getHtmlPlugins(["popup", "options"]),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve("dist"),
  },
  optimization: {
    splitChunks: {
      chunks(chunk) {
        const excludedChunks = ["contentScript", "Login", "Excel"];
        return !excludedChunks.includes(chunk.name);
      },
    },
  },
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlPlugin({
        title: "BULK_MESSENGER",
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}
