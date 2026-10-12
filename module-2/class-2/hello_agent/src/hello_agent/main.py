from agents import Agent, Runner, OpenAIChatCompletionsModel
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
# 1. Point an OpenAI-compatible client at Gemini's endpoint instead of OpenAI's

external_client = AsyncOpenAI(
	api_key=os.getenv("GEMINI_API_KEY"),
	base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# 2. Wrap it as a Chat Completions model the SDK understands
llm_model = OpenAIChatCompletionsModel(
	model="gemini-3.5-flash-lite",
	openai_client=external_client,
)
# 3. Hand that model to the Agent instead of using the default
agent = Agent(name="Assistant", model=llm_model)


result = Runner.run_sync(agent, "Welcome and motivate me to learn Agentic AI.")
print("AGENT RESPONSE:", result.final_output)