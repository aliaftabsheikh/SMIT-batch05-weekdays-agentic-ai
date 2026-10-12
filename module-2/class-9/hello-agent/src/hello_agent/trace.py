from agents import Agent, Runner, trace
from dotenv import load_dotenv
import asyncio

load_dotenv()  # Load environment variables from .env file

agent1 = Agent(
    name="Agent1",
    instructions="You are a helpful assistant that can provide information about users.",
)

agent2 = Agent(
    name="Agent2",
    instructions="You are a helpful assistant that can provide information about users.",
)


async def main():
    with trace(workflow_name="Agents Execution Trace"):
        result_one = await Runner.run(
            starting_agent=agent1,
            input="What is the information of the user?",
        )
        
        result_two = await Runner.run(
            starting_agent=agent2,
            input="What is the information of the user?",
        )
        
        print(result_one.final_output)
        print(result_two.final_output)
    
    
asyncio.run(main())