import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.json",
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts"],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        register: resolve(__dirname, "src/register.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "js" : "cjs";
        return `${entryName}.${ext}`;
      },
    },
    rolldownOptions: {
      external: [
        "react",
        "react-native",
        "react/jsx-runtime",
        "@react-native-async-storage/async-storage",
        // Externalize optional peer dependencies
        "@react-native-clipboard/clipboard",
        "@react-native-google-signin/google-signin",
        "@invertase/react-native-apple-authentication",
        "@wallet-ui/react-native-web3js",
        "react-native-biometrics",
      ],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-native": "ReactNative",
          "react/jsx-runtime": "jsxRuntime",
        },
        preserveModules: false,
      },
      checks: {
        pluginTimings: false,
      },
    },
    sourcemap: "hidden",
    minify: "esbuild",
  },
});
