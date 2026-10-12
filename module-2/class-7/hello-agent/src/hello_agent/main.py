from agents import Agent, Runner, set_tracing_disabled, function_tool,ModelSettings
from dotenv import load_dotenv
import asyncio
from agents.run import RunConfig



# set_tracing_disabled(False)
load_dotenv()




# agent = Agent(
#     name="Study Coach",
#     instructions="You are a study coach that helps students learn and retain information effectively. Provide guidance, tips, and strategies for studying, time management, and exam preparation.",
# )

# config = RunConfig(
#     model="gpt-5-mini",
#     tracing_disabled=True,
# )

@function_tool
def get_weather(city: str)-> str:
    print(f"Fetching weather for {city}...")
    """
    Get the current weather information for a given city.

    Args:
        city (str): The name of the city to get the weather for. 

    Returns:
        str: A string describing the current weather in the specified city.
    """
    return f"The current weather in {city} is sunny with a temperature of 30°C."


weather_agent = Agent(
    name="Weather Agent",
    instructions="You are a weather agent that provides accurate and up-to-date weather information. Answer questions about current weather conditions, forecasts, and climate-related topics. Use the get_weather tool to fetch weather data for specific cities.",
    tools=[get_weather],
    model="gpt-4o-mini",
    model_settings=ModelSettings(
        tool_choice="required",
        ),
)

result = Runner.run_sync(weather_agent, "What is the current weather in New York City?")

print(result.final_output)

# async def main():
#     # result = await Runner.run(agent, "Hello! Tell me about the python decorators and how they work." )
    
  
#     # print(result.final_output)
    
#     result = await Runner.run(weather_agent, "What is the current weather in New York City?")
#     print(result.final_output)
    
    
# if __name__ == "__main__":
#     asyncio.run(main())