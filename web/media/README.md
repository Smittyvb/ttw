- `wav` -> `mp3`: `ffmpeg -i ding1.wav -vn -ar 44100 -ac 2 -b:a 192k ding1.mp3`
- `d1.mp3` from https://opengameart.org/content/bell-arpeggio-24 (CC0)
- `d2.mp3` from https://freesound.org/people/MatthewWong/sounds/361564/ (CC0)
- `d3.mp3` from https://freesound.org/people/robni7/sounds/174027/ (CC0)
- `empty.wav` is one sample of silence, used for testing autoplay support. Used to generate the data URL used to check autoplay handling.
- update `../sw.js` wherever you change the audio files
