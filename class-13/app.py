# try:
#     result = 10 + "0"
#     print("The result is:", result)
# except ZeroDivisionError:
#     print("Error: You cannot divide by zero.")
# except TypeError:
#     print("Error: Invalid data type used in the operation.")
# except :
#     print("An unexpected error occurred.")

# try:
#     result = 10 / 2
# except ZeroDivisionError:
#     print("Cannot divide by zero!")
# else:
#     print(f"Division successful. Result: {result}")
# finally:
#     print("This block will always execute")


# def divide_numbers(a, b):
#     try:
#         result = a / b  # Test this block for errors
#     except ZeroDivisionError:
#         print("Error: Cannot divide by zero!")
#     except TypeError:
#         print("Error: Invalid input type. Numbers required.")
#     else:
#         print(f"Division successful. Result: {result}")
#     finally:
#         print("Operation complete.\n")

# # Test cases
# divide_numbers(10, 2)  # Successful division
# divide_numbers(10, 0)  # ZeroDivisionError
# divide_numbers(10, "2")  # TypeError


try:
    # result = 10 / 0
    # print("The result is:", result)
    raise ValueError("Apna error hai !")
# # except ZeroDivisionError:
# #     print("Error: You cannot divide by zero.")
# # except TypeError:
# #     print("Error: Invalid data type used in the operation.")
except Exception as e :
    print("An unexpected error occurred.")
    print("Error details:", str(e))

