#!/usr/bin/env python3
import json
import asyncio
import websockets
import time

from run import get_stream

SERVER = "localhost"
PORT = 8765

stream = get_stream()

connected = set()

async def stream_data():
  while True:
    try:
      S = next(stream)
      for client in connected:
        await client.send(json.dumps(S))
      await asyncio.sleep(0.2)
    except StopIteration:
      break

async def echo(websocket, path):
  connected.add(websocket)
  print(f"client connected", connected)
  try:
    await stream_data()
  except websockets.exceptions.ConnectionClosedOK:
    pass
  finally:
    connected.remove(websocket)
    print(f"client disconnected", connected)

async def main():
  server = await websockets.serve(echo, SERVER, PORT)
  print(f"server started on {SERVER}:{PORT}")

  # start stream_data in a separate task
  # asyncio.create_task(stream_data())

  await server.wait_closed()

if __name__ == "__main__":
  asyncio.run(main())