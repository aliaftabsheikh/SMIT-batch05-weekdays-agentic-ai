# INHERITENCE/ POLYMORPHISM

# class Person:
#     def __init__(self, name, age, profession):
#         self.name = name
#         self.age = age
#         self.profession = profession
        
#     def greet(self):
#         print(f"Hello, my name is {self.name} and I am {self.age} years old. I work as a {self.profession}. ")
        
        
    
# p1 = Person("Alice", 30, "Engineer")
# print(p1.__dict__)  # Output: {'name': 'Alice', 'age': 30, 'profession': 'Engineer'}




# class Employee(Person):
#     def __init__(self, name, age, profession, employee_id):
#         super().__init__(name, age, profession)
#         self.employee_id = employee_id
        
#     def greet(self):
#         print(f"Hello, my name is {self.name}, I am {self.age} years old, and I work as a {self.profession}. My employee ID is {self.employee_id}.")

# e1 = Employee("Bob", 25, "Designer", "E001")
# print(e1.__dict__)  

# e1.greet()


#! ENCAPSULATION

# class BankAccount:
#     def __init__(self, account_number, balance):
#         self.account_number = account_number
#         # self.__balance = balance  # Private attribute
#         self._acc_protected_bal = balance  # Protected attribute
        
        
# b1 = BankAccount("123456789", 1000)


# class SavingsAccount(BankAccount):
#     def __init__(self, account_number, balance, interest_rate):
#         super().__init__(account_number, balance)
#         self.interest_rate = interest_rate
        
        
#     def calculate_interest(self):
#         return self._balance * self.interest_rate / 100

# # b1.__dict__balance =1000000000000000000000000000000000000000

# # b1._acc_protected_bal
# print(b1.__dict__)  




# ABSTRACTION 