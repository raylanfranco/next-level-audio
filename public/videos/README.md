# Hero Video

Place your hero background video here as `hero-video.mp4`.

## Video Requirements:
- **Format**: MP4 (H.264 codec recommended for best browser compatibility)
- **Resolution**: 1920x1080 (Full HD) or higher
- **Aspect Ratio**: 16:9
- **Duration**: 10-30 seconds (will loop)
- **File Size**: Optimize for web (aim for under 5MB if possible)
- **Content**: Should showcase your shop, vehicles, or services

## Recommended Tools for Optimization:
- [HandBrake](https://handbrake.fr/) - Free video compression
- [FFmpeg](https://ffmpeg.org/) - Command-line video processing
- Online tools like CloudConvert or Clideo

## Example FFmpeg Command:
```bash
ffmpeg -i input-video.mp4 -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k -movflags +faststart hero-video.mp4
```

## Fallback:
If no video is provided, the hero section will display a gradient background (black to blue).

## Poster Image:
Optionally, add a poster image as `hero-poster.jpg` in the `/public/images/` directory. This will be shown while the video loads.

