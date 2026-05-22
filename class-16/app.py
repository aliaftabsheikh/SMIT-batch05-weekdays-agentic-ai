class Person:
    def __init__(self, name, age, city):
       self.name = name
       self.age = age
       self.city = city
       
    def greet(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old from {self.city}."
    


p1 = Person("John", 30, "New York")
# p2 = Person("Jane", 25, "Los Angeles")
# p3 = Person( age=35, name="Bob", city="Chicago")

print(p1.greet())
# print(p2.greet())
# print(p3.greet())

# print(p1.__dict__)
# print(p2.__dict__)
# print(p3.__dict__)


class Employee(Person):
    def __init__(self, name, age, city, job_title):
        super().__init__(name, age, city)
        self.job_title = job_title  
        
    def greet(self):
        return f"Hello, my name is {self.name}, I am a {self.job_title} and I am {self.age} years old from {self.city}."
    
e1 = Employee("Alice", 28, "San Francisco", "Software Engineer")
print(e1.__dict__)

print(e1.greet())