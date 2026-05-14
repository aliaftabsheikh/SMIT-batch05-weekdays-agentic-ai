# person:dict = {
#     # "name": "John Doe",
#     "age": 30,
#     "city": "New York",
#     "cnic": "12345-6789012-3"
# }

# # person["email"] = "john@example.com"
# # person["age"] = 31

# print(person.get("name", "Not Found"))
# # del person["cnic"]

# print("Keys:", person.keys())
# print("Values:", person.values())
# print("Items:", person.items()) 
# # print("Clear:", person.clear())

# print("Update:", person.update({"name": "Alice Smith", "age": 28}))

# print("Person:", person)



# thisdict: dict = {
#   "brand": "Ford",
#   "model": "Mustang",
#   "year": 1964,
#   "year": 2020 ,
  
#   "owners": {
#       "owner1": "John Doe",
#       "owner2": "Jane Smith",
#     "owner3": "Alice Johnson"
#   }
  
# }


# thisdict["owners"]["owner1"]
# # print(thisdict)




# # for key, value in thisdict.items():
# #     print(f"{key}")
# #     print(f"{value}")



# SET In Python


# myset = {"apple", "banana", "cherry", "Apple", "banana"}
# print(myset) 

# nums: list[int] = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# myset2: set = set(nums)
# print(myset2)


# set2: set = {'Java', 'Python', 'JavaScript', 'java'}
# print(set2)

my_set: set = {1, 2, 3, 4, 5}

# try:
#     my_set[0] = 10  # Sets are unordered, so indexing doesn't work
# except TypeError as e:
#     print(e)
    
# print("HELLO CHIPPA MAN !")

# my_set.remove(6)  # Removes the element 3 from the set
# print(my_set)

# remove_item = my_set.discard(6)  
# print(remove_item)  # Output: None (discard does not raise an error if the element is not found)
# print(my_set)

my_set: set = {1, 2, 3, 4, 5, 'A', 'a'}
print("Before: my_set = ", my_set)
my_set.difference_update({1, 2,3,4,5, 'A'})
print("After:  my_set = ", my_set)