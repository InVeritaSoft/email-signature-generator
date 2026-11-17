// Type declarations for Chrome Extension APIs
// These are minimal declarations for the APIs we use
// For full types, consider installing @types/chrome

declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }
    const local: StorageArea;
  }
  namespace runtime {
    // Set only inside an extension; undefined on ordinary web pages in Chrome
    const id: string | undefined;
    function getURL(path: string): string;
  }
}

