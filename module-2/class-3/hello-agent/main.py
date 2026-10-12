from agents import Agent, Runner, WebSearchTool
from dotenv import load_dotenv

load_dotenv()


agent =Agent(
    name="Hello Agent",
    instructions="You are a helpful weather assistant. Use the web search tool to find the current weather.",
    model="gpt-5-mini",
    tools=[WebSearchTool()]
)

result = Runner.run_sync(agent, "What's the current weather in Karachi?")

print(result.final_output)

