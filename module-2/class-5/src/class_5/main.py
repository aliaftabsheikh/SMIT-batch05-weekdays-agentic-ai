#   ------------- Runner.run_sync -------------

# from agents import Agent, Runner

# from dotenv import load_dotenv

# load_dotenv()


# agent = Agent(
#     name="Agent 1",
#     instructions="You are a helpful assistant.",
# )

# result = Runner.run_sync(agent, "What is the capital of France?")
# print(result.final_output)


# -------------- Runner.run  --------------


# import asyncio

# from agents import Agent, Runner

# from dotenv import load_dotenv

# load_dotenv()


# agent = Agent(
#     name="Agent 1",
#     instructions="You are a helpful assistant.",
# )

# async def main():
#     result = await Runner.run(agent, "Tell me about 1992 world cup final.")
#     print(result.final_output)

# if __name__ == "__main__":
#     asyncio.run(main())



# ------------ Runner.run_streamed ________________


import asyncio
from openai.types.responses import ResponseTextDeltaEvent
from agents import Runner, WebSearchTool, Agent
from dotenv import load_dotenv

load_dotenv()

async def main():
    agent = Agent(
        name="Joke Assistant",
        instructions="You are a helpful assistant. First, determine how many jokes to tell, then provide jokes.",
        tools=[WebSearchTool()],
    )

    result = Runner.run_streamed(agent, input="Tell me about 1992 world cup final.")

    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="----------------------", flush=True)
        elif event.type == "run_item_stream_event" and event.item.type == "tool_call_output_item":
            print(f"\nTool output: {event.item.output}")

    print()

if __name__ == "__main__":
    asyncio.run(main())
    
    
    isinstance("Ali", str)