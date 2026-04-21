import { TimelineLayer } from '../../types';

export class ShotstackService {
  private static instance: ShotstackService;
  private readonly BACKEND_URL = 'http://localhost:3000/render';

  private constructor() {}

  public static getInstance(): ShotstackService {
    if (!ShotstackService.instance) {
      ShotstackService.instance = new ShotstackService();
    }
    return ShotstackService.instance;
  }

  async renderTimeline(layers: TimelineLayer[], aspectRatio: string = '16:9'): Promise<string | null> {
    const mainVideo = layers.find(l => l.type === 'video');
    if (!mainVideo) return null;

    try {
      const response = await fetch(this.BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "user1",
          videoUrl: mainVideo.content,
          start: mainVideo.start,
          end: mainVideo.start + mainVideo.duration,
          aspectRatio: aspectRatio
        })
      });

      if (!response.ok) throw new Error('Shotstack cluster handshake failed.');
      const data = await response.json();
      return data.response.id;
    } catch (error) {
      console.error('Render Protocol Error:', error);
      return null;
    }
  }

  async checkStatus(id: string): Promise<{ status: string, url?: string }> {
    try {
      const response = await fetch(`https://api.shotstack.io/v1/render/${id}`, {
        headers: { 'x-api-key': '3Ie0acSRfw217AaxfltDPMZBTFj0qCsa4ZskPK4G' }
      });
      const data = await response.json();
      return {
        status: data.response.status,
        url: data.response.url
      };
    } catch (error) {
      return { status: 'failed' };
    }
  }
}