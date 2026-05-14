# print("Hello Chippa man !")

fruits: list = ["apple", "banana", "cherry"]

fruits[1] = "blueberry"

fruits.append("orange")
# fruits.extend(["grape", "kiwi"])

# fruits.remove("kiwi")
# deleted_fruit = fruits.pop(3)

# print(fruits)
# print(f"Deleted fruit: {deleted_fruit}")


random_numbers: list = [5, 2, 9, 1, 5, 6]

#! Ascending order

# random_numbers.sort()

# print(random_numbers)

#! Descending order

# random_numbers.sort(reverse=True)
# print(random_numbers)

# Sorting by String Length (key=len)

# words = ["apple", "kiwi", "banana"]
# words.sort(key=len)
# print(words)  # Output: ['kiwi', 'apple', 'banana']

# alphabetical_characters = ["a", "c", "b", "e", "d"]
# alphabetical_characters.sort()
# print(alphabetical_characters)  # Output: ['a', 'b', 'c', 'd', 'e']



# fruits: list = ["apple", "banana", "cherry"]

# fruits_tuple: tuple = tuple(fruits)

# print(fruits_tuple)  # Output: ('apple', 'banana', 'cherry')


tuple_1: tuple = (10, 20, 30) # tuple
tuple_2: tuple = (10, 20, 30, 40) # tuple

print("id(tuple_1) = ", id(tuple_1)) # unique memory address
print("id(tuple_2) = ", id(tuple_2))

print("tuple_1 == tuple_2: ", tuple_1 == tuple_2) 
print("tuple_1 is tuple_2: ", tuple_1 is tuple_2)