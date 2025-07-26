---
title : 'Audio Formats Primer'
subtitle: 'Sharing what I have learned while building Voice Agents'
date : '2025-07-26T12:38:47+05:30'
draft : true
tags : ['agents', 'AI', 'voice']
toc: true
next: true
image: ''
---

## A little backstory
So for those of you who don't know, I have been working as a Backend and AI engineer at [Superdash](https://superdash.ai/) for two weeks at the time I am writing this. And so far, I have worked on voice based AI agents and made them sound more natural. And, I'm sharing whatever I have scratched my head for. You can use this as a reference while building anything related to voice based communication over the internet.

## Let's start with the transfers
Before we dig in the details, let's see what are some ways to efficiently get your voice or text data from any external API, because unless you are running your own servers, you must be using some TTS provider to get you that sweet sweet voice. Now most commonly, you must have seen either of these ways to get the voice data you want.
- REST API
- WebSockets Streaming
- gRPC

For the average Joe, it is either REST or WebSockets. To build a real time voice agents, you should already be using WebSockets. REST API should only be used if you want to save the voice data to a file, cause it has higher latency and your users wouldn't like that. So websockets it is, cause it offers low latency, real time streaming and what not. If you are gRPC, you already know more than me what are you dealing with.

So now we have to optimize our websockets to be as fast as it can be, while maintaining a balanced tradeoff with quality. Basically, the only thing affecting the performance is the bandwidth. How much data are we sending over the  websockets makes a huge difference in the quality. Send more than what the users need, and you are wasting that precious bandwidth, send less, and the users cannot hear a single word. This is where we step into the world of compression and encoding of audio data.

## The glorious land of formats and encodings
When you hear the word audio format, you might think of .mp3, .wav etc etc. But here is a important distinction. These are file extensions, and they represent how the data is packaged or structured. They provide standardized ways for your audio players to read the data and play it as intended. When dealing with AI agents, we mainly use PCM or u-law. So that is what I'll be covering here.

### Why we do not use mp3 for streaming TTS?
I an .mp3 file, the data is stored in sequence of frames, each frame has a compressed data with its relevant header that describes how to decode that frame. Here is a rough visualization of the mp3 file.

```
+----------------------------+  
| Optional ID3 Metadata     | ← Info like title, artist  
+----------------------------+   
| Frame 1                   |   
| ├── Header (4 bytes)      |   
| └── Compressed Audio Data |   
+----------------------------+   
| Frame 2                   |   
| ├── Header                |   
| └── Audio Data            |   
+----------------------------+   
| ...                       |   
+----------------------------+   
```

Because of the way data is in individual frames, and not continuous, it is not suitable to send in streams, since a partial frame is no good, we need extra frames in the buffer to decode ahead of time, which only introduces more latency. That's why using mp3 as streaming format will most likely result in choppy audio. This is further complicated by how websockets handle continuous data. MP3 over raw WebSocket or TCP lacks protocol semantics, meaning the websocket has no idea where the data starts or ends, how to deal with packet loss because mp3 frame sizes are variable. The lack of timing information also doesn't work in the favor mp3, so you need to manually track playback time if you're synchronizing with other media (like doing any post processing).

## Here comes the PCM
It is the most raw format you can get your audio in. It stands for **Pulse-Code Modulation**. It represents sound as a sequence of discrete samples, each one capturing the amplitude of the audio waveform at a specific moment in time. And since it is just continuous stream of data, it is very easy to be played while streaming, given the player knows about the properties beforehand, since PCM is headless, it has no metadata to tell the receiver what to expect and how to deal with it.

PCM data if we are saving it in a file container, adds header to it, making it easier to deal with. Typically saved as `.wav` or `.aiff` files.

![PCM Wave form](/blog-assets/pcm-wave.png)

### **Speaking of properties**
While dealing with PCM, you need to agree the following settings:

  - **Sample Rate:** 
        Defines how many samples taken per second from the analog signal. The bigger the better. Since it is a *rate*, it is defined in Hz. Typically we use:    
        - **8,000Hz (8Khz)**: To use over telephone calls   
        - **16,000Hz (16Khz)**: Widely uses TTS standard, speech is crystal clear, helpful if you plan to add some effects or post process the audio further.   
        - **44,100Hz (44.1Khz)**: CD Quality, you will rarely need this much data just for speech in AI agents. 
  
  - **Bit Depth:**
        The number of bits used to represent each sample’s amplitude. Higher bit depth = better dynamic range and less quantization noise.  
        - **8-bit**: Used in μ-law (compressed voice)   
        - **16-bit**: Standard for PCM speech (−32,768 to 32,767)   
        - **24/32-bit**: Music, not used for voice agents   
  
  - **Byte Order:**
        This defines how the multi-byte values are stored in memory/stream. Basically two main ways:    
        - **Little-endian**: **Least Significant Bit** first (0x01 0x00 = 1)
  
  - **Channel**
        **Stereo** or **Mono**. Does each of your ear receive its own audio, or the same. For voice agents, we mostly use Mono audio cause we just need voice data. Adding channel only requires more bandwidth..

#### Putting it all together, Let’s say your ASR model expects:
```
16 kHz
16-bit signed PCM
Little-endian
Mono
```
You must send:
```
[0x3A 0x00][0x2F 0xFF][0x18 0x00]... → Each 2 bytes = 1 sample
```

If you:
- Send 44.1kHz: Model sees distorted speed/pitch
- Send 8-bit: Model input is too coarse, loses phoneme accuracy
- Send wrong endianness: Sample values are garbage

So far, we are dealing with only linear data. There is another format called **μ-law** that encodes data in logarithmic scale instead of linear. This provides higher compression ratio making it more suitable for telephony calls since bandwidth there is even more limiting. That's why telephone providers like Twilio only support sending μ-law audio in 8Khz which is just enough for the other person to hear the voice clearly.

## All Hail μ-law
μ-law is a form of non-linear quantization used to encode audio, specifically speech, into a smaller bandwidth while preserving intelligibility. It compresses 16-bit linear PCM into 8-bit samples using a logarithmic scale.

Let's break down what I just said, say you have a 16-bit signed PCM sample. To convert it into μ-law:

1. **Compress it using logarithmic formula:**   
   ```
   μ-law(x) = sign(x) * (ln(1 + μ * |x| / Xmax) / ln(1 + μ))
   ```
    where:  
    - `μ` = 255 (fixed constant)    
    - `Xmax` = max 16-bit PCM value = 32767

2. **Quantize to 8 Bits**   
    Quantization is the process of mapping a large set of continuous amplitude values (e.g., 16-bit signed integers) to a smaller set of discrete values (e.g., 8-bit values).
    It helps in reducing bit depth for compression or transmission, since it is very inefficient to store infinitely precise amplitudes when just sending voice.

    #### But why **Logarithmic Quantization**?   
    Human speech s not linearly distributed, most meaningful features lie in low amplitudes. μ-law expands quiet amplitudes, making them more discernible even in 8 bits.

    The basic maths behind this is just:
    ```
    F(x) = sign(x) * (ln(1 + μ * |x| / A) / ln(1 + μ))
    ```

    Where:
   - `x` is the linear PCM sample (range: −A to +A).
   - `A` is the maximum amplitude (usually 32768 for 16-bit PCM).
   - `μ` is a constant (255 for μ-law).
   - `sign(x)` retains polarity.   
   This squeezes the linear range into a logarithmic curve, favoring low amplitudes.

3. **Adding Bias**
   After 