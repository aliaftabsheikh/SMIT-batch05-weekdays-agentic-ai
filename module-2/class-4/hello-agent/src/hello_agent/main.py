from agents import Agent, Runner
from dotenv import load_dotenv
import asyncio

load_dotenv()

agent = Agent(
    name = "Hello Agent",
    instructions = "You are a helpful assistant that responds to user input with a friendly greeting.",
)


result = Runner.run_sync(agent, "Hello, how are you?")
print(result.final_output)