from socket import socket, AF_INET, SOCK_DGRAM
from time import sleep
import jack

HOST = "localhost"
PORT = 5678
sock = socket(AF_INET, SOCK_DGRAM)

jackCli = jack.Client("Reface DSP")
ninputs = 2
channels = [jackCli.inports.register(f'input_{i}') for i in range(ninputs)]
systemPorts = jackCli.get_ports(is_audio=True, is_output=True, is_physical=True)

@jackCli.set_process_callback
def process_audio(nframes):
    buffer = channels[0].get_buffer()
    sock.sendto(buffer, (HOST,PORT))

print(f"Activating Jack client. Sending data to UDP port {PORT};")
jackCli.activate()

while True:
    try:
        sleep(500)
    except KeyboardInterrupt:
        break



