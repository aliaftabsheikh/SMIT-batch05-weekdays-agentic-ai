#! Static function 


import random



# def greeting():
#     print("Hello, World!")
    
# for _ in range(20):
#     greeting()

#! Dynamic function


# def greeting(name = "Guest", age = 0, profession = "Unknown"):
#     print(f"Hello, {name}! You are {age} years old and work as a {profession}.")
    
    
#! Positional arguments
# greeting("Ali", 30 ,"Engineer")

# #! Keyword arguments
# greeting( profession="Engineer", name="Alice")
    
# greeting("Alice", 30, "Engineer")
# greeting("Bob", 25, "Designer")
# greeting("Charlie", 35, "Manager")
# greeting("Dave", 40, "Analyst")
# greeting("Eve", 28, "Developer")
    


    
# names = ["Alice", "Bob", "Charlie", "Dave", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Karl", "Leo", "Mallory", "Nina", "Oscar", "Peggy", "Quentin", "Ruth", "Sybil", "Trent", "Uma", "Victor", "Walter", "Xavier", "Yvonne", "Zara"]


# for guest in guests:
#     greeting(guest)
    

# def modify_value(x):   # Pass by Value
#     x = 10
#     print("Within function:", x)

# # Immutable object (integer)
# x = 5
# print("Original:", x)
# modify_value(x)
# print("After function:", x)


# Pass by Reference

# def modify_list(lst):   # Pass by Reference
#     lst.append(10)
#     print("Within function:", lst)
    
# my_list = [1, 2, 3]

# print("Original:", my_list)
# modify_list(my_list)
# print("After function:", my_list)


# def greet():
#     name = "Ali"
#     print(f"Hello, {name}!")
    
#     return name


# name = greet()
# print("Returned name:", name)


# def add(x: int,y: int=0) -> float:
#    return float(x + y)

# print(float(add(10,20)))

# print(add(y=50.0, x=2.0)) # type hints are not enforced in Python

# print(add(x=5))


# def multiple_numbers(a , b , *args):
    
#     sum = a + b
#     for num in args:
#         sum += num
#         # print("Additional number:", num)
        
        
#     return sum


# print(multiple_numbers(1, 2, 3, 4, 5, 6, 7, 8, 9, 10))
# print(multiple_numbers(1, 2, 3, 4, 5))
# print(multiple_numbers(1, 2, 3, 4, 5, 6, 7))


def my_sum(a, b, *args):
    print("List of numbers: ", a)
    print("List of numbers: ", b)
    print("Additional numbers: ", args)


print("Sum: ", my_sum(*[1,2,3,4,5,8,5])) # *  unpacking list
