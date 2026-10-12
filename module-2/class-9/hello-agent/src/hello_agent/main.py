import asyncio
from dataclasses import dataclass
from agents import Agent, Runner, RunContextWrapper, function_tool
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file



@dataclass
class UserInfo:
	name: str
	age: int
	uid: int


@function_tool
async def fetch_user_info(wrapper: RunContextWrapper[UserInfo]) -> str:
	"""Returns the information of the user."""
	return f"User {wrapper.context.name} is {wrapper.context.age} years old and has UID {wrapper.context.uid}"



def dynamic_instructions(ctx: RunContextWrapper[UserInfo], agent: Agent) -> str:
    """Generates dynamic instructions based on the user information."""
    return f"You are a helpful assistant that can provide information about the user named {ctx.context.name}. The user is {ctx.context.age} years old and has UID {ctx.context.uid}. Please answer questions accordingly and agent name is {agent.name}. Always answer in a friendly manner and call the user by their name and always show the name of the running agent. The name of the running agent is {agent.name}."

async def main():
	user_info = UserInfo(name="Ahmed", age=25, uid=123)
	# agent = Agent[UserInfo](
	# 	name="Assistant",
    #     instructions="You are a helpful assistant that can provide information about users.",
	# 	tools=[fetch_user_info],
	# )
	# result = await Runner.run(
	# 	starting_agent=agent,
	# 	input="What is the information of the user?",
	# 	context=user_info,
	# )
	# print(result.final_output)
 
	math_agent = Agent(
		name="MathAgent",
		instructions=dynamic_instructions,
	)

	result = await Runner.run(
		starting_agent=math_agent,
		input="What is the 18 * 12",
		context=user_info,
	)
	print(result.final_output)


asyncio.run(main())