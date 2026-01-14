# Video Section Setup Guide

## YouTube Video Integration

The video section uses a lightbox modal to display YouTube videos. Here's how to set it up:

## Getting YouTube Video IDs

1. Go to your YouTube video
2. Copy the video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Extract the video ID (the part after `v=`, e.g., `dQw4w9WgXcQ`)

## Single Video Setup

In `app/page.tsx`, update the VideoSection component:

```tsx
<VideoSection 
  defaultVideoId="YOUR_VIDEO_ID_HERE"
  defaultVideoTitle="Your Video Title"
/>
```

## Multiple Videos Setup

To display multiple videos in a grid:

```tsx
<VideoSection 
  videos={[
    { 
      id: 'video-id-1', 
      title: 'Car Audio Installation',
      thumbnail: '/images/video-thumb-1.jpg' // Optional custom thumbnail
    },
    { 
      id: 'video-id-2', 
      title: 'Window Tinting Process' 
    },
    { 
      id: 'video-id-3', 
      title: 'Customer Testimonial' 
    },
  ]}
/>
```

## Features

- **Lightbox Modal**: Click any video thumbnail to open in fullscreen modal
- **Auto-play**: Videos start playing when opened
- **Keyboard Support**: Press `Escape` to close
- **Click Outside**: Click the backdrop to close
- **Responsive**: Works on all screen sizes
- **Custom Thumbnails**: Optionally provide custom thumbnail images

## Customization

The video section uses the black/blue/white color scheme:
- Black background
- Blue play button
- White text
- Smooth animations and hover effects

## Example Video IDs from Next Level Audio

Based on your YouTube channel (`UCydhO-F6br25qlkWEOQBeBQ`), you can:
1. Visit your channel
2. Find your best videos
3. Copy their video IDs
4. Add them to the VideoSection component

