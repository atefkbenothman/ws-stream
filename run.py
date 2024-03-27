#!/usr/bin/env python3
import asyncio
import itertools
import json
import pprint


def load_data(file_name: str) -> dict[str, dict]:
  with open(file_name, "r") as f:
    data = json.load(f)
  return data


def print_stream(stream: dict[str, float]) -> None:
  pprint.pprint(stream)
  return


def get_stream():
  # data = load_data("./data/stream-power.json")
  data = load_data("./data/stream.json")

  categories = [
    "moving",
    "velocity_smooth",
    "grade_smooth",
    "distance",
    "altitude",
    "time",
    "watts"
  ]

  data_list = [data[cat]["data"] if cat in data else [] for cat in categories]

  for moving, velocity, grade, distance, altitude, second, watts in itertools.zip_longest(*data_list):
    stream = {
      "moving": moving,
      "velocity": round(velocity * 2.23694, 2),
      "grade": grade,
      "distance": round(distance * 0.000621371, 2),
      "altitude": round(altitude * 3.28084, 2),
      "second": second,
      "watts": watts
    }
    yield stream

async def stream_data():
  async for stream in get_stream():
    print(json.dumps(stream))
    await asyncio.sleep(0.5)


