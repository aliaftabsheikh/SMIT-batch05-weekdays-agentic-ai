from agents import Agent, Runner, trace
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


spanish_agent = Agent(
    name="SpanishAgent",
    instructions="Translate information into Spanish you received from the user word by word. If you receive a sentence, translate it word by word and return the translated words in the same order as they were received.",
)

summarizer_agent = Agent(
    name="SummarizerAgent",
    instructions="You are a helpful assistant that can summarize information about users.",
)


coach = Agent(
    name="CoachAgent",
    instructions="You are a helpful assistant that can provide coaching and guidance to users based on their information.Based on the information provided by the SpanishAgent and SummarizerAgent, you will provide coaching and guidance to the user in a clear and concise manner.",
    
    
    tools= [
        spanish_agent.as_tool(
            tool_name="translate_to_spanish",
            tool_description="Translates the given text into Spanish.",
        ),
        
        summarizer_agent.as_tool(
            tool_name="summarize_information",
            tool_description="Summarizes the given information about users.",
        ),
    ]
)


result = Runner.run_sync(
    coach,
    input="Convert Hello into the spanish language.",
    
)

print(result.final_output)