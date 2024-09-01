import os
import asyncio
import aiofiles
import zoneinfo

from icalendar import Calendar, Event
from datetime import datetime
from loguru import logger

from fileio import File


async def event_add(
    cal: Calendar, name: str, begin: str, description: str, location: str, end=None
) -> Calendar:
    event = Event()
    date_format = "%Y-%m-%d %H:%M:%S"
    event.add("summary", name)
    event.add(
        "dtstart",
        datetime.strptime(begin, date_format).replace(
            tzinfo=zoneinfo.ZoneInfo("Asia/Shanghai")
        ),
    )
    if end:
        cal = await event_add(cal, name + " 结束", end, description + " 结束", location)
    event.add("description", description)
    event.add("location", location)
    cal.add_component(event)
    return cal


async def generate_ics(output_folder: str, source_name: str, source: str) -> None:
    logger.info(f"generateing {source_name}.ics...")
    c = Calendar()
    different_types = {}
    for event in source.split(";;"):
        event = event.strip()
        if event:
            name, begin, end, description, location = event.split("\n")
            c = await event_add(c, name, begin, description, location, end)
            try:
                single_type = different_types[location.split("-")[1]]
            except KeyError:
                different_types[location.split("-")[1]] = Calendar()
                single_type = different_types[location.split("-")[1]]
            different_types[location.split("-")[1]] = await event_add(
                single_type, name, begin, description, location, end
            )

    async with aiofiles.open(f"{output_folder}/{source_name}.ics", "wb") as ics_file:
        await ics_file.write(c.to_ical())
        logger.info(f"{source_name}.ics DONE.")

    for type_key, type_value in different_types.items():
        async with aiofiles.open(
            f"{output_folder}/{source_name}-{type_key}.ics", "wb"
        ) as ics_file:
            await ics_file.write(type_value.to_ical())
            logger.info(f"{source_name}-{type_key}.ics DONE.")


async def main(source_files_folder: str, output_folder: str) -> None:
    if not os.path.isdir(source_files_folder):
        logger.error("Source folder doesn't exist.")
    tasks = []
    for source_file in os.listdir(os.path.abspath(source_files_folder)):
        if source_file.endswith(".txt"):
            source = await File(
                os.path.join(source_files_folder, source_file)
            ).read_async()
            tasks.append(
                generate_ics(output_folder, os.path.splitext(source_file)[0], source)
            )
    logger.info(f"{len(tasks)} files founded.")
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    logger.add("hoyo_calendar.log", mode="w")
    asyncio.run(main("source", "ics"))
