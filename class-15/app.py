class Person:
    pass
    # def __init__(self, name, age, profession):
    #     self.name = name
    #     self.age = age
    #     self.profession = profession

p1 = Person("Ali", 24, "Developer")
p2 = Person( age=30, name="Sara", profession="Designer")
print(p1.__dict__)

print(p1.name)
print(p2.name)



# NEXT CLASS TASK

# How constructors work in Python?
# Inheritance in Python
# Polymorphism in Python