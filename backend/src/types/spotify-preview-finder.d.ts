declare module 'spotify-preview-finder' {
  interface PreviewResult {
    success: boolean;
    results: Array<{
      trackName: string;
      artistName: string;
      previewUrls: string[];
    }>;
  }

  function spotifyPreviewFinder(
    songName: string,
    artistName?: string,
    limit?: number
  ): Promise<PreviewResult>;

  export = spotifyPreviewFinder;
}

