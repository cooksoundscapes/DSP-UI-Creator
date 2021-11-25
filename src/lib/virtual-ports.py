import pyaudio
import websockets
import asyncio
from socket import socket, AF_INET, SOCK_DGRAM
from time import sleep

pa = pyaudio.PyAudio()
window_size = 4096
channels = 1
stream = pa.open(
    format=pyaudio.paFloat32,
    channels=channels,
    rate=44100,
    input=True,
    frames_per_buffer=window_size
)
HOST = "localhost"
PORT = 5678

sock = socket(AF_INET, SOCK_DGRAM)
#async def start_stream(websocket, path):
#    while True:
#        try:
#            data = stream.read(window_size)
#            await websocket.send(data)
#            await asyncio.sleep(.03)
#        except Exception as error:
#           print(error)
#           return
#async def main():
#   async with websockets.serve(start_stream, HOST, PORT):
#       await asyncio.Future()

while True:
    try:
        data = stream.read(window_size)
        sock.sendto(data, (HOST,PORT))
    except KeyboardInterrupt:
        break
    

#asyncio.run(main())



