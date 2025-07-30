export {};

declare global {
  interface Window {
    reloadStories?: () => void;
  }

  // Or if using strict server/client separation:
  var reloadStories: (() => void) | undefined;
}
