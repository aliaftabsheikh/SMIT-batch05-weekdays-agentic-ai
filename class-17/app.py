class Admissions :
    
    def __init__(self, name, age, grade):
        self.name = name
        self.age = age
        self.grade = grade
        
    def greeting(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old. My grade is {self.grade}."
        

class UniversityAdmissions(Admissions):
    def __init__(self, name, age, grade, department):
        
        super().__init__(name=name, age=age, grade=grade)
        self.department = department
        
    def greeting(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old. My grade is {self.grade} and I am applying to the {self.department} department."

u1 = UniversityAdmissions("Alice Brown", 21, "A", "Computer Science")
print(u1.__dict__)
print(u1.greeting())


a1 = Admissions("John Doe", 18, "A")

print(a1.greeting())
# a2 = Admissions("Jane Smith", 19, "B")
# a3 = Admissions("Bob Johnson", 20, "C")
# print(a1.__dict__)
# print(a2.__dict__)
# print(a3.__dict__)