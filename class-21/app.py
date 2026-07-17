class Car:
    # Parameterized constructor
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model
        print(f"A {self.brand} {self.model} has been created.")

    # Destructor
    def __del__(self):
        print(f"The {self.brand} {self.model} has been destroyed.")

    # Method to display car details
    def display(self):
        print(f"Car: {self.brand} {self.model}")

# Create an object of the Car class
my_car = Car("Toyota", "Corolla")
my_car1 = Car("Toyota", "Corolla")

# Access attributes and call methods
print(f"My car is a {my_car.brand} {my_car.model}.")  # Output: My car is a Toyota Corolla.
my_car.display()  # Output: Car: Toyota Corolla


# Explicitly delete the object (triggers the destructor)
# del my_car  #


class MyClassTest(object):
# 
  @staticmethod
  def static_method_self(self):
    print("Static Method: " + str(self))

  @staticmethod
  def class_method_cls(cls):
    print("Class Method: " + str(cls))

obj = MyClassTest()

obj.static_method_self()