def add(a, b):
    sum = a + b
    return sum
   
def subtract(a, b):
    difference = a - b
    return difference

def multiply(a, b):
    product = a * b
    return product
   
def divide(a, b):
    if b != 0:
        quotient = a / b
        return quotient
    else:
        return "Error: Division by zero is not allowed."