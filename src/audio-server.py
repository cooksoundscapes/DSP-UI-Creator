from flask import Flask, render_template, Response, request
import pyaudio

pa = pyaudio.PyAudio()
window_size = 4096
channels = 1
HOST = "localhost"
PORT = 5678

def genHeader(sampleRate, bitsPerSample, channels):
    datasize = 2000*10**6
    o = bytes("RIFF",'ascii')                                               # (4byte) Marks file as RIFF
    o += (datasize + 36).to_bytes(4,'little')                               # (4byte) File size in bytes excluding this and RIFF marker
    o += bytes("WAVE",'ascii')                                              # (4byte) File type
    o += bytes("fmt ",'ascii')                                              # (4byte) Format Chunk Marker
    o += (16).to_bytes(4,'little')                                          # (4byte) Length of above format data
    o += (1).to_bytes(2,'little')                                           # (2byte) Format type (1 - PCM)
    o += (channels).to_bytes(2,'little')                                    # (2byte)
    o += (sampleRate).to_bytes(4,'little')                                  # (4byte)
    o += (sampleRate * channels * bitsPerSample // 8).to_bytes(4,'little')  # (4byte)
    o += (channels * bitsPerSample // 8).to_bytes(2,'little')               # (2byte)
    o += (bitsPerSample).to_bytes(2,'little')                               # (2byte)
    o += bytes("data",'ascii')                                              # (4byte) Data Chunk Marker
    o += (datasize).to_bytes(4,'little')                                    # (4byte) Data size in bytes
    return o

app = Flask(__name__)

@app.route('/stream', methods=['GET'])
def streaming():
    def compute():
        bitsPerSample = 16
        wav_header = genHeader(44100, bitsPerSample, channels)
        first_run = True
        stream = pa.open(
            format=pyaudio.paInt16,
            channels=channels,
            rate=44100,
            input=True,
            frames_per_buffer=window_size
        )
        while True:
            if first_run:
                print('first run, prepending header!')
                data = wav_header + stream.read(window_size)
                first_run = False
            else:
                data = stream.read(window_size)
            yield(data)
    if request.method == 'GET':
        return Response(compute())

if __name__ == '__main__':
    app.run(HOST, PORT)

